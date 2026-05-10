import json
from typing import Dict, List, Any

class SafetyAgent:
    """Specialist in Hallucination Detection and Medication Safety."""
    def __init__(self, client):
        self.client = client

    def run(self, clinical_state: Dict[str, Any], reasoning: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Review the clinical state and reasoning below:
        State: {json.dumps(clinical_state)}
        Reasoning: {json.dumps(reasoning)}
        
        1. Hallucination Check: Are there any diagnosis or symptoms mentioned in reasoning not supported by the clinical state?
        2. Medication Guard: Are there any absolute contraindications or dangerous drug-drug interactions?
        3. Compliance: Ensure professional medical disclaimers are present.
        
        Return ONLY valid JSON with 'hallucinations', 'safety_flags', and 'disclaimer'.
        """
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
