import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolishImprovements.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Extract high-risk flags for ImmediateAlert
  // High-risk flags: insult, gaslighting, discard, threat, ultimatum
  const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum"];

  const flaggedBehaviors = analysisResult?.signals?.map((signal) => {
    // Map signal to label and type
    // Use signal as type, label just capitalize first letter
    // Confidence will be from 0.8 as default because per backend confidence might be for overall only
    return {
      type: signal,
      label: signal.charAt(0).toUpperCase() + signal.slice(1),
      confidence: 0.8, // default moderate confidence; component can be updated if we had finer confidence per signal
    };
  }) || [];

  // Overall confidence from analysis or 0
  const overallConfidence = analysisResult?.confidence || 0;

  // Verdict normalized label to UI verdict labels ("Safe","Caution","Flagged")
  // Map backend verdict.band: green->Safe, yellow->Caution, red->Flagged
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdict = verdictMap[analysisResult?.verdict?.band] || "Safe";

  // Detect any high-risk flags present
  const hasHighRiskFlag = analysisResult?.signals?.some((sig) => highRiskFlags.includes(sig));

  // Handle alert dismissal for UI
  useEffect(() => {
    if (!hasHighRiskFlag) {
      setAlertDismissed(false); // reset on safe
    }
  }, [hasHighRiskFlag]);

  return (
    <main className="ui-container" aria-label="Conversation red flag detection app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>

      {/* Toggle Dashboard Button */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          type="button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={setAnalysisResult} />

          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={flaggedBehaviors.filter((f) => highRiskFlags.includes(f.type))}
                visible={!alertDismissed && hasHighRiskFlag}
                onDismiss={() => setAlertDismissed(true)}
              />

              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />

              <ShareableResult
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
            </>
          )}
        </>
      )}

      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={setAnalysisResult}
          flaggedBehaviors={flaggedBehaviors}
          verdict={verdict}
          overallConfidence={overallConfidence}
        />
      )}
    </main>
  );
};

export default App;