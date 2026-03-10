import { useState } from "react";

const EXAMPLE_PROMPTS = [
  "A white ceramic perfume bottle on black marble with dramatic side lighting",
  "Silver wireless headphones floating on a gradient background with neon purple glow",
  "Vintage leather wallet on a wooden desk with golden hour sunlight",
  "Matte black smartphone on concrete surface with minimalist studio lighting",
  "Glass water bottle with condensation on a marble countertop, soft natural light",
];

export default function PromptBox({ onGenerate, isLoading }) {
  const [prompt, setPrompt] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setPrompt(val);
      setCharCount(val.length);
    }
  };

  const handleSubmit = () => {
    if (prompt.trim().length >= 5 && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const useExample = (ex) => {
    setPrompt(ex);
    setCharCount(ex.length);
  };

  return (
    <div className="prompt-box">
      <div className="prompt-label">
        <span className="label-tag">DESCRIBE YOUR PRODUCT</span>
        <span className="char-count">{charCount}/500</span>
      </div>

      <div className="textarea-wrapper">
        <textarea
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="A photorealistic render of a matte black smartphone on a walnut desk, soft studio lighting, 45° product shot..."
          className="prompt-textarea"
          disabled={isLoading}
          rows={4}
        />
        <div className="textarea-glow" />
      </div>

      <div className="prompt-actions">
        <button
          onClick={handleSubmit}
          disabled={prompt.trim().length < 5 || isLoading}
          className="generate-btn"
        >
          {isLoading ? (
            <span className="btn-inner">
              <span className="spinner-dot" />
              <span className="spinner-dot" />
              <span className="spinner-dot" />
              <span>Forging...</span>
            </span>
          ) : (
            <span className="btn-inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Generate Render</span>
            </span>
          )}
        </button>
        <span className="shortcut-hint">⌘↵ to generate</span>
      </div>

      <div className="examples-section">
        <span className="examples-label">Try an example:</span>
        <div className="examples-list">
          {EXAMPLE_PROMPTS.map((ex, i) => (
            <button
              key={i}
              className="example-chip"
              onClick={() => useExample(ex)}
              disabled={isLoading}
            >
              {ex.length > 55 ? ex.slice(0, 55) + "…" : ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
