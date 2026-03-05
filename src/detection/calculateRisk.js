export default function calculateRisk(signals = []) {

  const weights = {
    insult: 2,
    manipulation: 2,
    gaslighting: 3,
    discard: 3,
    threat: 4,
    ultimatum: 2,
    control: 2,
    guilt: 2
  };

  let score = 0;

  signals.forEach(signal => {
    score += weights[signal] || 0;
  });

  let level = "LOW";

  if (score >= 7) level = "HIGH";
  else if (score >= 4) level = "MEDIUM";

  return {
    score,
    level
  };

}