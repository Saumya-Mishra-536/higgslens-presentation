// All presentation copy lives here, separate from rendering. Numbers are not
// typed into this file: wherever a figure appears it is read from the
// artifact-derived data (src/lib/data.ts) so that copy and charts cannot drift.
import { data, getRun, f4, int, cfg, type ModelId } from "./lib/data";

const R = data.run;
const b250 = data.budgets["250k"];

export const TEAM = ["Saumya Mishra", "Aditya Rana", "Rachit Gupta", "Ronit Singh", "Krishna"];

export const SCENE_TITLES = [
  "The collision",
  "The hidden signal",
  "From event to features",
  "The experimental pipeline",
  "The models",
  "The results",
  "Scaling with data",
  "HiggsLens workbench",
  "Reproducibility and limitations",
  "The final collision",
];

export const BOUNDARY = "Simulated Monte Carlo events from the UCI HIGGS benchmark. Not a particle-discovery analysis.";

export const PROBLEM = {
  headline: "Two processes leave the same particles in the detector.",
  signal: {
    name: "Signal",
    sub: "Hypothetical heavy Higgs cascade → b b̄",
    body: "Decays through W and charged Higgs bosons to a light Higgs pair-of-b-quarks final state.",
  },
  background: {
    name: "Background",
    sub: "Standard Model top-quark pair production",
    body: "Produces the identical visible inventory of particles through a distinct kinematic decay.",
  },
  finalState: "1 charged lepton · missing transverse energy · 4 jets (2 b-tagged)",
  why: "Appearance alone cannot separate them—discrimination lives in correlated momenta.",
  question: "Can machine learning distinguish simulated signal from background from raw kinematics and invariant masses?",
};

export const FEATURE_STAGES = [
  {
    title: "Freeze the event",
    body: `${int(R.sourceRows)} simulated UCI events · 1 binary label each.`,
  },
  {
    title: "Lock measurements",
    body: "Momentum, direction and b-tag extracted from 6 detector objects.",
  },
  {
    title: "28-feature vector",
    body: "21 low-level kinematics + 7 physicist-computed invariant masses.",
  },
  {
    title: "Three input slices",
    body: "Every model trained on low_level (21), high_level (7), and all (28).",
  },
];

export const MEASUREMENTS = [
  { object: "Lepton", fields: ["pT", "η", "φ"], count: 3 },
  { object: "Missing E_T", fields: ["magnitude", "φ"], count: 2 },
  { object: "Jets 1 to 4", fields: ["pT", "η", "φ", "b-tag"], count: 16 },
];

export const PIPELINE = [
  { title: "Acquire", metric: "11.0M rows", body: "Full UCI HIGGS archive." },
  { title: "Validate", metric: "29 columns", body: "Binary labels, finite values." },
  { title: "Deduplicate", metric: `−${int(R.duplicateRowsRemoved)}`, body: "Duplicates purged before split." },
  { title: "Split", metric: `70 / 15 / 15`, body: `Stratified, seed ${R.seed}.` },
  { title: "Preprocess", metric: "Train-only", body: "z = (x − μ_train) / σ_train." },
  { title: "Train", metric: "Batch 1,024", body: "AdamW · ReLU · BN · Cosine LR." },
  { title: "Stop & Cutoff", metric: "Patience 5/8", body: "Early stop & 50% ε_S on val." },
  { title: "Test", metric: "1× frozen", body: "Held-out split scored once." },
  { title: "Export", metric: "v1 schema", body: "metrics.json & predictions CSV." },
];

const params = (m: ModelId) => {
  const n = data.configs[m].parameterCount;
  return n ? `${int(n)} parameters` : null;
};

export const MODELS: Record<ModelId, { role: string; why: string; specs: string[] }> = {
  logreg: {
    role: "Linear reference",
    why: "One weighted sum of the 28 inputs—measures linear separability without feature interactions.",
    specs: [`L-BFGS · C = ${cfg<number>("logreg", "C").toFixed(1)}`, "Train-only StandardScaler", `≤ ${int(cfg<number>("logreg", "max_iter"))} iterations`],
  },
  xgboost: {
    role: "Tuned tree ensemble",
    why: "Boosted trees capture nonlinear interactions and provide the fast classical baseline.",
    specs: [
      `≤ ${int(cfg<number>("xgboost", "n_estimators"))} trees · depth ${cfg<number>("xgboost", "max_depth")}`,
      `lr ${cfg<number>("xgboost", "learning_rate")} · subsample ${cfg<number>("xgboost", "subsample")}`,
      `Validation stopping (${cfg<number>("xgboost", "early_stopping_rounds")} rounds)`,
    ],
  },
  mlp: {
    role: "Compact shallow baseline",
    why: "Two narrow hidden layers—shows what a shallow network achieves on identical inputs.",
    specs: [
      `Hidden ${cfg<number[]>("mlp", "hidden_sizes").join(" → ")}`,
      `BatchNorm · ReLU · dropout ${cfg<number>("mlp", "dropout").toFixed(2)}`,
      `${params("mlp")} · ≤ ${cfg<number>("mlp", "max_epochs")} epochs`,
    ],
  },
  deep_mlp: {
    role: "Deep MLP (Baldi et al. 2014)",
    why: "Five wide layers learn oblique momentum combinations sequentially across depth.",
    specs: [
      `${cfg<number[]>("deep_mlp", "hidden_sizes").length} × ${cfg<number[]>("deep_mlp", "hidden_sizes")[0]} units`,
      `BatchNorm · ReLU · dropout ${cfg<number>("deep_mlp", "dropout").toFixed(2)} · cosine`,
      `${params("deep_mlp")} · patience ${cfg<number>("deep_mlp", "early_stopping_patience")}`,
    ],
  },
  resnet_mlp: {
    role: "Residual MLP (Gorishniy et al. 2021)",
    why: "Skip connections carry input x around each block so weights learn only refinement F(x).",
    specs: [
      `${cfg<number[]>("resnet_mlp", "hidden_sizes").length} residual blocks · width ${cfg<number[]>("resnet_mlp", "hidden_sizes")[0]}`,
      "Block: BN → Linear 512 → ReLU → Linear 256 + skip",
      `${params("resnet_mlp")} · patience ${cfg<number>("resnet_mlp", "early_stopping_patience")}`,
    ],
  },
};

const best250 = getRun("250k", "resnet_mlp", "all");
export const RESULTS = {
  headline: "At 250k events the residual network leads.",
  sub: `Held-out test set of ${int(b250.splitChecks.split_sizes.test)} events, identical for every model.`,
  hero: [
    { label: "ROC-AUC", value: best250.rocAuc, note: "Probability a random signal outranks a random background (0.5 chance, 1.0 perfect)." },
    { label: "PR-AUC", value: best250.prAuc, note: "Average precision across all thresholds; summarises purity vs. capture." },
    { label: "Brier score", value: best250.brier, note: "Mean squared error of predicted probabilities against 0/1 labels (lower is better)." },
  ],
  views: ["Leaderboard", "ROC curves", "Feature groups", "Calibration"],
};

export const SCALING = {
  headline: "More data widens the gap.",
  views: ["All 28 features", "21 low-level features", "Cost"],
};

export const WORKBENCH = {
  headline: "Every result can be opened.",
  body: "A four-view tour of the Streamlit evidence workbench. It reads saved metrics.json and test_predictions.csv artifacts; it does not train models on startup.",
  views: [
    {
      file: "dataset.png",
      name: "Dataset Observatory",
      tag: "Step 01 · Inputs & EDA",
      body: "Inspect all 21 kinematic inputs and 7 invariant masses, with feature distributions, correlations and class balance.",
    },
    {
      file: "overview.png",
      name: "Experiment Overview",
      tag: "Step 02 · Saved Runs",
      body: "Browse the 15 saved 250k runs under higgs-split-v1 (seed 42), including the model leaderboard and headline metrics.",
    },
    {
      file: "experiments.png",
      name: "Experiment Comparison",
      tag: "Step 03 · Cross-Run View",
      body: "Compare five model families across low_level, high_level and all feature groups, with consistent metric definitions.",
    },
    {
      file: "validation.png",
      name: "Validation & Threshold Analysis",
      tag: "Step 04 · Curves & Thresholds",
      body: "Inspect ROC, precision–recall and calibration diagnostics. Threshold sliders are exploratory; official cutoffs are frozen using validation data.",
    },
  ],
};

export const REPRO = {
  headline: "What is fixed, and what this does not show.",
  fixed: [
    { k: "Seed", v: String(R.seed), note: "sampling, splitting and training" },
    { k: "Split", v: "70 / 15 / 15", note: "stratified; identical indices" },
    { k: "Split protocol", v: data.configs.resnet_mlp.splitProtocol, note: "recorded per run" },
    { k: "Artifact contract", v: data.configs.resnet_mlp.schemaVersion, note: "metrics & predictions" },
    {
      k: "Train/test overlap",
      v: String(Math.max(...Object.values(data.budgets).map((b) => b.splitChecks.events_shared_by_train_and_test))),
      note: `shared events after −${int(R.duplicateRowsRemoved)} dupes`,
    },
    {
      k: "Determinism",
      v: R.determinism.max_abs_probability_diff.toFixed(1),
      note: "CPU compact-MLP repeatability diff",
    },
  ],
  leakage: "Scaler fitted on training rows only; early stopping and cutoffs frozen on validation; test scored once.",
  limits: [
    { title: "Simulated events", body: "Higher score reflects classifier separation on UCI HIGGS, not real detector discovery." },
    { title: `~${Math.round(b250.splitChecks.signal_fraction * 100)}% signal fraction`, body: "Balanced benchmark classes unlike a rare-event search." },
    { title: `Single seed (${R.seed})`, body: "Run-to-run variance unmeasured; gaps below ~0.002 should not be ranked." },
    { title: `One ${R.gpu} GPU`, body: "Training times compare strictly within this hardware benchmark." },
    { title: "60-epoch cap at 2.5M", body: "Several deep runs hit the epoch limit while still improving." },
    { title: "Calibration gap", body: "Neural scores lag XGBoost in calibration and need recalibration as probabilities." },
  ],
};

const r25 = getRun("2.5m", "resnet_mlp", "all");
const x25 = getRun("2.5m", "xgboost", "all");
const rLow = getRun("2.5m", "resnet_mlp", "low_level");
export const FINDINGS = [
  {
    metric: "45 runs · 0 overlap",
    title: "Reproducible end to end.",
    body: `One seed (${R.seed}), deduplicated archive, shared splits and zero train/test overlap.`,
  },
  {
    metric: `${f4(r25.rocAuc)} vs ${f4(x25.rocAuc)}`,
    title: "Architecture & scale matter.",
    body: `At 2.5M, Residual MLP leads XGBoost (${f4(rLow.rocAuc)} from raw kinematics alone), while XGBoost excels in speed & calibration.`,
  },
  {
    metric: "15 run packages",
    title: "Fully inspectable.",
    body: "Every metric and prediction file opens directly inside the Streamlit workbench.",
  },
];

export const REFERENCES = [
  "Baldi, Sadowski and Whiteson, Nature Communications 5, 4308 (2014)",
  "Gorishniy, Rubachev, Khrulkov and Babenko, NeurIPS (2021)",
  "UCI Machine Learning Repository, HIGGS, dataset 280",
];

export const VIVA_PREP: { q: string; a: string }[] = [
  {
    q: "Why does the Residual MLP outperform the ordinary Deep MLP despite similar optimization?",
    a: `Each 256-wide block adds an identity shortcut (y = x + F(x)), letting gradients flow directly across 4 blocks (1,061,889 params) while layers learn refinements rather than re-encoding all features—yielding ${f4(r25.rocAuc)} vs ${f4(getRun("2.5m", "deep_mlp", "all").rocAuc)} ROC-AUC at 2.5M.`,
  },
  {
    q: "How do the neural networks learn and update weights during training?",
    a: "Standardized 1,024-event mini-batches pass through Linear + BatchNorm + ReLU + Dropout layers to a scalar logit z; training optimizes binary cross-entropy via backpropagation and AdamW (lr 0.001, decoupled weight decay), with cosine scheduling on Deep and Residual MLPs.",
  },
  {
    q: "What proves deep networks learn representations beyond hand-crafted features?",
    a: `At 2.5M events using only the 21 raw kinematic features, Residual MLP reaches ${f4(rLow.rocAuc)} ROC-AUC—exceeding XGBoost given all 28 features including invariant masses (${f4(x25.rocAuc)}).`,
  },
  {
    q: "How did you prevent data leakage and overfitting?",
    a: `We removed ${int(R.duplicateRowsRemoved)} duplicate rows before splitting 70/15/15 with seed ${R.seed} (0 shared train/test events), fit StandardScaler on training rows only, regularized with BatchNorm, Dropout (0.10–0.20) and weight decay, and applied validation early stopping (patience 5/8).`,
  },
  {
    q: "Why is XGBoost still competitive despite lower ROC-AUC at 2.5M?",
    a: `At 250k events XGBoost trains in 2.4s vs 28.6s for Residual MLP (0.8188 vs 0.8339 ROC-AUC), and at 2.5M XGBoost achieves much lower Expected Calibration Error (${f4(x25.ece)} vs ${f4(r25.ece)}), making it stronger where speed or probability calibration matters.`,
  },
  {
    q: "What are the two biggest scientific caveats of this benchmark?",
    a: "First, UCI HIGGS events are simulated Monte Carlo with ~54% signal balance—not real detector discoveries or rare-event ratios. Second, each budget uses one seed (42), so variance is unmeasured and several 2.5M deep runs hit the 60-epoch cap.",
  },
];
