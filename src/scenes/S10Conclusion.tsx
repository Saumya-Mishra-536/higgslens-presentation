import { useState } from "react";
import type { SceneProps } from "../App";
import { BOUNDARY, FINDINGS, REFERENCES, VIVA_PREP } from "../content";

export default function S10Conclusion(_: SceneProps) {
  const [vivaOpen, setVivaOpen] = useState(false);
  const [vivaIdx, setVivaIdx] = useState(0);
  const item = VIVA_PREP[vivaIdx];

  return (
    <div className="s10">
      <h2 className="s10-title rise" style={{ animationDelay: "0.2s" }}>What the simulated benchmark shows — not a discovery claim</h2>
      <div className="s10-findings">
        {FINDINGS.map((f, i) => (
          <article key={f.title} className="rise" style={{ animationDelay: `${0.4 + i * 0.28}s` }}>
            <span className="s10-metric num">{f.metric}</span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>

      {/* Delicate synthesis flow + optional DL Viva Q&A trigger */}
      <div className="s10-journey-row rise" style={{ animationDelay: "1.2s" }}>
        <div className="s10-journey" aria-hidden="true">
          <span className="num">01 Simulated Event</span>
          <i />
          <span className="num">02 28 Features</span>
          <i />
          <span className="num">03 Residual MLP 0.8613</span>
          <i />
          <span className="num">04 Open Artifacts</span>
        </div>
        <button
          type="button"
          className={`s10-viva-btn num ${vivaOpen ? "is-on" : ""}`}
          aria-expanded={vivaOpen}
          onClick={() => setVivaOpen((v) => !v)}
        >
          {vivaOpen ? "Close Viva Q&A" : `DL Viva Prep (${VIVA_PREP.length} Q&A)`}
        </button>
      </div>

      {vivaOpen && (
        <section className="s10-viva-card" role="dialog" aria-label="Deep Learning Viva Preparation">
          <header className="s10-viva-head">
            <span className="num">VIVA DEFENSE PREP · 0{vivaIdx + 1} / 0{VIVA_PREP.length}</span>
            <div className="s10-viva-nav">
              <button type="button" className="num" onClick={() => setVivaIdx((i) => (i - 1 + VIVA_PREP.length) % VIVA_PREP.length)}>
                ← Prev
              </button>
              <button type="button" className="num" onClick={() => setVivaIdx((i) => (i + 1) % VIVA_PREP.length)}>
                Next →
              </button>
              <button type="button" className="num" onClick={() => setVivaOpen(false)} aria-label="Close viva prep">
                ✕
              </button>
            </div>
          </header>
          <p className="s10-viva-q">{item.q}</p>
          <p className="s10-viva-a">{item.a}</p>
        </section>
      )}

      <div className="s10-foot rise" style={{ animationDelay: "1.55s" }}>
        <p className="s10-mark">HiggsLens</p>
        <p className="s10-boundary">{BOUNDARY}</p>
        <p className="note">{REFERENCES.join("  |  ")}</p>
      </div>
    </div>
  );
}
