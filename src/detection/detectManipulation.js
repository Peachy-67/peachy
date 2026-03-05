import { manipulationPatterns } from "./patternLibrary.js";

export default function detectManipulation(text) {

  const t = (text || "").toLowerCase();

  return manipulationPatterns.some(p => p.test(t));

}