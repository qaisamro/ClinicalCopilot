from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from copilot import ClinicalCopilot
import uvicorn

app = FastAPI(
    title="Clinical Copilot API",
    description="Real-time multi-agent AI clinical decision support",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscriptRequest(BaseModel):
    transcript: str

# Single global instance (warm start)
copilot = ClinicalCopilot()

@app.post("/analyze")
async def analyze(request: TranscriptRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is required.")
    return copilot.analyze_transcript(request.transcript)

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "simulation" if copilot._simulated else "live-llm"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
