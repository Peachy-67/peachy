import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "manipulation", "gaslighting", "threat", "discard", "ultimatum", "control"]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [lastAnalyzedText, setLastAnalyzedText] = useState("");
  const [alertVisible, setAlertVisible] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors as objects for visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals) return [];

    // Map known signals with labels; use type as label fallback, confidence default to 1 for UI visualization
    const labelsMap = {
      insult: "Insult",
      manipulation: "Manipulation",
      gaslighting: "Gaslighting",
      discard: "Discard",
      ultimatum: "Ultimatum",
      threat: "Threat",
      control: "Control",
      guilt: "Guilt",
      boundary_push: "Boundary Push",
      inconsistency: "Inconsistency",
    };

    return analysisResult.signals.map((sig) => ({
      type: sig,
      label: labelsMap[sig] || sig.charAt(0).toUpperCase() + sig.slice(1),
      confidence: 1,
    }));
  }, [analysisResult]);

  // Determine verdict label ("Safe", "Caution", "Flagged") by band mapping
  const verdict = React.useMemo(() => {
    if (!analysisResult?.verdict || !analysisResult.verdict.band) return "Safe";
    switch (analysisResult.verdict.band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  }, [analysisResult]);

  // Check if any high-risk flagged behaviors present for immediate alert
  const highRiskFlagsDetected = React.useMemo(() => {
    if (!analysisResult?.signals) return false;
    return analysisResult.signals.some((signal) => HIGH_RISK_FLAGS.has(signal));
  }, [analysisResult]);

  // Reset alert visibility when new analysis occurs
  useEffect(() => {
    if (highRiskFlagsDetected) {
      setAlertVisible(true);
    } else {
      setAlertVisible(false);
    }
  }, [highRiskFlagsDetected]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result, inputText) => {
    setAnalysisResult(result);
    setLastAnalyzedText(inputText);
  };

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <main className="container" aria-label="FLAGGED application main area">
      <header>
        <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
      </header>

      {/* Immediate alert for high-risk flags */}
      {alertVisible && highRiskFlagsDetected && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={dismissAlert} />
      )}

      {/* Toggle between real-time dashboard and classic conversation analyzer */}
      <section aria-label="Toggle real-time dashboard view" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time conversation dashboard" : "Show real-time conversation dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
      )}

      {/* Result visualization and sharing for last analysis */}
      {analysisResult && (
        <section aria-label="Flagged conversation analysis results" style={{ marginTop: "2rem", textAlign: "center" }}>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysis={analysisResult}
            analyzedText={lastAnalyzedText}
            verdictLabel={verdict}
            flaggedBehaviors={flaggedBehaviors}
          />
        </section>
      )}
    </main>
  );
}

export default App;