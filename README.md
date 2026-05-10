# Clinical Copilot — Solo Fast Build

An autonomous clinical decision support system that operates in a multi-stage reasoning pipeline to analyze doctor-patient transcripts and produce structured medical insights.

## Project Structure

- `copilot.py`: The core reasoning engine (Python).
- `output.json`: Sample structured output from a real-world clinical scenario.
- `sample_transcript.txt`: A complex demo transcript used for testing.
- `frontend/`: A premium React + Vite dashboard for the copilot.

## Features

1. **Entity Extraction**: Automated parsing of demographics, complaints, and symptoms.
2. **Clinical Reasoning**: Diagnostic inference based on clinical evidence.
3. **SOAP Note Generation**: Professional medical documentation (Subjective, Objective, Assessment, Plan).
4. **Drug Safety Check**: Automated interaction and contraindication screening.
5. **ICD-10 Suggestion**: Relevant medical coding with clinical justification.
6. **Confidence Scoring**: Reliability assessment of the generated output.

## How to Run

### Core Analysis
You can run the core logic standalone:
```bash
python copilot.py
```

### Premium Dashboard
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Design Aesthetics
The dashboard uses a **Modern Clinical Architecture** with:
- Glassmorphism effects.
- Clean typography (Inter).
- High-contrast clinical color palette.
- Responsive grid layout.
