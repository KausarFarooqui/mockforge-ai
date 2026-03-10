import { useState } from "react";
import { getImageUrl } from "../api";

export default function RenderViewer({ imageUrl, params, onReset }) {
  const [zoomed, setZoomed] = useState(false);
  const fullUrl = getImageUrl(imageUrl);

  const handleDownload = async () => {
    const res = await fetch(fullUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mockforge-render-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <span className="viewer-badge">✓ RENDER COMPLETE</span>
        <div className="viewer-meta">
          {params && (
            <>
              <span>{params.product}</span>
              <span className="dot">·</span>
              <span>{params.lighting}</span>
              <span className="dot">·</span>
              <span>{params.mood}</span>
            </>
          )}
        </div>
      </div>

      <div
        className={`render-frame ${zoomed ? "zoomed" : ""}`}
        onClick={() => setZoomed(!zoomed)}
        title={zoomed ? "Click to zoom out" : "Click to zoom in"}
      >
        <img
          src={fullUrl}
          alt="Generated product render"
          className="render-image"
        />
        <div className="render-overlay">
          <span className="zoom-hint">{zoomed ? "↙ Zoom Out" : "↗ Zoom In"}</span>
        </div>
      </div>

      <div className="viewer-actions">
        <button className="action-btn primary" onClick={handleDownload}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PNG
        </button>
        <button className="action-btn secondary" onClick={onReset}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4" />
          </svg>
          New Render
        </button>
      </div>

      {params && (
        <div className="scene-params">
          <h4 className="params-title">Scene Parameters</h4>
          <div className="params-grid">
            {Object.entries(params).map(([k, v]) => (
              <div key={k} className="param-row">
                <span className="param-key">{k.replace(/_/g, " ")}</span>
                <span className="param-val">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
