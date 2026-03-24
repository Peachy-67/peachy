import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "manipulation",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Monitor analysisResult for high risk flags to trigger alert
  useEffect(() => {
    if (analysisResult && Array.isArray(analysisResult.signals)) {
      const detectedHighRisk = analysisResult.signals.filter((flag) =>
        highRiskFlags.has(flag)
      );
      if (detectedHighRisk.length > 0) {
        setAlertFlags(detectedHighRisk);
        setShowAlert(true);
      } else {
        setShowAlert(false);
        setAlertFlags([]);
      }
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to dismiss alert banner
  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Callback from ConversationAnalyzerPolish or RealTimeDashboard on new analysis
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  // Button label and toggle handler for switching dashboard mode
  const toggleDashboardMode = () => setShowDashboard((prev) => !prev);
  const toggleButtonLabel = showDashboard
    ? "Switch to Analyzer"
    : "Switch to Real-Time Dashboard";

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1.4rem" }}>
        <h1 tabIndex={-1} style={{ userSelect: "none", color: "#ff6f61" }}>
          FLAGGED
        </h1>
        <button
          onClick={toggleDashboardMode}
          aria-pressed={showDashboard}
          className="peachy-button"
          type="button"
          aria-label="Toggle between conversation analyzer and real-time dashboard"
        >
          {toggleButtonLabel}
        </button>
      </header>

      {/* Immediate Alert for High Risk Flags */}
      {showAlert && (
        <ImmediateAlert flags={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {/* Main Content: Either RealTimeDashboard or ConversationAnalyzerPolish */}
      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Result Visualization and Sharing: only show if analysisResult exists and mode is analyzer */}
      {!showDashboard && analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={
              analysisResult.verdict?.label === "Safe"
                ? "Safe"
                : analysisResult.verdict?.label === "Caution"
                ? "Caution"
                : "Flagged"
            }
            flaggedBehaviors={analysisResult.signals.map((flagType) => ({
              type: flagType,
              label:
                flagType.charAt(0).toUpperCase() + flagType.slice(1).replace(/_/g, " "),
              confidence:
                typeof analysisResult.confidence === "number"
                  ? analysisResult.confidence
                  : 0,
            }))}
            overallConfidence={
              typeof analysisResult.confidence === "number"
                ? analysisResult.confidence
                : 0
            }
          />
          <ShareableResult result={analysisResult} />
        </>
      )}
    </div>
  );
};

export default App;