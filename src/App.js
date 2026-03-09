import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * Main application component integrating the conversation analyzer,
 * immediate alerts, result visualization with sharing, and optional real-time dashboard view.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);

  // Check for high risk flags to trigger alert
  useEffect(() => {
    if (
      analysisResult &&
      analysisResult.signals &&
      analysisResult.signals.length > 0
    ) {
      // Define high-risk flags which trigger alerts immediately
      const highRiskTypes = new Set([
        "insult",
        "gaslighting",
        "threat",
        "discard",
        "manipulation",
        "control",
      ]);

      const foundHighRisk = analysisResult.signals.filter((flag) =>
        highRiskTypes.has(flag.toLowerCase())
      );

      if (foundHighRisk.length > 0) {
        setHighRiskFlags(foundHighRisk);
        setAlertVisible(true);

        // Also trigger native alert for immediate notification
        alert(
          `High risk behaviors detected: ${foundHighRisk
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}`
        );
      } else {
        setAlertVisible(false);
        setHighRiskFlags([]);
      }
    } else {
      setAlertVisible(false);
      setHighRiskFlags([]);
    }
  }, [analysisResult]);

  /**
   * Handler to receive new analysis result from conversation analyzer component.
   * Updates state to display results and trigger alerts.
   * @param {object} result
   */
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  /**
   * Handler to dismiss visible alert banner.
   */
  const handleAlertDismiss = () => {
    setAlertVisible(false);
  };

  /**
   * Toggles the visibility of the real-time dashboard.
   */
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 tabIndex="0" aria-level="1" className="app-title">
          FLAGGED
        </h1>
        <p>
          Paste your conversation below to detect behavioral red flags, get an
          immediate verdict, and share results.
        </p>
      </header>

      {/* Immediate alert notification banner */}
      <ImmediateAlert
        visible={alertVisible}
        flaggedBehaviors={highRiskFlags}
        onDismiss={handleAlertDismiss}
      />

      {/* Conversation analyzer input and analysis */}
      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <section
              aria-live="polite"
              aria-label="Analysis results and sharing"
              tabIndex={-1}
            >
              {/* Polished flagged result visualization */}
              <FlaggedResultVisualization
                verdict={convertVerdictBandToLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                overallConfidence={analysisResult.confidence}
              />
              {/* Shareable result section */}
              <ShareableResult
                conversationText={analysisResult.meta?.inputText || ""}
                verdict={convertVerdictBandToLabel(analysisResult.verdict.band)}
                flaggedBehaviors={mapSignalsToFlags(analysisResult.signals)}
                overallConfidence={analysisResult.confidence}
              />
            </section>
          )}
        </>
      )}

      {/* Toggle button to switch between analyzer and real-time dashboard */}
      <button
        className="peachy-button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        style={{ marginTop: "1.25rem", display: "block", marginLeft: "auto", marginRight: "auto" }}
      >
        {showDashboard ? "Return to Analyzer" : "Open Real-Time Dashboard"}
      </button>

      {/* Real-Time dashboard (live monitoring) */}
      {showDashboard && (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialAnalysis={analysisResult}
        />
      )}

      <footer aria-label="FLAGGED app footer" style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.85rem", color: "#666" }}>
        &copy; 2024 FLAGGED.RUN &middot; Detect manipulation, gaslighting & harmful behavior in conversations
      </footer>
    </main>
  );
};

/**
 * Converts verdict band (green, yellow, red) to label expected by FlaggedResultVisualization.
 * @param {string} band - 'green', 'yellow', or 'red'
 * @returns {string} - 'Safe', 'Caution', or 'Flagged'
 */
function convertVerdictBandToLabel(band) {
  switch (band) {
    case "green":
      return "Safe";
    case "yellow":
      return "Caution";
    case "red":
      return "Flagged";
    default:
      return "Safe";
  }
}

/**
 * Maps raw signals array (strings) to array of flag objects expected by FlaggedResultVisualization.
 * Each flag object: {type, label, confidence}
 * Confidence is estimated default here since backend returns confidence overall only.
 * @param {string[]} signals
 * @returns {{type:string, label:string, confidence:number}[]}
 */
function mapSignalsToFlags(signals = []) {
  if (!Array.isArray(signals)) return [];

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

  // Assign default confidence 0.7 for each flag (backend only returns overall confidence)
  return signals.map((signal) => ({
    type: signal,
    label: labelMap[signal.toLowerCase()] || signal,
    confidence: 0.7,
  }));
}

export default App;