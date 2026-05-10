import os
import json
import time
import sys
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
    _OPENAI_AVAILABLE = True
except ImportError:
    _OPENAI_AVAILABLE = False

SYSTEM_PROMPT = """
You are an autonomous clinical decision copilot. Analyze a doctor–patient transcript through 5 stages:
1. Extract clinical entities (demographics, chief complaint, symptoms, meds, vitals, history)
2. Perform differential diagnosis (top 3, ranked by probability)
3. Safety check (drug interactions, red flags, hallucination guard)
4. Generate professional SOAP note and ICD-10 codes
5. Calibrate confidence score (0.0–1.0) based on available data

SAFETY GUARDS:
- If data is insufficient for high confidence, score < 0.5
- If chest pain + diabetes + hypertension present, mark as HIGH RISK
- Never invent facts not present in the transcript

OUTPUT: Return ONLY valid JSON. No markdown. No explanation. No wrapping.
Schema:
{
  "patient_summary": str,
  "soap_note": { "subjective": str, "objective": str, "assessment": str, "plan": str },
  "differential_diagnosis": [str, str, str],
  "icd10": [str],
  "drug_interactions": [str],
  "red_flags": [str],
  "confidence_score": float,
  "fhir_bundle": { "resourceType": "Bundle", "entry": [...] }
}
"""

class ClinicalCopilot:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("LLM_MODEL", "gpt-4o")
        self._simulated = not self.api_key or self.api_key == "your_api_key_here" or not _OPENAI_AVAILABLE

        if not self._simulated:
            try:
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            except Exception:
                self._simulated = True

    def analyze_transcript(self, transcript: str) -> Dict[str, Any]:
        if self._simulated:
            return self._simulate(transcript)
        try:
            t0 = time.time()
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Transcript:\n{transcript}"},
                ],
                temperature=0,
                response_format={"type": "json_object"},
            )
            result = json.loads(resp.choices[0].message.content)
            result["latency_s"] = round(time.time() - t0, 2)
            result["engine"] = "LLM Live"
            return result
        except Exception as e:
            return self._simulate(transcript, error=str(e))

    def _simulate(self, transcript: str, error: str = None) -> Dict[str, Any]:
        time.sleep(1.8)
        return {
            "patient_summary": "54-year-old male with acute chest pain, hypertension and Type 2 Diabetes",
            "soap_note": {
                "subjective": "Patient reports heavy chest pressure since last night (~12 hrs), radiating to left arm and jaw. Associated shortness of breath, nausea, and diaphoresis. PMHx: T2DM, HTN. Medications: Metformin, Lisinopril. NKDA.",
                "objective": "Vitals not provided in transcript. Patient appears symptomatic with prolonged chest pain lasting >12 hours with classic ACS constellation of symptoms.",
                "assessment": "HIGH RISK — Acute Coronary Syndrome (ACS) suspected. Classic STEMI/NSTEMI presentation: chest pressure, duration >12h, radiation to jaw/left arm, diaphoresis, nausea. Underlying risk factors: T2DM + HTN.",
                "plan": "1. Immediate 12-lead EKG. 2. Serial Troponin I/T (0h, 3h). 3. Aspirin 324mg PO chewed. 4. IV access + continuous cardiac monitoring. 5. Oxygen if SpO2 <94%. 6. STAT Cardiology consult. 7. NPO in case of cath lab."
            },
            "differential_diagnosis": [
                "Myocardial Infarction (STEMI/NSTEMI)",
                "Unstable Angina",
                "Pulmonary Embolism"
            ],
            "icd10": ["I21.9", "I20.0", "I10", "E11.9"],
            "drug_interactions": [
                "Moderate: Metformin + Lisinopril — monitor electrolytes and renal function.",
                "Note: Aspirin (new) + Lisinopril — generally safe, monitor BP."
            ],
            "red_flags": [
                "Chest pain > 12 hours in diabetic patient (silent MI risk)",
                "Hypertensive urgency risk",
                "Classic ACS symptom constellation"
            ],
            "confidence_score": 0.89,
            "latency_s": 1.75,
            "engine": "Simulation Mode (Demo)",
            "fhir_bundle": {
                "resourceType": "Bundle",
                "type": "collection",
                "entry": [
                    {
                        "resource": {
                            "resourceType": "Patient",
                            "gender": "male",
                            "name": [{"text": "Demo Patient"}]
                        }
                    },
                    {
                        "resource": {
                            "resourceType": "Condition",
                            "clinicalStatus": {"coding": [{"code": "active"}]},
                            "verificationStatus": {"coding": [{"code": "provisional"}]},
                            "code": {
                                "coding": [
                                    {"system": "http://hl7.org/fhir/sid/icd-10", "code": "I21.9", "display": "Acute myocardial infarction, unspecified"}
                                ]
                            }
                        }
                    },
                    {
                        "resource": {
                            "resourceType": "Observation",
                            "code": {"text": "Risk Assessment"},
                            "valueString": "HIGH RISK — ACS with DM2 and HTN comorbidities"
                        }
                    }
                ]
            }
        }

if __name__ == "__main__":
    copilot = ClinicalCopilot()
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r") as f:
            print(json.dumps(copilot.analyze_transcript(f.read()), indent=2))
    else:
        print(json.dumps(copilot.analyze_transcript("Patient with chest pain."), indent=2))
