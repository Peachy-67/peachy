import { gaslightingPatterns } from "./patternLibrary.js";

export default function detectGaslighting(text) {

  const t = (text || "").toLowerCase();

  return gaslightingPatterns.some(p => p.test(t));

}