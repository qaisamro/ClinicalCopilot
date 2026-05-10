import json
from typing import Dict, Any

class OutputAgent:
    """Specialist in Medical Documentation (SOAP) and Interoperability (FHIR)."""
    def __init__(self, client):
        self.client = client

    def run(self, state: Dict[str, Any], reasoning: Dict[str, Any], safety: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Generate final outputs based on the consolidated medical state.
        
        Input State: {json.dumps(state)}
        Reasoning: {json.dumps(reasoning)}
        Safety Review: {json.dumps(safety)}
        
        Tasks:
        1. Professional SOAP Note.
        2. Patient Summary in plain language.
        3. ICD-10 and CPT code mapping.
        4. FHIR-compatible JSON structure (Observation, Condition, Patient).
        
        Return ONLY valid JSON.
        """
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
