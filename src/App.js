import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS_SET = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "control",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check for and trigger alerts when high-risk flags appear
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const flaggedTypes = analysisResult.signals || [];
    const highRiskDetected = flaggedTypes.filter((flag) =>
      HIGH_RISK_FLAGS_SET.has(flag)
    );
    if (highRiskDetected.length) {
      setAlertFlags(highRiskDetected);
      setShowAlert(true);
      // Also native alert for immediacy:
      alert(
        `Warning: High-risk behavior(s) detected: ${highRiskDetected
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis output from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
  };

  // Handler to dismiss the alert banner
  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Main conversation analyzer input and results">
        {!showDashboard && (
          <>
            <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />
            {analysisResult && (
              <>
                <FlaggedResultVisualization
                  verdict={analysisResult.verdict.label}
                  flaggedBehaviors={(analysisResult.signals || []).map((type) => {
                    // Map signal type to label and confidence (use confidence from analysisResult if available)
                    // We have no individual confidence per signal in analysisResult; fallback confidence is overall
                    const labelMap = {
                      insult: "Insult",
                      manipulation: "Manipulation",
                      gaslighting: "Gaslighting",
                      discard: "Discard",
                      control: "Control",
                      ultimatum: "Ultimatum",
                      threat: "Threat",
                      guilt: "Guilt",
                      boundary_push: "Boundary Push",
                      inconsistency: "Inconsistency",
                    };
                    return {
                      type,
                      label: labelMap[type] || type,
                      confidence: analysisResult.confidence || 0.5,
                    };
                  })}
                  overallConfidence={analysisResult.confidence || 0}
                />
                <ShareableResult result={analysisResult} originalText={analysisResult.originalText || ""} />
              </>
            )}
          </>
        )}
      </section>

      <ImmediateAlert
        visible={showAlert}
        flags={alertFlags}
        onDismiss={handleDismissAlert}
      />

      <section aria-label="Real-time dashboard toggle and display">
        <button
          type="button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginTop: "20px", display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          {showDashboard ? "Switch to Paste Analyzer" : "Open Real-Time Dashboard"}
        </button>
        {showDashboard && <RealTimeDashboard onAnalysis={handleAnalysis} />}
      </section>
    </main>
  );
}

export default App;