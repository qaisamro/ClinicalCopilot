import json
from typing import Dict, Any

class ExtractionAgent:
    """Specialist in Clinical Entity Recognition."""
    def __init__(self, client):
        self.client = client

    def run(self, transcript: str) -> Dict[str, Any]:
        prompt = f"""
        Extract clinical entities from the transcript below.
        Identify: Demographics, Chief Complaint, Symptoms, Medications, Vitals, Medical History.
        Return ONLY valid JSON.
        
        Transcript: {transcript}
        """
        # In this hackathon version, we use the LLM to structure the initial state
        response = self.client.chat.completions.create(
            model="gpt-4o", # Default for agent
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
