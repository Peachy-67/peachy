import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Analyze conversation text for behavioral red flags with improved scoring accuracy.
 * Uses advanced prompt engineering for more precise and detailed detection.
 * 
 * @param {string} conversationText User pasted conversation text
 * @returns {Promise<{flags: string[], scores: Record<string, number>}>} Detected flags and confidence scores
 */
export async function analyzeBehavior(conversationText) {
  if (!conversationText || conversationText.trim().length === 0) {
    throw new Error("Input conversation text is empty");
  }

  // Advanced prompt to elicit detailed analysis with confidence scores
  const prompt = `
You are a behavioral detection assistant. Given the user conversation below, identify if any of the following behaviors appear, and provide a confidence score (0-100%) for each:
- insults
- manipulation
- gaslighting
- discard behavior
- control patterns

Return a JSON object with two properties:
- flags: an array of detected behaviors (only if confidence >= 50%)
- scores: numeric confidence scores for each behavior

Conversation:
"""${conversationText}"""

Response format:
{
  "flags": [list of strings],
  "scores": {
    "insults": number,
    "manipulation": number,
    "gaslighting": number,
    "discard behavior": number,
    "control patterns": number
  }
}
`;

  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 400,
  });

  const content = response.data.choices[0].message.content;
  try {
    const parsed = JSON.parse(content);
    if (!parsed.flags || !parsed.scores) {
      throw new Error("Malformed response JSON");
    }
    return parsed;
  } catch (err) {
    // Fallback: return empty result with warning logged
    console.warn("Failed to parse analysis output, returning empty results.", err, content);
    return { flags: [], scores: {} };
  }
}