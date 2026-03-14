import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const App = () => {
  const [analysis, setAnalysis] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardActive, setDashboardActive] = useState(false);

  // On each analysis update, update alert flags if any high-risk detected
  useEffect(() => {
    if (!analysis) {
      setAlertFlags([]);
      return;
    }

    // Define high-risk flags that trigger alert
    const HIGH_RISK_FLAGS = ["insult", "gaslighting", "discard", "threat", "control"];

    const detectedHighRisk = analysis.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag.toLowerCase())
    );

    setAlertFlags(detectedHighRisk);
  }, [analysis]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED Conversation Red Flag Detector
      </h1>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      <section aria-label="Analyze conversation" style={{ marginBottom: "2rem" }}>
        <ConversationAnalyzerPolish onAnalysisComplete={setAnalysis} />
      </section>

      {analysis && (
        <section aria-label="Flagged result visualization" style={{ textAlign: "center" }}>
          <FlaggedResultVisualization
            verdict={analysis.verdict.label}
            flaggedBehaviors={analysis.signals.map((flag) => ({
              type: flag,
              label: flag.charAt(0).toUpperCase() + flag.slice(1),
              confidence: 0.8, // Approximate confidence for UI; real score unavailable here
            }))}
            overallConfidence={analysis.confidence}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}

      <section aria-label="Real-time monitoring dashboard" style={{ marginTop: "2.5rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setDashboardActive((active) => !active)}
          aria-pressed={dashboardActive}
          aria-label={dashboardActive ? "Hide real-time monitoring dashboard" : "Show real-time monitoring dashboard"}
        >
          {dashboardActive ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>

        {dashboardActive && <RealTimeDashboard />}
      </section>
    </main>
  );
};

export default App;