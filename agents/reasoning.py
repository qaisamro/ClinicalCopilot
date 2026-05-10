import json
from typing import Dict, Any

class ReasoningAgent:
    """Specialist in Clinical Logic, Differential Diagnosis, and Risk Stratification."""
    def __init__(self, client):
        self.client = client

    def run(self, clinical_state: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
        Analyze the following clinical data: {json.dumps(clinical_state)}
        1. Generate a prioritized Differential Diagnosis list.
        2. Perform Risk Stratification (Low/Medium/High).
        3. Identify Red Flags (emergency indicators).
        Return ONLY valid JSON.
        """
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
