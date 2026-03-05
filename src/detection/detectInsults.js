import { insultPatterns } from "./patternLibrary.js";

export default function detectInsults(text) {

  const t = (text || "").toLowerCase();

  return insultPatterns.some(p => p.test(t));

}