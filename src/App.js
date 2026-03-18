import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  // Trigger alert if high-risk flags detected
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      setAlertVisible(false);
      return;
    }
    const highRiskDetected = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    if (highRiskDetected.length > 0) {
      setAlertFlags(highRiskDetected);
      setAlertVisible(true);
      // Native alert for immediate notification
      window.alert(
        `Attention: High-risk behavior detected: ${highRiskDetected.join(", ")}`
      );
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
    setAlertFlags([]);
  };

  // Handler for analysis result update from the analyzer
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Handler to toggle real-time dashboard mode
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear previous results and alerts on mode switch
    setAnalysisResult(null);
    setAlertFlags([]);
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged application">
      <header>
        <h1 style={{ color: "#ff6f61", textAlign: "center" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ marginBottom: "1rem" }}
        >
          {showDashboard ? "Back to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {alertVisible && (
        <ImmediateAlert
          flaggedBehaviors={alertFlags}
          onDismiss={dismissAlert}
        />
      )}

      <section aria-live="polite" aria-atomic="true" style={{ minHeight: 320 }}>
        {!showDashboard ? (
          <>
            <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
            {analysisResult && (
              <>
                <FlaggedResultVisualization
                  verdict={mapVerdictLabel(analysisResult.verdict?.band)}
                  flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
                  overallConfidence={analysisResult.confidence}
                />
                <ShareableResult
                  verdict={mapVerdictLabel(analysisResult.verdict?.band)}
                  flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
                  overallConfidence={analysisResult.confidence}
                />
              </>
            )}
          </>
        ) : (
          <RealTimeDashboard
            onAnalysis={handleAnalysisUpdate}
            alertFlags={alertFlags}
            alertVisible={alertVisible}
            onDismissAlert={dismissAlert}
          />
        )}
      </section>
    </main>
  );
};

// Maps backend verdict "band" to verdict label accepted by FlaggedResultVisualization
function mapVerdictLabel(band) {
  if (band === "green") return "Safe";
  if (band === "yellow") return "Caution";
  if (band === "red") return "Flagged";
  return "Safe";
}

// Maps signals array to flagged behaviors with label and confidence (simplified confidence usage)
function mapSignalsToFlags(signals = [], confidence = 0) {
  // Use fixed labels from spec
  const flagLabels = {
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

  // Map signals to flagged behaviors with a default confidence per flag (using overall confidence fallback)
  return signals.map((signal) => ({
    type: signal,
    label: flagLabels[signal] || signal,
    confidence: confidence || 0.5,
  }));
}

export default App;