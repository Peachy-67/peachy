import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "discard", "control"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update alert flags whenever analysisResult changes
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      return;
    }
    const flagged = analysisResult.signals?.filter((signal) => HIGH_RISK_FLAGS.includes(signal)) || [];
    setAlertFlags(flagged);
  }, [analysisResult]);

  // Handler for new analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1>FLAGGED - Conversation Red Flags Detector</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((prev) => !prev)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer view" : "Switch to real-time dashboard view"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;