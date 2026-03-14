import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentText, setCurrentText] = useState("");

  // Update alerts when detected flagged behaviors change
  useEffect(() => {
    if (!analysisResult) {
      setAlerts([]);
      return;
    }
    // high-risk flags for alerting can be insult, gaslighting, threat, discard, control
    const highRiskFlags = ["insult", "gaslighting", "threat", "discard", "control"];
    const detectedFlags = analysisResult.signals || [];
    const activeAlerts = detectedFlags.filter((flag) => highRiskFlags.includes(flag));
    setAlerts(activeAlerts);
  }, [analysisResult]);

  // Handler for analysis updates from analyzer or dashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Map signals to badge data for visualization (type, label, confidence)
  // Using existing flags for labels and confidence from backend
  const flaggedBadges = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // We do not have detailed confidence per flag from backend;
    // Assign equal confidence from overall confidence.
    const confidence = analysisResult.confidence || 0;
    const labels = {
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
    return analysisResult.signals.map((sig) => ({
      type: sig,
      label: labels[sig] || sig,
      confidence,
    }));
  }, [analysisResult]);

  // Derive verdict label and band for visualization from analysis results
  // The analysisResult may have verdict object or fallback
  const verdict =
    analysisResult && analysisResult.verdict && analysisResult.verdict.band
      ? // legacy: verdict label as Safe/Caution/Flagged based on band
        analysisResult.verdict.band === "green"
          ? "Safe"
          : analysisResult.verdict.band === "yellow"
          ? "Caution"
          : "Flagged"
      : "Safe";

  // Overall confidence for visualization
  const overallConfidence = analysisResult ? analysisResult.confidence || 0 : 0;

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <h1 tabIndex={-1} style={{ textAlign: "center", userSelect: "none", marginBottom: "1.5rem", color: "#ff4d6d" }}>
        FLAGGED Conversation Red Flag Detector
      </h1>

      <button
        type="button"
        className="peachy-button"
        onClick={() => setShowDashboard((v) => !v)}
        aria-pressed={showDashboard}
        aria-label={`${showDashboard ? "Hide" : "Show"} real-time dashboard`}
        style={{ marginBottom: "1.5rem", display: "block", width: "100%" }}
      >
        {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
      </button>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysisUpdate}
          initialText={currentText}
          onTextChange={setCurrentText}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            initialText={currentText}
            onTextChange={setCurrentText}
          />

          {analysisResult && (
            <section aria-label="Analysis results" tabIndex={-1}>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBadges}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                analysis={analysisResult}
                flaggedBadges={flaggedBadges}
                verdict={verdict}
              />
            </section>
          )}
        </>
      )}

      <ImmediateAlert
        flaggedBehaviors={alerts}
        onDismiss={() => setAlerts([])}
      />
    </main>
  );
};

export default App;