export default function detectInsults(text) {
  const t = (text || "").toLowerCase();
  const patterns = [
    /\byou('re| are)?\s+(an?\s+)?(idiot|stupid|dumb|loser)\b/,
    /\b(idiot|stupid|dumb|loser)\b/,
  ];
  return patterns.some((p) => p.test(t));
}