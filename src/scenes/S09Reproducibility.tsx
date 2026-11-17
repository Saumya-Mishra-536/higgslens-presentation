import type { SceneProps } from "../App";
import { REPRO } from "../content";
import { data, int } from "../lib/data";

export default function S09Reproducibility(_: SceneProps) {
  const R = data.run;
  const zeroOverlap = Math.max(...Object.values(data.budgets).map((b) => b.splitChecks.events_shared_by_train_and_test));

  return (
    <div className="s09">
      <header className="s09-head rise" style={{ animationDelay: "0.15s" }}>
        <div>
          <span className="tag">Scientific integrity &amp; leakage firewall</span>
          <h2 className="headline">{REPRO.headline}</h2>
        </div>
        <div className="s09-badges num">
          <span>seed {R.seed}</span>
          <span>{zeroOverlap} overlap</span>
          <span>{R.determinism.max_abs_probability_diff.toFixed(1)} CPU diff · 2 runs / {R.determinism.epochs} epochs</span>
        </div>
      </header>

      <div className="s09-reg-strip rise" style={{ animationDelay: "0.25s" }} aria-label="Regularization and optimization controls">
        <span><b className="num">StandardScaler (train only)</b> scales input features; <b className="num">BatchNorm1d</b> normalizes hidden activations</span>
        <span><b className="num">Dropout 0.20 / 0.10</b> + <b className="num">AdamW decay 1e-4 / 1e-5</b> prevent overfitting</span>
        <span><b className="num">BCEWithLogitsLoss + AdamW</b> optimize logits; cosine LR on deep runs; early stopping monitors validation ROC-AUC (patience 5/8)</span>
      </div>

      {/* Animated Protocol & Leakage Firewall Diagram */}
      <div className="s09-diagram rise" style={{ animationDelay: "0.35s" }}>
        <svg viewBox="0 0 1408 214" className="s09-svg" role="img" aria-label="Leakage prevention diagram: deduplication, stratified split, train-only preprocessing, validation stopping and one-time frozen test scoring">
          <defs>
            <linearGradient id="repro-flow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="68%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#F0B95A" />
            </linearGradient>
          </defs>

          {/* Main conduit paths */}
          <path d="M 110 104 L 315 104 L 460 56 L 860 56" fill="none" stroke="#A78BFA" strokeOpacity={0.35} strokeWidth={1.6} />
          <path d="M 315 104 L 460 152 L 860 152" fill="none" stroke="#A78BFA" strokeOpacity={0.35} strokeWidth={1.6} />
          <path d="M 860 104 L 1280 104" fill="none" stroke="#F0B95A" strokeOpacity={0.45} strokeWidth={1.6} strokeDasharray="5 5" />

          {/* Traveling data packets stopping cleanly at the firewall or flowing along train/val */}
          <circle r={3.5} fill="#A78BFA" className="net-flow-dot">
            <animateMotion dur="3.4s" repeatCount="indefinite" path="M 110 104 L 315 104 L 460 56 L 840 56" />
          </circle>
          <circle r={3.5} fill="#D946EF" className="net-flow-dot">
            <animateMotion dur="3.4s" begin="1.1s" repeatCount="indefinite" path="M 110 104 L 315 104 L 460 152 L 840 152" />
          </circle>
          <circle r={3.5} fill="#F0B95A" className="net-flow-dot">
            <animateMotion dur="3.8s" begin="0.8s" repeatCount="indefinite" path="M 940 104 L 1280 104" />
          </circle>

          {/* 1. Deduplicate */}
          <g transform="translate(24, 58)">
            <rect width="212" height="92" rx="8" className="repro-box" />
            <text x="16" y="28" className="repro-kicker">01 · DEDUPLICATE</text>
            <text x="16" y="54" className="repro-val">{int(R.sourceRows)} → −{int(R.duplicateRowsRemoved)}</text>
            <text x="16" y="76" className="repro-sub">Duplicates purged before split</text>
          </g>

          {/* 2. Stratified Split */}
          <g transform="translate(274, 58)">
            <rect width="170" height="92" rx="8" className="repro-box" />
            <text x="16" y="28" className="repro-kicker">02 · SPLIT (SEED {R.seed})</text>
            <text x="16" y="54" className="repro-val">70 / 15 / 15</text>
            <text x="16" y="76" className="repro-sub">{data.configs.resnet_mlp.splitProtocol}</text>
          </g>

          {/* 3A. Train branch */}
          <g transform="translate(490, 14)">
            <rect width="340" height="78" rx="8" className="repro-box repro-box--violet" />
            <text x="16" y="26" className="repro-kicker">TRAIN (70%)</text>
            <text x="16" y="48" className="repro-val-sm">Fit StandardScaler &amp; model weights</text>
            <text x="16" y="66" className="repro-sub">Zero validation or test leakage into scaler</text>
          </g>

          {/* 3B. Validation branch */}
          <g transform="translate(490, 114)">
            <rect width="340" height="78" rx="8" className="repro-box repro-box--violet" />
            <text x="16" y="26" className="repro-kicker">VALIDATION (15%)</text>
            <text x="16" y="48" className="repro-val-sm">Early stopping &amp; 50% ε_S cutoff</text>
            <text x="16" y="66" className="repro-sub">Thresholds frozen before touching test</text>
          </g>

          {/* 4. Luminous Leakage Firewall */}
          <line x1="888" y1="8" x2="888" y2="204" stroke="#D946EF" strokeWidth="2.4" strokeDasharray="6 4" />
          <rect x="858" y="80" width="60" height="50" rx="6" fill="#050609" stroke="#D946EF" strokeWidth="1.5" />
          <text x="888" y="101" textAnchor="middle" className="repro-fw">0</text>
          <text x="888" y="119" textAnchor="middle" className="repro-fw-sub">SHARED</text>

          {/* 5. Held-out Test */}
          <g transform="translate(950, 58)">
            <rect width="206" height="92" rx="8" className="repro-box repro-box--gold" />
            <text x="16" y="28" className="repro-kicker repro-kicker--gold">03 · HELD-OUT TEST (15%)</text>
            <text x="16" y="54" className="repro-val">Scored 1× only</text>
            <text x="16" y="76" className="repro-sub">Frozen weights &amp; thresholds</text>
          </g>

          {/* 6. Artifact Contract */}
          <g transform="translate(1192, 58)">
            <rect width="194" height="92" rx="8" className="repro-box" />
            <text x="16" y="28" className="repro-kicker">04 · ARTIFACT CONTRACT</text>
            <text x="16" y="54" className="repro-val-sm">{data.configs.resnet_mlp.schemaVersion}</text>
            <text x="16" y="76" className="repro-sub">metrics.json + CSV</text>
          </g>
        </svg>
      </div>

      {/* Concise 6 Scientific Qualification Cards */}
      <section className="s09-limits-wrap rise" style={{ animationDelay: "0.75s" }}>
        <h3 className="s09-h-limits">Limits of the benchmark</h3>
        <ul className="s09-limit-grid">
          {REPRO.limits.map((l) => (
            <li key={l.title} className="s09-limit-card">
              <strong>{l.title}</strong>
              <p>{l.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
