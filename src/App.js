import React, { useState, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  // State of the latest analysis result
  const [analysisResult, setAnalysisResult] = useState(null);
  // Controls if real-time dashboard view is active
  const [showDashboard, setShowDashboard] = useState(false);
  // Controls the immediate alert visible state
  const [showAlert, setShowAlert] = useState(true);

  // Callback when new analysis happens
  const onAnalyze = useCallback((result) => {
    setAnalysisResult(result);
    setShowAlert(true); // reset alert visibility on new analysis
  }, []);

  // Dismiss alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Extract flagged behaviors with confidence for alert and display
  const flaggedBehaviors =
    analysisResult?.signals?.map((type) => {
      // Map to label and confidence for badge display
      let label = type.charAt(0).toUpperCase() + type.slice(1);
      let confidence = 1; // default confidence (could be enriched if available)
      return { type, label, confidence };
    }) || [];

  return (
    <main className="ui-container" aria-label="FLAGGED application">
      <header>
        <h1
          style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}
          tabIndex={-1}
        >
          FLAGGED
        </h1>
        <p
          style={{
            textAlign: "center",
            marginBottom: "1rem",
            fontWeight: "600",
            userSelect: "none",
          }}
        >
          Detect red flags in conversations - manipulation, gaslighting, insults,
          and more.
        </p>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setShowDashboard((v) => !v)}
            aria-pressed={showDashboard}
            aria-label={
              showDashboard
                ? "Switch to analyze conversation paste mode"
                : "Switch to real-time dashboard mode"
            }
            className="peachy-button"
          >
            {showDashboard ? "Paste Conversation Analyzer" : "Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={onAnalyze}
          initialAnalysis={analysisResult}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalyze={onAnalyze} />
          {analysisResult && (
            <>
              <ImmediateAlert
                flaggedBehaviors={flaggedBehaviors}
                visible={showAlert}
                onDismiss={dismissAlert}
              />
              <FlaggedResultVisualization
                verdict={analysisResult.verdict?.label || "Safe"}
                flaggedBehaviors={flaggedBehaviors}
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