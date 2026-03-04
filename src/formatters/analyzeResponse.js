const LOCKED_KEYS = [
  "verdict",
  "reaction",
  "confidence",
  "signals",
  "why",
  "watch_next",
  "usage",
  "meta",
];

// ---------------------------
// Deterministic Verdict Logic
// ---------------------------
function deriveVerdictFromSignals(signals = []) {
  const weights = {
    threat: 3.5,
    discard: 4.0,
    ultimatum: 3.0,
    guilt: 2.5,
    control: 2.5,
    gaslighting: 3.0,
    insult: 3.0,
    boundary_push: 2.0,
    inconsistency: 1.0,
  };

  let score = 0;

  for (const s of signals) {
    if (weights[s]) score += weights[s];
  }

  // Hard override rules (strict classification)
  const signalSet = new Set(signals);

  // If both "discard" and "insult" appear, force RED (what you expect)
  if (signalSet.has("discard") && signalSet.has("insult")) {
    return { label: "Red Flag", score: 9, band: "red" };
  }

  // If discard appears at all, never let it be green/yellow-low
  if (signalSet.has("discard") && score < 6) {
    score = 6;
  }

  score = Math.min(10, Math.max(0, score));
  score = Math.round(score * 10) / 10;

  let band;
  let label;

  if (score < 2) {
    band = "green";
    label = "Green Flag";
  } else if (score < 6) {
    band = "yellow";
    label = "Yellow Flag";
  } else if (score < 9) {
    band = "red";
    label = "Red Flag";
  } else {
    band = "red";
    label = "Major Red Flag";
  }

  return { label, score, band };
}

// ---------------------------
// Deterministic Reaction
// ---------------------------
function getDeterministicReaction(verdict) {
  const band = verdict && typeof verdict === "object" ? verdict.band : "yellow";
  const score = verdict && typeof verdict === "object" ? verdict.score : 0;

  if (score >= 9) {
    return ["Absolutely not.", "This crossed a line.", "Don’t rationalize this."];
  }

  if (band === "green") {
    return ["Honestly? This seems fine.", "Nothing here feels manipulative.", "Just keep it consistent."];
  }

  if (band === "yellow") {
    return ["This isn’t terrible. It’s just… off.", "There’s some inconsistency here.", "Pay attention to the pattern."];
  }

  if (band === "red") {
    return ["Yeah. No.", "That’s a pattern.", "This doesn’t get better by ignoring it."];
  }

  return ["This isn’t terrible. It’s just… off.", "There’s some inconsistency here.", "Pay attention to the pattern."];
}

// ---------------------------
// Contract Enforcement
// ---------------------------
function assertV1Shape(output) {
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    throw new Error("V1 contract violation: output must be an object");
  }

  const keys = Object.keys(output);
  const missing = LOCKED_KEYS.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !LOCKED_KEYS.includes(k));

  if (missing.length || extra.length) {
    throw new Error(`V1 contract violation: missing=[${missing.join(",")}], extra=[${extra.join(",")}]`);
  }

  if (!output.verdict || typeof output.verdict !== "object" || Array.isArray(output.verdict)) {
    throw new Error("V1 contract violation: verdict must be object");
  }

  const verdictKeys = Object.keys(output.verdict);
  const requiredVerdictKeys = ["label", "score", "band"];
  const missingVerdict = requiredVerdictKeys.filter((k) => !verdictKeys.includes(k));
  const extraVerdict = verdictKeys.filter((k) => !requiredVerdictKeys.includes(k));

  if (missingVerdict.length || extraVerdict.length) {
    throw new Error(
      `V1 contract violation: verdict missing=[${missingVerdict.join(",")}], verdict extra=[${extraVerdict.join(",")}]`
    );
  }

  if (typeof output.verdict.label !== "string") throw new Error("V1 contract violation: verdict.label must be string");
  if (typeof output.verdict.score !== "number") throw new Error("V1 contract violation: verdict.score must be number");
  if (!["green", "yellow", "red"].includes(output.verdict.band))
    throw new Error("V1 contract violation: verdict.band must be green|yellow|red");

  if (!Array.isArray(output.reaction)) throw new Error("V1 contract violation: reaction must be array");
  if (output.reaction.length < 3 || output.reaction.length > 5)
    throw new Error("V1 contract violation: reaction must have 3–5 items");
  if (!output.reaction.every((r) => typeof r === "string"))
    throw new Error("V1 contract violation: reaction items must be strings");

  if (typeof output.confidence !== "number") throw new Error("V1 contract violation: confidence must be number");
  if (!Array.isArray(output.signals)) throw new Error("V1 contract violation: signals must be array");
  if (!Array.isArray(output.why)) throw new Error("V1 contract violation: why must be array");
  if (!Array.isArray(output.watch_next)) throw new Error("V1 contract violation: watch_next must be array");

  if (!output.usage || typeof output.usage !== "object" || Array.isArray(output.usage))
    throw new Error("V1 contract violation: usage must be object");

  if (!output.meta || typeof output.meta !== "object" || Array.isArray(output.meta))
    throw new Error("V1 contract violation: meta must be object");
}

// ---------------------------
// Main Formatter
// ---------------------------
function formatAnalyzeResponse(input = {}) {
  const cleanSignals = Array.isArray(input.signals)
    ? [...new Set(input.signals.map((s) => String(s).trim().toLowerCase()).filter(Boolean))]
    : [];

  const derivedVerdict = deriveVerdictFromSignals(cleanSignals);

  const output = {
    verdict: derivedVerdict,
    reaction: getDeterministicReaction(derivedVerdict),
    confidence: typeof input.confidence === "number" ? input.confidence : 0,
    signals: cleanSignals,
    why: Array.isArray(input.why) ? input.why : [],
    watch_next: Array.isArray(input.watch_next) ? input.watch_next : [],
    usage: input.usage && typeof input.usage === "object" && !Array.isArray(input.usage) ? input.usage : {},
    meta: input.meta && typeof input.meta === "object" && !Array.isArray(input.meta) ? input.meta : {},
  };

  assertV1Shape(output);
  return output;
}

module.exports = {
  formatAnalyzeResponse,
  assertV1Shape,
  LOCKED_KEYS,
  getDeterministicReaction,
};