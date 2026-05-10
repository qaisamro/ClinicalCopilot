import os
import time
import json
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

from agents.extraction import ExtractionAgent
from agents.reasoning import ReasoningAgent
from agents.safety import SafetyAgent
from agents.output import OutputAgent

load_dotenv()

class Orchestrator:
    """LangGraph-style state orchestrator for clinical reasoning."""
    
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
        
        self.simulated = not self.api_key or self.api_key == "your_api_key_here"
        
        if not self.simulated:
            self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        else:
            self.client = None # Will trigger simulation fallback
            
        self.extractor = ExtractionAgent(self.client)
        self.reasoner = ReasoningAgent(self.client)
        self.safety = SafetyAgent(self.client)
        self.formatter = OutputAgent(self.client)

    def run(self, transcript: str) -> Dict[str, Any]:
        if self.simulated:
            return self._run_simulation(transcript)
            
        start_time = time.time()
        
        # 1. Extraction Phase
        print("[Agent] Extracting clinical context...")
        clinical_state = self.extractor.run(transcript)
        
        # 2. Reasoning Phase
        print("[Agent] Performing differential diagnosis...")
        reasoning = self.reasoner.run(clinical_state)
        
        # 3. Safety Phase
        print("[Agent] Validating safety and clinical accuracy...")
        safety = self.safety.run(clinical_state, reasoning)
        
        # 4. Output Phase
        print("[Agent] Formatting medical documentation and FHIR resources...")
        final_output = self.formatter.run(clinical_state, reasoning, safety)
        
        latency = time.time() - start_time
        
        # Consolidate results
        final_output["clinical_state"] = clinical_state
        final_output["reasoning_metadata"] = reasoning
        final_output["safety_review"] = safety
        final_output["latency_s"] = round(latency, 2)
        final_output["engine"] = "Multi-Agent Orchestrator (Live)"
        
        return final_output

    def _run_simulation(self, transcript: str) -> Dict[str, Any]:
        """High-fidelity multi-agent simulation for hackathon demos. Matches pitch JSON."""
        time.sleep(2.2) # Simulate multi-agent overhead
        
        return {
            "patient_summary": "54-year-old male with chest pain and hypertension history",
            "soap_note": {
                "subjective": "54-year-old male with sudden onset 'elephant-like' chest pressure. History of DM2 and HTN.",
                "objective": "Tachycardic (112), Hypertensive (165/98), SpO2 94%. Appears diaphoretic.",
                "assessment": "High suspicion for Acute Coronary Syndrome (ACS). Differentials: AMI, Unstable Angina, PE.",
                "plan": "Urgent EKG, Cardiac Enzymes (Troponin), Aspirin 324mg, Cardiology Notify."
            },
            "icd10": ["I20.0", "I10", "E11.9"],
            "drug_interactions": ["Moderate interaction: Metformin + Lisinopril. Monitor renal function."],
            "red_flags": ["Chest pressure + diabetic risk", "Hypertensive urgency"],
            "differential_diagnosis": [
                "Myocardial infarction",
                "Unstable Angina",
                "Pulmonary Embolism"
            ],
            "confidence_score": 0.86,
            "latency_s": 2.15,
            "engine": "Multi-Agent Orchestrator (Simulation)",
            "fhir_bundle": {
                "resourceType": "Bundle",
                "entry": [
                    {"resource": {"resourceType": "Patient", "name": [{"text": "Mr. Smith"}]}},
                    {"resource": {"resourceType": "Condition", "code": {"coding": [{"code": "I20.0"}]}}}
                ]
            }
        }
