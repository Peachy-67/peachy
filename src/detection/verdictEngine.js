function getVerdict(riskScore) {
  if (riskScore >= 70) {
    return {
      verdict: "FLAGGED",
      color: "red",
      message: "Strong red flag behavior detected."
    };
  }

  if (riskScore >= 40) {
    return {
      verdict: "CAUTION",
      color: "yellow",
      message: "Some concerning communication patterns detected."
    };
  }

  return {
    verdict: "GREEN",
    color: "green",
    message: "Communication appears healthy."
  };
}

module.exports = getVerdict;