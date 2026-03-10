const STAGES = [
  { key: "queued",         label: "Queuing job",          icon: "⏳", pct: 5  },
  { key: "interpreting",   label: "AI interpreting prompt", icon: "🧠", pct: 20 },
  { key: "building_scene", label: "Building 3D scene",    icon: "🏗️",  pct: 45 },
  { key: "rendering",      label: "Rendering with Cycles", icon: "✨", pct: 80 },
  { key: "complete",       label: "Complete!",             icon: "🎉", pct: 100 },
];

export default function Loader({ status, elapsed, params }) {
  const currentStage = STAGES.find(s => s.key === status) || STAGES[0];
  const stageIndex = STAGES.findIndex(s => s.key === status);

  return (
    <div className="loader-container">
      <div className="loader-orb">
        <div className="orb-ring ring-1" />
        <div className="orb-ring ring-2" />
        <div className="orb-ring ring-3" />
        <div className="orb-core">
          <span className="orb-icon">{currentStage.icon}</span>
        </div>
      </div>

      <div className="loader-info">
        <p className="loader-status">{currentStage.label}</p>
        {elapsed > 0 && (
          <p className="loader-elapsed">{elapsed}s elapsed</p>
        )}
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${currentStage.pct}%` }}
        />
      </div>

      <div className="stage-dots">
        {STAGES.slice(0, -1).map((s, i) => (
          <div
            key={s.key}
            className={`stage-dot ${i <= stageIndex ? "active" : ""} ${i === stageIndex ? "current" : ""}`}
            title={s.label}
          />
        ))}
      </div>

      {params && (
        <div className="params-preview">
          <div className="param-tag">{params.product}</div>
          <div className="param-tag">{params.lighting}</div>
          <div className="param-tag">{params.camera_angle}</div>
        </div>
      )}
    </div>
  );
}
