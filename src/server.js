require("dotenv").config();

const OpenAI = require("openai");
const express = require("express");

const { checkDbConnection } = require("./db");
const { formatAnalyzeResponse } = require("./formatters/analyzeResponse");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(express.json());
app.use(express.static("public"));

const port = process.env.PORT || 3000;
const MAX_INPUT_LENGTH = 12000;
const MIN_INPUT_LENGTH = 12;

/**
 * Deterministic safety-net classifier.
 * Ensures obvious insults/discards never return green.
 */
function detectSignals(textRaw) {
  const text = String(textRaw || "").toLowerCase();
  const hasAny = (patterns) => patterns.some((re) => re.test(text));
  const signals = new Set();

  // discard
  if (
    hasAny([
      /\bdon'?t\s+respond\b/,
      /\bdo\s+not\s+respond\b/,
      /\bdon'?t\s+text\b/,
      /\bstop\s+text(ing)?\b/,
      /\bleave\s+me\s+alone\b/,
      /\bblocked\b/,
      /\bi'?m\s+done\b/,
      /\bwe'?re\s+done\b/,
      /\bnever\s+contact\s+me\b/,
    ])
  ) {
    signals.add("discard");
  }

  // insult
  if (
    hasAny([
      /\byou\s+are\s+(terrible|awful|pathetic|useless|stupid|dumb)\b/,
      /\byou'?re\s+(terrible|awful|pathetic|useless|stupid|dumb)\b/,
      /\byou\s+suck\b/,
      /\byou'?re\s+the\s+problem\b/,
      /\byou\s+idiot\b/,
      /\bterrible\b.*\bcommunicat(ing|ion)\b/,
    ])
  ) {
    signals.add("insult");
  }

  if (hasAny([/\bif\s+you\b.*\b(i'?m\s+leaving|we'?re\s+done)\b/]))
    signals.add("ultimatum");

  if (hasAny([/\b(i'?ll|i\s+will)\s+(ruin|expose|hurt|destroy)\b/]))
    signals.add("threat");

  return Array.from(signals);
}

app.get("/v1/health", async (_req, res) => {
  try {
    await checkDbConnection();
    return res.status(200).json({ status: "ok", postgres: "connected" });
  } catch {
    return res.status(503).json({ status: "degraded", postgres: "disconnected" });
  }
});

app.post("/v1/analyze", async (req, res) => {
  try {
    const rawText = String(req.body?.text || "");
    const text = rawText.trim();

    if (!text) {
      return res.status(400).json({
        error: "invalid_input",
        message: "Please paste a conversation first.",
      });
    }

    if (text.length < MIN_INPUT_LENGTH) {
      return res.status(400).json({
        error: "invalid_input",
        message: `Input is too short. Please provide at least ${MIN_INPUT_LENGTH} characters.`,
      });
    }

    if (text.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        error: "invalid_input",
        message: `Input is too long. Max length is ${MAX_INPUT_LENGTH} characters.`,
      });
    }

    const prompt = `
You are FLAGGED, a dating red/green flag detector.

Return ONLY JSON matching the schema. No markdown. No backticks. No extra keys.

Signal definitions (STRICT):
- insult: degrading/attacking statement about character, intelligence, competence, worth, or personality.
- discard: ends communication or tells you not to respond.
- ultimatum: conditional threat forcing an outcome.
- threat: punishment/exposure/retaliation/harm.
- control: restricting autonomy.
- guilt: guilt-tripping/blame to coerce.
- gaslighting: denying reality to cause self-doubt.
- boundary_push: pushing after "no".
- inconsistency: contradictions/moving goalposts.

Important:
- If both insult AND discard appear, include BOTH.
- When unsure between green and yellow, choose yellow.
- Be literal. Do not soften classification.
`.trim();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: prompt },
        { role: "user", content: text },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "flagged_v1",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              confidence: { type: "number" },
              signals: {
                type: "array",
                items: {
                  type: "string",
                  enum: [
                    "insult",
                    "ultimatum",
                    "discard",
                    "control",
                    "guilt",
                    "gaslighting",
                    "threat",
                    "boundary_push",
                    "inconsistency",
                  ],
                },
              },
              why: { type: "array", items: { type: "string" } },
              watch_next: { type: "array", items: { type: "string" } },
            },
            required: ["confidence", "signals", "why", "watch_next"],
          },
        },
      },
    });

    let parsed =
      response?.output?.[0]?.content?.[0]?.parsed ??
      (response?.output_text ? JSON.parse(response.output_text) : null);

    if (!parsed || typeof parsed !== "object") {
      throw new Error("No structured JSON returned by model");
    }

    // Deterministic safety-net.
    const detSignals = detectSignals(text);
    const mergedSignals = Array.from(
      new Set([
        ...(Array.isArray(parsed.signals) ? parsed.signals : []),
        ...detSignals,
      ])
    );

    parsed = {
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      why: Array.isArray(parsed.why) ? parsed.why : [],
      watch_next: Array.isArray(parsed.watch_next)
        ? parsed.watch_next
        : [],
      signals: mergedSignals,
      // Do not persist raw user text in V1.
      usage: {},
      meta: {},
    };

    return res.json(formatAnalyzeResponse(parsed));
  } catch (err) {
    console.error("analyze_failed", err?.message || err);
    return res.status(500).json({
      error: "analyze_failed",
      message: "Analysis failed. Please try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`server listening on :${port}`);
});
