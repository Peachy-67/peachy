import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "manipulation",
  "gaslighting",
  "discard",
  "control",
  "threat",
  "ultimatum",
  "boundary_push",
];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Extract flagged behaviors from analysisResult for visualization and alert
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // Map signals to objects with type, label, and confidence (confidence from overall confidence)
    const confidence = analysisResult.confidence || 0;
    return analysisResult.signals.map((type) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      confidence,
    }));
  }, [analysisResult]);

  // Determine verdict label from V1 verdict band to string labels we expect
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
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

  // Overall confidence for visualization
  const overallConfidence = analysisResult?.confidence || 0;

  // On new analysis, check for high risk flags to show alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const foundHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );
    if (foundHighRisk.length) {
      // Show alert and pass the flags
      setAlertFlags(foundHighRisk);
      setShowAlert(true);
      // Also trigger native alert popup to ensure immediate user awareness
      alert(
        `High-risk behaviors detected: ${foundHighRisk
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for dismissing alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Handler for analysis submission from ConversationAnalyzerPolish
  const handleAnalyze = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const handleError = (err) => {
    setError(err);
    setLoading(false);
  };

  // Toggle between dashboard and paste analyzer interface
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear results and alerts on view change
    setAnalysisResult(null);
    setShowAlert(false);
    setAlertFlags([]);
    setError(null);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
        FLAGGED &middot; Conversation Red Flags Detector
      </h1>

      <section style={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <button onClick={toggleDashboard} className="peachy-button" aria-pressed={showDashboard}>
          {showDashboard ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
        </button>
      </section>

      {showAlert && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalyze}
          loading={loading}
          setLoading={handleLoading}
          error={error}
          setError={handleError}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalyze={handleAnalyze}
          loading={loading}
          setLoading={handleLoading}
          error={error}
          setError={handleError}
          initialText=""
        />
      )}

      {analysisResult && (
        <section
          aria-live="polite"
          aria-label="Analysis result"
          style={{ marginTop: "2rem", userSelect: "text" }}
        >
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult analysis={analysisResult} flaggedBehaviors={flaggedBehaviors} verdict={verdict} />
        </section>
      )}
    </main>
  );
};

export default App;