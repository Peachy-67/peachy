import detectInsults from "./detectInsults.js";
import detectManipulation from "./detectManipulation.js";
import detectGaslighting from "./detectGaslighting.js";

export default function analyzeConversation(text) {
  return {
    insults: detectInsults(text),
    manipulation: detectManipulation(text),
    gaslighting: detectGaslighting(text),
  };
}