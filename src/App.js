import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "manipulation", "gaslighting", "discard", "control", "ultimatum", "threat", "boundary_push"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null); // holds latest analysis output
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  const handleAnalysisUpdate = (result, inputText) => {
    setAnalysisResult(result);
    setLastAnalyzedText(inputText || "");
    
    // Determine if any high-risk flags present to trigger alert
    const detectedHighRiskFlags = (result?.signals || []).filter(flag => HIGH_RISK_FLAGS.has(flag));

    if (detectedHighRiskFlags.length > 0) {
      setAlertFlags(detectedHighRiskFlags);
      setAlertVisible(true);
    } else {
      // No high-risk flags, hide alert
      setAlertFlags([]);
      setAlertVisible(false);
    }
  };

  // Dismiss alert handler for banner dismissal
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Handler toggle RealTimeDashboard view
  const toggleDashboard = () => {
    setShowDashboard(prev => !prev);
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analyzer application">
      <h1 style={{ textAlign: "center", userSelect: "none", marginBottom: "1rem", color: "#ff5a42" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <section aria-label="Toggle real-time conversation dashboard" style={{ textAlign: "center", margin: "1.25rem 0" }}>
        <button onClick={toggleDashboard} aria-pressed={showDashboard} aria-controls="dashboard-section">
          {showDashboard ? "Back to Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          onDismiss={dismissAlert}
        />
      )}

      {!showDashboard ? (
        <>
          <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={(analysisResult.signals || []).map((signal) => {
                  // Generate label and confidence for each signal
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
                    type: signal,
                    label: labelMap[signal] || signal,
                    confidence: analysisResult.confidence || 0,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={(analysisResult.signals || []).map((signal) => {
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
                    type: signal,
                    label: labelMap[signal] || signal,
                    confidence: analysisResult.confidence || 0,
                  };
                })}
                overallConfidence={analysisResult.confidence || 0}
                conversationText={lastAnalyzedText}
              />
            </>
          )}
        </>
      ) : (
        <section id="dashboard-section" aria-label="Real-time conversation monitoring dashboard" tabIndex={-1}>
          <RealTimeDashboard
            onAnalysisUpdate={handleAnalysisUpdate}
          />
        </section>
      )}
    </main>
  );
};

export default App;