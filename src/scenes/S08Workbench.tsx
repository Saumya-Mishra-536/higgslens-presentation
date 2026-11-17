import type { SceneProps } from "../App";
import { WORKBENCH } from "../content";

export default function S08Workbench({ step, setStep }: SceneProps) {
  const view = WORKBENCH.views[step];
  const total = WORKBENCH.views.length;
  return (
    <div className="s08">
      <div className="s08-text">
        <span className="tag">Guided dashboard walkthrough</span>
        <h2 className="headline">{WORKBENCH.headline}</h2>
        <p className="body">{WORKBENCH.body}</p>
        <ol>
          {WORKBENCH.views.map((v, i) => (
            <li key={v.name}>
              <button type="button" className={i === step ? "is-on" : ""} aria-current={i === step} onClick={() => setStep(i)}>
                <em className="num s08-step-tag">{v.tag}</em>
                <strong>{v.name}</strong>
                <span>{v.body}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="s08-walk-foot">
          <div className="s08-walk-nav">
            <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} aria-label="Previous dashboard view">
              Prev
            </button>
            <span className="num">0{step + 1} / 0{total}</span>
            <button type="button" onClick={() => setStep(Math.min(total - 1, step + 1))} disabled={step === total - 1} aria-label="Next dashboard view">
              Next
            </button>
          </div>
          <p className="note num">Reads saved artifacts · no startup training</p>
        </div>
      </div>
      <figure className="s08-shot">
        <div className="s08-bar">
          <i /><i /><i />
          <span className="num">{view.tag} — {view.name}</span>
          <em className="num s08-bar-file">{view.file}</em>
        </div>
        <div className="s08-frame">
          {WORKBENCH.views.map((v, i) => (
            <img
              key={v.file}
              src={`./dashboard/${v.file}`}
              alt={`Screenshot of the HiggsLens Streamlit dashboard: ${v.name}`}
              className={i === step ? "is-on" : ""}
            />
          ))}
        </div>
      </figure>
    </div>
  );
}
