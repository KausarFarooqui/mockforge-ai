import { useState, useEffect, useRef, useCallback } from "react";
import { generateRender, pollStatus, getImageUrl } from "./api";

const POLL_INTERVAL = 2000;

const TEMPLATES = [
  { label: "Luxury Perfume", prompt: "white crystal perfume bottle on black marble with dramatic side lighting" },
  { label: "Gold Watch", prompt: "gold luxury watch on dark velvet surface with spotlight lighting" },
  { label: "Red Sneaker", prompt: "red leather sneaker on clean white background with soft studio lighting" },
  { label: "Coffee Ritual", prompt: "hot espresso coffee cup with steam on rustic wooden table warm golden light" },
  { label: "Tech Minimal", prompt: "matte black smartphone on dark gradient background minimal studio lighting" },
  { label: "Skincare Glow", prompt: "white skincare cream bottle on white marble with soft diffused natural lighting" },
  { label: "Sunglasses", prompt: "black aviator sunglasses on concrete surface with dramatic shadow lighting" },
  { label: "Whiskey Glass", prompt: "crystal whiskey glass with ice on dark oak table with warm amber lighting" },
];

const STAGES = [
  { key: "queued",         label: "Queuing",           pct: 5  },
  { key: "interpreting",   label: "Enhancing Prompt",  pct: 25 },
  { key: "rendering",      label: "Generating Image",  pct: 75 },
  { key: "complete",       label: "Complete",          pct: 100 },
];

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  const set = useCallback(v => {
    setVal(v);
    localStorage.setItem(key, JSON.stringify(v));
  }, [key]);
  return [val, set];
}

export default function App() {
  const [tab, setTab] = useState("studio"); // studio | gallery | history
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState("idle");
  const [jobStatus, setJobStatus] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [gallery, setGallery] = useLocalStorage("mf_gallery", []);
  const [history, setHistory] = useLocalStorage("mf_history", []);
  const [selectedImage, setSelectedImage] = useState(null);
  const pollRef = useRef(null);
  const textareaRef = useRef(null);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  const handleGenerate = async (p) => {
    const q = (p || prompt).trim();
    if (!q || phase === "loading") return;
    setPhase("loading");
    setJobStatus(null);
    setElapsed(0);
    setError("");

    // Save to history
    setHistory(prev => [{ prompt: q, time: Date.now() }, ...prev.slice(0, 19)]);

    try {
      const { job_id } = await generateRender(q);
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const data = await pollStatus(job_id);
          setJobStatus(data);
          setElapsed(data.elapsed || 0);
          if (data.status === "complete") {
            stopPolling();
            setPhase("done");
            setGallery(prev => [{
              url: data.image_url,
              prompt: q,
              time: Date.now(),
              id: job_id,
            }, ...prev.slice(0, 49)]);
          } else if (data.status === "error") {
            stopPolling();
            setError(data.error || "Unknown error");
            setPhase("error");
          }
        } catch (e) { console.error(e); }
      }, POLL_INTERVAL);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
      setPhase("error");
    }
  };

  const handleReset = () => { stopPolling(); setPhase("idle"); setJobStatus(null); setElapsed(0); setError(""); };
  const handleDownload = async (url, p) => {
    const res = await fetch(getImageUrl(url));
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mockforge-${Date.now()}.png`;
    a.click();
  };

  useEffect(() => () => stopPolling(), []);

  const currentStage = STAGES.find(s => s.key === jobStatus?.status) || STAGES[0];

  return (
    <div className="app">
      {/* Noise texture overlay */}
      <div className="noise" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L28 8V24L16 30L4 24V8L16 2Z" stroke="#C9A96E" strokeWidth="1.5" fill="none"/>
              <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="#C9A96E" fillOpacity="0.2" stroke="#C9A96E" strokeWidth="1"/>
              <circle cx="16" cy="15" r="2.5" fill="#C9A96E"/>
            </svg>
            <div>
              <div className="brand-name">MOCKFORGE</div>
              <div className="brand-sub">AI STUDIO</div>
            </div>
          </div>

          <nav className="nav">
            {["studio", "gallery", "history"].map(t => (
              <button key={t} className={`nav-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t === "studio" && "Studio"}
                {t === "gallery" && `Gallery ${gallery.length > 0 ? `(${gallery.length})` : ""}`}
                {t === "history" && "History"}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <div className="status-pill">
              <span className="status-dot" />
              LIVE
            </div>
          </div>
        </div>
      </header>

      <main className="main">

        {/* ── STUDIO TAB ── */}
        {tab === "studio" && (
          <div className="studio">

            {phase === "idle" && (
              <>
                <div className="hero">
                  <div className="hero-kicker">PRODUCT VISUALIZATION</div>
                  <h1 className="hero-title">
                    Turn words into<br/>
                    <em>photorealistic</em><br/>
                    product images
                  </h1>
                  <p className="hero-desc">Powered by Stable Diffusion XL. Describe any product and get a professional render in seconds.</p>
                </div>

                <div className="input-section">
                  <div className="input-card">
                    <div className="input-label">YOUR PROMPT</div>
                    <textarea
                      ref={textareaRef}
                      className="prompt-input"
                      value={prompt}
                      onChange={e => setPrompt(e.target.value.slice(0, 500))}
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                      placeholder="Describe your product... e.g. 'white ceramic perfume bottle on black marble with dramatic lighting'"
                      rows={3}
                    />
                    <div className="input-footer">
                      <span className="char-count">{prompt.length}/500</span>
                      <button
                        className="generate-btn"
                        onClick={() => handleGenerate()}
                        disabled={prompt.trim().length < 3}
                      >
                        <span>Generate</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="templates-section">
                    <div className="templates-label">QUICK TEMPLATES</div>
                    <div className="templates-grid">
                      {TEMPLATES.map((t, i) => (
                        <button key={i} className="template-chip" onClick={() => { setPrompt(t.prompt); handleGenerate(t.prompt); }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {gallery.length > 0 && (
                  <div className="recent-section">
                    <div className="section-title">RECENT RENDERS</div>
                    <div className="recent-grid">
                      {gallery.slice(0, 4).map((item, i) => (
                        <div key={i} className="recent-card" onClick={() => { setSelectedImage(item); }}>
                          <img src={getImageUrl(item.url)} alt={item.prompt} className="recent-img" />
                          <div className="recent-overlay">
                            <p className="recent-prompt">{item.prompt.slice(0, 60)}…</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {phase === "loading" && (
              <div className="loading-view">
                <div className="loading-visual">
                  <div className="ring ring-outer" />
                  <div className="ring ring-mid" />
                  <div className="ring ring-inner" />
                  <div className="ring-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                </div>
                <div className="loading-text">
                  <div className="loading-stage">{currentStage?.label || "Processing..."}</div>
                  <div className="loading-elapsed">{elapsed}s</div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${currentStage?.pct || 5}%` }} />
                </div>
                <div className="loading-prompt">"{(prompt).slice(0, 80)}{prompt.length > 80 ? "…" : ""}"</div>
                <button className="cancel-btn" onClick={handleReset}>Cancel</button>
              </div>
            )}

            {phase === "done" && jobStatus && (
              <div className="result-view">
                <div className="result-badge">✦ RENDER COMPLETE</div>
                <div className="result-frame">
                  <img src={getImageUrl(jobStatus.image_url)} alt="render" className="result-img" />
                  <div className="result-actions-overlay">
                    <button className="overlay-btn" onClick={() => handleDownload(jobStatus.image_url, prompt)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
                <div className="result-prompt">"{prompt}"</div>
                <div className="result-btns">
                  <button className="btn-primary" onClick={() => handleDownload(jobStatus.image_url, prompt)}>
                    Download PNG
                  </button>
                  <button className="btn-secondary" onClick={handleReset}>
                    New Render
                  </button>
                  <button className="btn-ghost" onClick={() => setTab("gallery")}>
                    View Gallery
                  </button>
                </div>
              </div>
            )}

            {phase === "error" && (
              <div className="error-view">
                <div className="error-icon">⚠</div>
                <h2 className="error-title">Generation Failed</h2>
                <p className="error-msg">{error}</p>
                <button className="btn-primary" onClick={handleReset}>Try Again</button>
              </div>
            )}
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {tab === "gallery" && (
          <div className="gallery-tab">
            <div className="tab-header">
              <h2 className="tab-title">Your Gallery</h2>
              <span className="tab-count">{gallery.length} renders</span>
            </div>
            {gallery.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◇</div>
                <p>No renders yet. Go to Studio and generate your first image.</p>
                <button className="btn-primary" onClick={() => setTab("studio")}>Open Studio</button>
              </div>
            ) : (
              <div className="gallery-grid">
                {gallery.map((item, i) => (
                  <div key={i} className="gallery-card" onClick={() => setSelectedImage(item)}>
                    <img src={getImageUrl(item.url)} alt={item.prompt} className="gallery-img" />
                    <div className="gallery-card-overlay">
                      <p className="gallery-card-prompt">{item.prompt.slice(0, 80)}</p>
                      <div className="gallery-card-actions">
                        <button className="card-btn" onClick={e => { e.stopPropagation(); handleDownload(item.url, item.prompt); }}>
                          Download
                        </button>
                        <button className="card-btn" onClick={e => { e.stopPropagation(); setPrompt(item.prompt); setTab("studio"); }}>
                          Reuse
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div className="history-tab">
            <div className="tab-header">
              <h2 className="tab-title">Prompt History</h2>
              <button className="btn-ghost small" onClick={() => setHistory([])}>Clear All</button>
            </div>
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◇</div>
                <p>No history yet. Generate some images first.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item, i) => (
                  <div key={i} className="history-item">
                    <div className="history-content">
                      <p className="history-prompt">{item.prompt}</p>
                      <span className="history-time">{new Date(item.time).toLocaleString()}</span>
                    </div>
                    <button className="btn-ghost small" onClick={() => { setPrompt(item.prompt); setTab("studio"); }}>
                      Reuse
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── LIGHTBOX ── */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>
            <img src={getImageUrl(selectedImage.url)} alt="" className="lightbox-img" />
            <div className="lightbox-footer">
              <p className="lightbox-prompt">"{selectedImage.prompt}"</p>
              <div className="lightbox-actions">
                <button className="btn-primary" onClick={() => handleDownload(selectedImage.url, selectedImage.prompt)}>Download PNG</button>
                <button className="btn-secondary" onClick={() => { setPrompt(selectedImage.prompt); setSelectedImage(null); setTab("studio"); }}>Reuse Prompt</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=DM+Mono:wght@300;400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0C0C0D;
          --bg2: #111113;
          --bg3: #18181C;
          --border: #242428;
          --border2: #32323A;
          --gold: #C9A96E;
          --gold2: #E8D5A3;
          --gold-dim: #8A7250;
          --text: #EDE8DF;
          --text2: #8A8680;
          --text3: #4A4846;
          --red: #C0504A;
          --green: #6BAF8A;
        }

        html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'Cormorant Garamond', Georgia, serif; overflow-x: hidden; }

        /* Noise */
        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .app { min-height: 100vh; display: flex; flex-direction: column; }

        /* Header */
        .header {
          position: sticky; top: 0; z-index: 100;
          border-bottom: 1px solid var(--border);
          background: rgba(12,12,13,0.92);
          backdrop-filter: blur(24px);
        }
        .header-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 32px; height: 68px;
          display: flex; align-items: center; gap: 32px;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-name {
          font-family: 'Cinzel', serif; font-size: 15px; font-weight: 600;
          letter-spacing: 3px; color: var(--gold2);
        }
        .brand-sub {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 3px; color: var(--gold-dim); margin-top: 1px;
        }
        .nav { display: flex; gap: 2px; margin-left: auto; }
        .nav-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 2px; color: var(--text2);
          padding: 8px 16px; border-radius: 4px;
          text-transform: uppercase; transition: all 0.2s;
        }
        .nav-btn:hover { color: var(--text); background: var(--bg3); }
        .nav-btn.active { color: var(--gold); background: rgba(201,169,110,0.08); }
        .header-right { margin-left: 16px; }
        .status-pill {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: var(--green);
          border: 1px solid rgba(107,175,138,0.3);
          padding: 4px 10px; border-radius: 20px;
          background: rgba(107,175,138,0.06);
        }
        .status-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--green); animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        /* Main */
        .main { flex: 1; max-width: 1200px; margin: 0 auto; width: 100%; padding: 0 32px; }

        /* Studio */
        .studio { padding: 60px 0 80px; }
        .hero { text-align: center; margin-bottom: 56px; }
        .hero-kicker {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 4px; color: var(--gold-dim); margin-bottom: 20px;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 88px);
          font-weight: 300; line-height: 1.05;
          letter-spacing: -1px; color: var(--text);
          margin-bottom: 20px;
        }
        .hero-title em {
          font-style: italic; color: var(--gold);
        }
        .hero-desc {
          font-size: 17px; color: var(--text2); font-weight: 300;
          max-width: 480px; margin: 0 auto; line-height: 1.7;
        }

        /* Input */
        .input-section { max-width: 720px; margin: 0 auto 64px; }
        .input-card {
          background: var(--bg2); border: 1px solid var(--border2);
          border-radius: 12px; padding: 24px;
          transition: border-color 0.3s;
          margin-bottom: 24px;
        }
        .input-card:focus-within { border-color: var(--gold-dim); }
        .input-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 3px; color: var(--text3); margin-bottom: 12px;
        }
        .prompt-input {
          width: 100%; background: none; border: none; outline: none;
          font-family: 'Cormorant Garamond', serif; font-size: 18px;
          color: var(--text); line-height: 1.6; resize: none;
          min-height: 80px;
        }
        .prompt-input::placeholder { color: var(--text3); }
        .input-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 16px; padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        .char-count {
          font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text3);
        }
        .generate-btn {
          display: flex; align-items: center; gap: 8px;
          background: var(--gold); color: #0C0C0D;
          border: none; border-radius: 6px;
          padding: 10px 22px; cursor: pointer;
          font-family: 'Cinzel', serif; font-size: 12px;
          letter-spacing: 1px; font-weight: 600;
          transition: all 0.2s;
        }
        .generate-btn:hover:not(:disabled) {
          background: var(--gold2); transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(201,169,110,0.25);
        }
        .generate-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Templates */
        .templates-label {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 3px; color: var(--text3); margin-bottom: 12px;
        }
        .templates-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .template-chip {
          background: none; border: 1px solid var(--border2);
          border-radius: 20px; padding: 6px 14px; cursor: pointer;
          font-family: 'Cormorant Garamond', serif; font-size: 14px;
          color: var(--text2); transition: all 0.2s;
        }
        .template-chip:hover {
          border-color: var(--gold-dim); color: var(--gold);
          background: rgba(201,169,110,0.05);
        }

        /* Recent */
        .recent-section { max-width: 900px; margin: 0 auto; }
        .section-title {
          font-family: 'DM Mono', monospace; font-size: 9px;
          letter-spacing: 3px; color: var(--text3); margin-bottom: 20px;
        }
        .recent-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
        }
        .recent-card {
          position: relative; border-radius: 8px; overflow: hidden;
          aspect-ratio: 1; cursor: pointer; background: var(--bg3);
          border: 1px solid var(--border);
        }
        .recent-card:hover .recent-overlay { opacity: 1; }
        .recent-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .recent-overlay {
          position: absolute; inset: 0; background: rgba(12,12,13,0.8);
          opacity: 0; transition: opacity 0.2s; padding: 12px;
          display: flex; align-items: flex-end;
        }
        .recent-prompt { font-size: 11px; color: var(--text2); line-height: 1.4; }

        /* Loading */
        .loading-view {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 80px 0; gap: 28px;
        }
        .loading-visual {
          position: relative; width: 120px; height: 120px;
          display: flex; align-items: center; justify-content: center;
        }
        .ring {
          position: absolute; border-radius: 50%; border: 1px solid transparent;
          animation: spin linear infinite;
        }
        .ring-outer {
          width: 120px; height: 120px;
          border-top-color: var(--gold);
          border-right-color: rgba(201,169,110,0.3);
          animation-duration: 3s;
        }
        .ring-mid {
          width: 88px; height: 88px;
          border-top-color: rgba(201,169,110,0.5);
          border-left-color: rgba(201,169,110,0.2);
          animation-duration: 2s;
          animation-direction: reverse;
        }
        .ring-inner {
          width: 56px; height: 56px;
          border-top-color: var(--gold);
          animation-duration: 1.5s;
        }
        .ring-center {
          width: 36px; height: 36px; background: var(--bg2);
          border-radius: 50%; border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          z-index: 1;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { text-align: center; }
        .loading-stage {
          font-family: 'Cinzel', serif; font-size: 14px;
          letter-spacing: 2px; color: var(--gold); margin-bottom: 4px;
        }
        .loading-elapsed {
          font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text3);
        }
        .progress-bar {
          width: 280px; height: 2px; background: var(--border2); border-radius: 1px;
        }
        .progress-fill {
          height: 100%; background: linear-gradient(90deg, var(--gold-dim), var(--gold));
          border-radius: 1px; transition: width 1s ease;
        }
        .loading-prompt {
          font-family: 'Cormorant Garamond', serif; font-size: 16px;
          font-style: italic; color: var(--text3); max-width: 400px;
          text-align: center; line-height: 1.5;
        }
        .cancel-btn {
          background: none; border: 1px solid var(--border2);
          color: var(--text2); padding: 8px 20px; border-radius: 6px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
        }
        .cancel-btn:hover { border-color: var(--red); color: var(--red); }

        /* Result */
        .result-view {
          display: flex; flex-direction: column; align-items: center;
          padding: 48px 0 80px; gap: 20px;
        }
        .result-badge {
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 3px; color: var(--green);
          border: 1px solid rgba(107,175,138,0.3);
          padding: 5px 14px; border-radius: 20px;
          background: rgba(107,175,138,0.06);
        }
        .result-frame {
          position: relative; border-radius: 12px; overflow: hidden;
          border: 1px solid var(--border2);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          max-width: 640px; width: 100%;
        }
        .result-img { width: 100%; display: block; }
        .result-actions-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px; background: linear-gradient(transparent, rgba(12,12,13,0.9));
          opacity: 0; transition: opacity 0.2s;
          display: flex; justify-content: flex-end;
        }
        .result-frame:hover .result-actions-overlay { opacity: 1; }
        .overlay-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(201,169,110,0.15); border: 1px solid var(--gold-dim);
          color: var(--gold); padding: 8px 16px; border-radius: 6px;
          font-family: 'DM Mono', monospace; font-size: 11px;
          cursor: pointer; transition: all 0.2s;
        }
        .overlay-btn:hover { background: rgba(201,169,110,0.25); }
        .result-prompt {
          font-family: 'Cormorant Garamond', serif; font-size: 16px;
          font-style: italic; color: var(--text2); max-width: 500px;
          text-align: center;
        }
        .result-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

        /* Buttons */
        .btn-primary {
          background: var(--gold); color: #0C0C0D;
          border: none; border-radius: 6px; padding: 10px 24px;
          font-family: 'Cinzel', serif; font-size: 12px;
          letter-spacing: 1px; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: var(--gold2); transform: translateY(-1px); }
        .btn-secondary {
          background: var(--bg3); color: var(--text);
          border: 1px solid var(--border2); border-radius: 6px;
          padding: 10px 24px; font-family: 'Cinzel', serif;
          font-size: 12px; letter-spacing: 1px; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: var(--border2); background: var(--bg2); }
        .btn-ghost {
          background: none; border: none; color: var(--text2);
          font-family: 'DM Mono', monospace; font-size: 11px;
          letter-spacing: 1px; cursor: pointer; padding: 10px 16px;
          transition: color 0.2s; border-radius: 6px;
        }
        .btn-ghost:hover { color: var(--text); }
        .btn-ghost.small { padding: 6px 12px; font-size: 10px; }

        /* Error */
        .error-view {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 0; gap: 16px; text-align: center;
        }
        .error-icon { font-size: 40px; color: var(--red); }
        .error-title {
          font-family: 'Cinzel', serif; font-size: 24px;
          color: var(--red); letter-spacing: 1px;
        }
        .error-msg {
          font-family: 'DM Mono', monospace; font-size: 12px;
          color: var(--text2); max-width: 400px; line-height: 1.6;
          background: var(--bg2); padding: 12px 16px; border-radius: 8px;
          border: 1px solid var(--border2);
        }

        /* Tab header */
        .tab-header {
          display: flex; align-items: baseline; justify-content: space-between;
          padding: 48px 0 32px;
        }
        .tab-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 300; letter-spacing: -0.5px;
        }
        .tab-count {
          font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text3);
        }

        /* Gallery */
        .gallery-tab { padding-bottom: 80px; }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .gallery-card {
          position: relative; border-radius: 10px; overflow: hidden;
          aspect-ratio: 1; cursor: pointer; background: var(--bg3);
          border: 1px solid var(--border);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .gallery-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.4); }
        .gallery-card:hover .gallery-card-overlay { opacity: 1; }
        .gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .gallery-card-overlay {
          position: absolute; inset: 0; opacity: 0; transition: opacity 0.2s;
          background: linear-gradient(transparent 30%, rgba(12,12,13,0.95));
          padding: 20px; display: flex; flex-direction: column;
          justify-content: flex-end; gap: 12px;
        }
        .gallery-card-prompt {
          font-family: 'Cormorant Garamond', serif; font-size: 14px;
          font-style: italic; color: var(--text2); line-height: 1.4;
        }
        .gallery-card-actions { display: flex; gap: 8px; }
        .card-btn {
          background: rgba(201,169,110,0.15); border: 1px solid var(--gold-dim);
          color: var(--gold); padding: 6px 14px; border-radius: 4px;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 1px; cursor: pointer; transition: all 0.2s;
        }
        .card-btn:hover { background: rgba(201,169,110,0.25); }

        /* History */
        .history-tab { padding-bottom: 80px; }
        .history-list { display: flex; flex-direction: column; gap: 2px; }
        .history-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 20px; background: var(--bg2);
          border: 1px solid var(--border); border-radius: 8px;
          transition: border-color 0.2s;
        }
        .history-item:hover { border-color: var(--border2); }
        .history-content { flex: 1; min-width: 0; }
        .history-prompt {
          font-family: 'Cormorant Garamond', serif; font-size: 16px;
          color: var(--text); margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .history-time {
          font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text3);
        }

        /* Empty state */
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          padding: 80px 0; gap: 16px; text-align: center;
        }
        .empty-icon { font-size: 40px; color: var(--text3); }
        .empty-state p { font-size: 16px; color: var(--text2); }

        /* Lightbox */
        .lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(12,12,13,0.96); backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .lightbox-inner {
          position: relative; max-width: 800px; width: 100%;
          display: flex; flex-direction: column; gap: 20px;
        }
        .lightbox-close {
          position: absolute; top: -48px; right: 0;
          background: none; border: none; color: var(--text2);
          font-size: 20px; cursor: pointer; transition: color 0.2s;
        }
        .lightbox-close:hover { color: var(--text); }
        .lightbox-img {
          width: 100%; border-radius: 12px;
          border: 1px solid var(--border2);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
        }
        .lightbox-footer { display: flex; flex-direction: column; gap: 16px; }
        .lightbox-prompt {
          font-family: 'Cormorant Garamond', serif; font-size: 18px;
          font-style: italic; color: var(--text2); text-align: center;
        }
        .lightbox-actions { display: flex; gap: 12px; justify-content: center; }

        @media (max-width: 768px) {
          .header-inner { padding: 0 16px; }
          .main { padding: 0 16px; }
          .recent-grid { grid-template-columns: repeat(2, 1fr); }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-title { font-size: 42px; }
          .nav-btn { padding: 8px 10px; font-size: 10px; }
        }
      `}</style>
    </div>
  );
}
