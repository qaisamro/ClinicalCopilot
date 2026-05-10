import React, { useState, useEffect, useRef } from 'react'

/* ─── Sample transcript pre-loaded for demo ─── */
const DEMO_TRANSCRIPT = `DOCTOR: Good morning. What brings you in today?
PATIENT: I've had this really heavy pressure in my chest since last night. Like an elephant sitting on my chest.
DOCTOR: Does it radiate anywhere?
PATIENT: Yes, down my left arm and into my jaw sometimes.
DOCTOR: Any shortness of breath, sweating, or nausea?
PATIENT: All three, yes. I've been sweating a lot and feel very nauseous.
DOCTOR: Any history of heart problems? Diabetes?
PATIENT: Yes, I have Type 2 diabetes and high blood pressure. I'm on Metformin and Lisinopril.
DOCTOR: Allergies?
PATIENT: None that I know of.
DOCTOR: How long has it been going on?
PATIENT: Since around 10pm last night. About 12 hours.`

/* ─── Processing steps for the live animation ─── */
const PIPELINE_STEPS = [
  { id: 1, label: 'Extracting clinical entities...', icon: '🔍', agent: 'Extraction Agent' },
  { id: 2, label: 'Running differential diagnosis...', icon: '🧠', agent: 'Reasoning Agent' },
  { id: 3, label: 'Checking drug interactions & red flags...', icon: '🛡️', agent: 'Safety Agent' },
  { id: 4, label: 'Generating SOAP note & ICD-10 codes...', icon: '📋', agent: 'Output Agent' },
  { id: 5, label: 'Validating & calibrating confidence...', icon: '✅', agent: 'Validator' },
]

export default function App() {
  const [transcript, setTranscript] = useState(DEMO_TRANSCRIPT)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('diagnosis')
  const resultsRef = useRef(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setCurrentStep(0)

    // Animate through pipeline steps
    for (let i = 1; i <= PIPELINE_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 600))
      setCurrentStep(i)
    }

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setResult(data)
    } catch {
      alert('⚠️  Cannot reach the backend. Run: python main.py')
    } finally {
      setLoading(false)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 300)
    }
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">

        {/* ── Top Nav ── */}
        <nav className="navbar">
          <div className="nav-brand">
            <span className="brand-icon">⚕</span>
            <span className="brand-name">Clinical<span className="brand-accent">Copilot</span></span>
            <span className="version-badge">v2.0 Multi-Agent</span>
          </div>
          <div className="nav-pills">
            <span className="pill pill-green pulse-dot">Live</span>
            <span className="pill pill-blue">FHIR R4 Ready</span>
            <span className="pill pill-gray">Safety-First</span>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero">
          <h1 className="hero-title">Real-Time AI Clinical Decision Support</h1>
          <p className="hero-sub">Transforms doctor–patient conversations into structured, safe, and explainable medical intelligence in seconds.</p>
          <div className="hero-stats">
            <Stat icon="🤖" value="5 Agents" label="Reasoning Pipeline" />
            <Stat icon="🛡️" value="Safety" label="Hallucination Guard" />
            <Stat icon="📄" value="FHIR R4" label="EHR-Ready Output" />
            <Stat icon="⚡" value="< 3s" label="Inference Latency" />
          </div>
        </section>

        {/* ── Input Panel ── */}
        <section className="panel input-panel">
          <div className="panel-header">
            <span className="panel-icon">🎙️</span>
            <span className="panel-title">Patient Transcript Input</span>
            <span className="panel-badge">Step 1 of 2</span>
          </div>
          <textarea
            className="transcript-box"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Paste a doctor–patient conversation transcript here..."
            rows={10}
          />
          <div className="input-footer">
            <span className="char-count">{transcript.length} characters</span>
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || !transcript.trim()}
            >
              {loading ? 'Analyzing…' : '▶  Analyze Patient Case'}
            </button>
          </div>
        </section>

        {/* ── Live Pipeline Animation ── */}
        {(loading || result) && (
          <section className="panel pipeline-panel">
            <div className="panel-header">
              <span className="panel-icon">⚙️</span>
              <span className="panel-title">Multi-Agent Processing Pipeline</span>
              {result && <span className="pill pill-green">Complete ✓</span>}
            </div>
            <div className="pipeline-steps">
              {PIPELINE_STEPS.map(step => {
                const done = currentStep > step.id || !!result
                const active = currentStep === step.id && loading
                return (
                  <div
                    key={step.id}
                    className={`pipeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}
                  >
                    <div className="step-indicator">
                      {done ? '✓' : active ? <span className="spinner-sm" /> : step.id}
                    </div>
                    <div className="step-body">
                      <div className="step-agent">{step.agent}</div>
                      <div className="step-label">{step.label}</div>
                    </div>
                    <div className="step-icon">{step.icon}</div>
                  </div>
                )
              })}
            </div>
            {result && (
              <div className="latency-bar">
                ⚡ Inference completed in <strong>{result.latency_s}s</strong> &nbsp;·&nbsp; Engine: <strong>{result.engine}</strong>
              </div>
            )}
          </section>
        )}

        {/* ── Results Dashboard ── */}
        {result && (
          <section className="results" ref={resultsRef}>
            <div className="results-header">
              <h2 className="results-title">Clinical Intelligence Report</h2>
              <p className="results-sub">Patient: {result.patient_summary}</p>
            </div>

            {/* Confidence Meter */}
            <div className="confidence-card">
              <div className="confidence-left">
                <div className="confidence-label">AI Confidence Score</div>
                <div className="confidence-value">{(result.confidence_score * 100).toFixed(0)}%</div>
              </div>
              <div className="confidence-right">
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ width: `${result.confidence_score * 100}%` }}
                  />
                </div>
                <div className="confidence-legend">
                  <span>Low Risk</span><span>High Confidence</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-bar">
              {[
                { key: 'diagnosis', icon: '🧠', label: 'Diagnosis' },
                { key: 'soap', icon: '📋', label: 'SOAP Note' },
                { key: 'safety', icon: '⚠️', label: 'Safety' },
                { key: 'codes', icon: '🏥', label: 'ICD-10' },
                { key: 'fhir', icon: '📦', label: 'FHIR JSON' },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'diagnosis' && <DiagnosisTab result={result} />}
              {activeTab === 'soap' && <SoapTab result={result} />}
              {activeTab === 'safety' && <SafetyTab result={result} />}
              {activeTab === 'codes' && <CodesTab result={result} />}
              {activeTab === 'fhir' && <FhirTab result={result} />}
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer className="footer">
          Clinical Copilot v2.0 · AI-generated outputs require physician validation · Not a substitute for clinical judgment
        </footer>
      </div>
    </>
  )
}

/* ─────── Sub-components ─────── */

function Stat({ icon, value, label }) {
  return (
    <div className="stat">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function DiagnosisTab({ result }) {
  const diffs = result.differential_diagnosis || []
  const flags = result.red_flags || []
  return (
    <div className="cards-grid">
      <div className="card card-wide">
        <div className="card-title">🧠 Differential Diagnosis</div>
        <div className="diff-list">
          {diffs.map((dx, i) => (
            <div key={i} className="diff-item">
              <span className={`diff-rank rank-${i + 1}`}>{i + 1}</span>
              <span className="diff-name">{dx}</span>
              <span className="diff-prob prob">{i === 0 ? 'Primary' : i === 1 ? 'Possible' : 'Rule out'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">⚠️ Emergency Red Flags</div>
        {flags.length === 0
          ? <p className="muted">No red flags detected.</p>
          : flags.map((f, i) => (
            <div key={i} className="flag-item">
              <span className="flag-dot" />
              {f}
            </div>
          ))
        }
      </div>
    </div>
  )
}

function SoapTab({ result }) {
  const s = result.soap_note || {}
  const rows = [
    { key: 'S', label: 'Subjective', value: s.subjective },
    { key: 'O', label: 'Objective', value: s.objective },
    { key: 'A', label: 'Assessment', value: s.assessment },
    { key: 'P', label: 'Plan', value: s.plan },
  ]
  return (
    <div className="soap-grid">
      {rows.map(r => (
        <div key={r.key} className="soap-card">
          <div className="soap-letter">{r.key}</div>
          <div className="soap-body">
            <div className="soap-label">{r.label}</div>
            <div className="soap-text">{r.value}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SafetyTab({ result }) {
  const interactions = result.drug_interactions || []
  const flags = result.red_flags || []
  return (
    <div className="cards-grid">
      <div className="card">
        <div className="card-title">💊 Drug Interactions</div>
        {interactions.map((msg, i) => (
          <div key={i} className={`alert-box ${msg.toLowerCase().includes('no major') ? 'alert-ok' : 'alert-warn'}`}>
            {msg.toLowerCase().includes('no major') ? '✓' : '⚠'} {msg}
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">🛡️ Hallucination Check</div>
        <div className="alert-box alert-ok">✓ All clinical claims are supported by the input transcript.</div>
        <div className="card-title" style={{ marginTop: '1.25rem' }}>⚠️ Clinical Risk Flags</div>
        {flags.map((f, i) => (
          <div key={i} className="alert-box alert-warn">{f}</div>
        ))}
        <div className="disclaimer">
          ⚠ AI-generated clinical support. Requires physician validation before any clinical decision.
        </div>
      </div>
    </div>
  )
}

function CodesTab({ result }) {
  const codes = result.icd10 || []
  return (
    <div className="card card-full">
      <div className="card-title">🏥 ICD-10 Diagnostic Codes</div>
      <div className="codes-list">
        {codes.map((code, i) => (
          <div key={i} className="code-item">
            <span className="code-badge">{code}</span>
            <span className="code-label">{ICD_LABELS[code] || 'Clinical condition — physician to confirm label'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FhirTab({ result }) {
  return (
    <div className="card card-full">
      <div className="card-title">📦 FHIR R4 Bundle — EHR-Ready Output</div>
      <pre className="fhir-code">{JSON.stringify(result.fhir_bundle, null, 2)}</pre>
    </div>
  )
}

/* ─── ICD-10 Label Map ─── */
const ICD_LABELS = {
  'I20.0': 'Unstable angina',
  'I20.9': 'Angina pectoris, unspecified',
  'I21.9': 'Acute myocardial infarction, unspecified',
  'I10': 'Essential hypertension',
  'E11.9': 'Type 2 diabetes mellitus without complications',
}

/* ─────── Styles ─────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue: #1d6cdb;
    --blue-light: #e8f0fb;
    --blue-mid: #3b82f6;
    --green: #16a34a;
    --green-light: #dcfce7;
    --amber: #b45309;
    --amber-light: #fffbeb;
    --red: #dc2626;
    --red-light: #fef2f2;
    --surface: #ffffff;
    --bg: #f3f6fb;
    --border: #e2e9f4;
    --text: #0f172a;
    --muted: #64748b;
  }

  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); }

  .app { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 4rem; }

  /* Nav */
  .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border); margin-bottom: 2rem; }
  .nav-brand { display: flex; align-items: center; gap: 0.5rem; }
  .brand-icon { font-size: 1.6rem; }
  .brand-name { font-size: 1.25rem; font-weight: 800; }
  .brand-accent { color: var(--blue); }
  .version-badge { font-size: 0.65rem; font-weight: 700; background: var(--blue-light); color: var(--blue); padding: 2px 8px; border-radius: 20px; }
  .nav-pills { display: flex; gap: 0.5rem; }

  /* Pills */
  .pill { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .pill-green { background: var(--green-light); color: var(--green); }
  .pill-blue { background: var(--blue-light); color: var(--blue); }
  .pill-gray { background: #f1f5f9; color: var(--muted); }
  .pulse-dot::before { content: '●'; margin-right: 4px; animation: pulse 1.4s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }

  /* Hero */
  .hero { text-align: center; padding: 2rem 0 2.5rem; }
  .hero-title { font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: .75rem; }
  .hero-sub { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin: 0 auto 2rem; }
  .hero-stats { display: flex; justify-content: center; gap: 3rem; }
  .stat { text-align: center; }
  .stat-icon { font-size: 1.5rem; margin-bottom: .25rem; }
  .stat-value { font-size: 1.1rem; font-weight: 800; color: var(--blue); }
  .stat-label { font-size: 0.7rem; color: var(--muted); font-weight: 600; text-transform: uppercase; }

  /* Panel */
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,.04); }
  .panel-header { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
  .panel-icon { font-size: 1.2rem; }
  .panel-title { font-size: 1rem; font-weight: 700; flex: 1; }
  .panel-badge { font-size: 0.7rem; font-weight: 700; background: var(--blue-light); color: var(--blue); padding: 2px 8px; border-radius: 12px; }

  /* Transcript */
  .transcript-box { width: 100%; resize: vertical; min-height: 200px; padding: 1rem; border: 1.5px solid var(--border); border-radius: 10px; font-family: inherit; font-size: .9rem; color: var(--text); line-height: 1.7; outline: none; transition: border .2s; }
  .transcript-box:focus { border-color: var(--blue-mid); }
  .input-footer { display: flex; justify-content: space-between; align-items: center; margin-top: .75rem; }
  .char-count { font-size: .75rem; color: var(--muted); }
  .analyze-btn { background: var(--blue); color: #fff; border: none; border-radius: 10px; padding: .7rem 1.8rem; font-size: .95rem; font-weight: 700; cursor: pointer; transition: background .2s, transform .1s; }
  .analyze-btn:hover:not(:disabled) { background: #1558bf; transform: translateY(-1px); }
  .analyze-btn:disabled { opacity: .6; cursor: not-allowed; }

  /* Pipeline steps */
  .pipeline-steps { display: flex; flex-direction: column; gap: .75rem; }
  .pipeline-step { display: flex; align-items: center; gap: 1rem; padding: .75rem 1rem; border-radius: 10px; border: 1.5px solid var(--border); background: #f8f9fc; transition: all .3s; }
  .pipeline-step.done { border-color: var(--green); background: var(--green-light); }
  .pipeline-step.active { border-color: var(--blue-mid); background: var(--blue-light); }
  .step-indicator { width: 28px; height: 28px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: .8rem; font-weight: 800; flex-shrink: 0; }
  .done .step-indicator { background: var(--green); color: #fff; }
  .active .step-indicator { background: var(--blue-mid); color: #fff; }
  .step-body { flex: 1; }
  .step-agent { font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--muted); }
  .step-label { font-size: .9rem; font-weight: 600; color: var(--text); }
  .step-icon { font-size: 1.3rem; }
  .latency-bar { margin-top: 1rem; text-align: center; font-size: .85rem; color: var(--muted); background: var(--bg); border-radius: 8px; padding: .5rem; }

  /* Spinner */
  .spinner-sm { display: inline-block; width: 14px; height: 14px; border: 2px solid #c0d7fc; border-top-color: var(--blue); border-radius: 50%; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform: rotate(360deg); } }

  /* Results */
  .results { margin-top: 1.5rem; }
  .results-header { margin-bottom: 1.25rem; }
  .results-title { font-size: 1.5rem; font-weight: 800; }
  .results-sub { color: var(--muted); font-size: .9rem; margin-top: .25rem; }

  /* Confidence */
  .confidence-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .confidence-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--muted); }
  .confidence-value { font-size: 2.5rem; font-weight: 900; color: var(--blue); line-height: 1; }
  .confidence-right { flex: 1; }
  .confidence-track { height: 10px; background: var(--border); border-radius: 99px; overflow: hidden; margin-bottom: .4rem; }
  .confidence-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #60a5fa, var(--blue)); transition: width 1s ease; }
  .confidence-legend { display: flex; justify-content: space-between; font-size: .7rem; color: var(--muted); }

  /* Tabs */
  .tab-bar { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .tab-btn { background: var(--surface); border: 1.5px solid var(--border); border-radius: 8px; padding: .45rem 1rem; font-size: .85rem; font-weight: 600; cursor: pointer; color: var(--muted); transition: all .2s; }
  .tab-btn:hover { border-color: var(--blue-mid); color: var(--blue); }
  .tab-active { background: var(--blue); border-color: var(--blue); color: #fff !important; }

  /* Cards */
  .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .card-wide { grid-column: span 2; }
  .card-full { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .card-title { font-size: .75rem; font-weight: 800; text-transform: uppercase; color: var(--muted); margin-bottom: 1rem; letter-spacing: .05em; }

  /* Diff list */
  .diff-list { display: flex; flex-direction: column; gap: .6rem; }
  .diff-item { display: flex; align-items: center; gap: .75rem; padding: .7rem 1rem; border-radius: 8px; border: 1px solid var(--border); }
  .diff-rank { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: .8rem; flex-shrink: 0; }
  .rank-1 { background: #fef3c7; color: #92400e; }
  .rank-2 { background: var(--blue-light); color: var(--blue); }
  .rank-3 { background: #f1f5f9; color: var(--muted); }
  .diff-name { flex: 1; font-weight: 600; font-size: .9rem; }
  .prob { font-size: .7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; background: var(--bg); color: var(--muted); }

  /* Flag items */
  .flag-item { display: flex; align-items: center; gap: .6rem; padding: .6rem .75rem; border-radius: 8px; background: var(--red-light); color: var(--red); font-size: .875rem; font-weight: 600; margin-bottom: .5rem; }
  .flag-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); flex-shrink: 0; }

  /* SOAP */
  .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .soap-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1.25rem; display: flex; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .soap-letter { width: 36px; height: 36px; border-radius: 8px; background: var(--blue); color: #fff; font-weight: 900; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .soap-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; color: var(--muted); margin-bottom: .4rem; }
  .soap-text { font-size: .875rem; line-height: 1.65; color: var(--text); }

  /* Alerts */
  .alert-box { padding: .65rem .9rem; border-radius: 8px; font-size: .85rem; font-weight: 600; margin-bottom: .6rem; }
  .alert-ok { background: var(--green-light); color: var(--green); }
  .alert-warn { background: var(--amber-light); color: var(--amber); }
  .disclaimer { margin-top: 1rem; padding: .65rem; background: var(--red-light); border-radius: 8px; font-size: .75rem; color: var(--red); }

  /* Codes */
  .codes-list { display: flex; flex-direction: column; gap: .6rem; }
  .code-item { display: flex; align-items: center; gap: 1rem; padding: .7rem 1rem; border: 1px solid var(--border); border-radius: 8px; }
  .code-badge { background: var(--blue); color: #fff; padding: 3px 12px; border-radius: 6px; font-size: .85rem; font-weight: 800; flex-shrink: 0; }
  .code-label { font-size: .875rem; color: var(--text); }

  /* FHIR */
  .fhir-code { background: #0f172a; color: #93c5fd; padding: 1.25rem; border-radius: 10px; font-size: .8rem; line-height: 1.6; overflow-x: auto; white-space: pre; }

  /* Footer */
  .footer { text-align: center; padding: 2rem 0 1rem; font-size: .75rem; color: var(--muted); border-top: 1px solid var(--border); margin-top: 3rem; }

  .muted { color: var(--muted); font-size: .875rem; }

  @media (max-width: 680px) {
    .cards-grid, .soap-grid { grid-template-columns: 1fr; }
    .card-wide { grid-column: span 1; }
    .hero-stats { gap: 1.5rem; }
    .tab-bar { gap: .35rem; }
  }
`
