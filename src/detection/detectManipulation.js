export default function detectManipulation(text) {
  const t = (text || "").toLowerCase();
  const patterns = [
    /\bif you loved me\b/,
    /\byou (never|always)\b/,
    /\bprove it\b/,
    /\bafter everything i did for you\b/,
  ];
  return patterns.some((p) => p.test(t));
}