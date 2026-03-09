import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum", "discard"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Watch flagged behaviors to detect high-risk flags and trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const detectedHighRiskFlags = analysisResult.signals.filter((signal) =>
      highRiskFlags.includes(signal.toLowerCase())
    );
    if (detectedHighRiskFlags.length) {
      setAlertFlags(detectedHighRiskFlags);
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  const handleDismissAlert = () => {
    setShowAlert(false);
  };

  // Handler to update analysis result from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}>
          FLAGGED RUN
        </h1>
      </header>

      <section aria-label="Conversation analyzer section" style={{ marginBottom: "1.75rem" }}>
        {!showDashboard ? (
          <ConversationAnalyzerPolish onAnalysisComplete={handleAnalysisUpdate} />
        ) : (
          <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
        )}
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowDashboard(!showDashboard)}
            className="peachy-button"
            aria-pressed={showDashboard}
            aria-label={`${showDashboard ? "Hide" : "Show"} real-time monitoring dashboard`}
          >
            {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
          </button>
        </div>
      </section>

      {showAlert && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={handleDismissAlert} />
      )}

      {analysisResult && (
        <section aria-label="Analysis result visualization and sharing" style={{ marginTop: "2rem" }}>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              analysisResult.signals.map((signal) => ({
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              })) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            analysis={analysisResult}
          />
        </section>
      )}
    </main>
  );
};

export default App;