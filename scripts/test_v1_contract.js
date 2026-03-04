const { formatAnalyzeResponse, LOCKED_KEYS } = require('../src/formatters/analyzeResponse');

function fail(message) {
  console.error(message);
  process.exit(1);
}

const stub = {
  verdict: {
    label: 'Red Flag',
    score: 8.4,
    band: 'red',
    should_be_dropped: true
  },
  confidence: 0.64,
  signals: ['discard'],
  why: ['multiple personal attacks across turns'],
  watch_next: ['repeated escalation in next 2 interactions'],
  usage: { runs_used: 1, runs_remaining: 2 },
  meta: { schema_version: 'v1' },
  should_be_dropped: true
};

const output = formatAnalyzeResponse(stub);
const keys = Object.keys(output);

if (keys.length !== LOCKED_KEYS.length) {
  fail(`Expected ${LOCKED_KEYS.length} keys, got ${keys.length}: ${keys.join(',')}`);
}

for (const key of LOCKED_KEYS) {
  if (!keys.includes(key)) {
    fail(`Missing required key: ${key}`);
  }
}

for (const key of keys) {
  if (!LOCKED_KEYS.includes(key)) {
    fail(`Extra key detected: ${key}`);
  }
}

if (!output.verdict || typeof output.verdict !== 'object' || Array.isArray(output.verdict)) fail('verdict must be object');
const verdictKeys = Object.keys(output.verdict);
const requiredVerdictKeys = ['label', 'score', 'band'];
if (verdictKeys.length !== requiredVerdictKeys.length) fail('verdict must only contain label, score, band');
for (const k of requiredVerdictKeys) {
  if (!verdictKeys.includes(k)) fail(`verdict missing key: ${k}`);
}
if (typeof output.verdict.label !== 'string') fail('verdict.label must be string');
if (typeof output.verdict.score !== 'number') fail('verdict.score must be number');
if (!['green', 'yellow', 'red'].includes(output.verdict.band)) fail('verdict.band must be green|yellow|red');
if (!Array.isArray(output.reaction)) fail('reaction must be array');
if (output.reaction.length < 3 || output.reaction.length > 5) fail('reaction must contain 3-5 strings');
if (!output.reaction.every((r) => typeof r === 'string')) fail('reaction items must be strings');
const expectedReaction = [
  'Yeah. No.',
  'That’s a pattern.',
  'This doesn’t get better by ignoring it.'
];
if (JSON.stringify(output.reaction) !== JSON.stringify(expectedReaction)) {
  fail('reaction mapping must be deterministic and match red-band mapping');
}
if (typeof output.confidence !== 'number') fail('confidence must be number');
if (!Array.isArray(output.signals)) fail('signals must be array');
if (!Array.isArray(output.why)) fail('why must be array');
if (!Array.isArray(output.watch_next)) fail('watch_next must be array');
if (!output.usage || typeof output.usage !== 'object' || Array.isArray(output.usage)) fail('usage must be object');
if (!output.meta || typeof output.meta !== 'object' || Array.isArray(output.meta)) fail('meta must be object');

console.log('V1 contract test passed');
