export default function detectGaslighting(text) {
  const t = (text || "").toLowerCase();
  const patterns = [
    /\byou're crazy\b/,
    /\bthat never happened\b/,
    /\byou're imagining things\b/,
    /\byou're overreacting\b/,
  ];
  return patterns.some((p) => p.test(t));
}