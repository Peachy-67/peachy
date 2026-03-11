import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  // Holds the latest analyzed result data
  const [analysisResult, setAnalysisResult] = useState(null);
  // Holds flagged behaviors array for immediate alert checks
  const [flaggedBehaviors, setFlaggedBehaviors] = useState([]);
  // Controls visibility of real-time dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // On new analysis result, update flagged behaviors extracted
  useEffect(() => {
    if (!analysisResult) {
      setFlaggedBehaviors([]);
      return;
    }

    // flaggedBehaviors array expected as {type, label, confidence}
    setFlaggedBehaviors(analysisResult.flaggedBehaviors || []);
  }, [analysisResult]);

  // Detect any high-risk flags to pass to ImmediateAlert
  const hasHighRiskFlag = flaggedBehaviors.some((flag) => highRiskFlags.has(flag.type));

  // Handler for when new analysis done in ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flags detector app">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#cc2f2f" }}>FLAGGED - Conversation Red Flag Detector</h1>

      {/* Immediate alert for high-risk flagged behaviors */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviors.filter((f) => highRiskFlags.has(f.type))} />

      {/* Toggle button for real-time dashboard */}
      <section aria-label="Real-time dashboard toggle" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard(!showDashboard)}
          aria-pressed={showDashboard}
          className="peachy-button"
          style={{ minWidth: 200 }}
        >
          {showDashboard ? "Hide Real-time Dashboard" : "Show Real-time Dashboard"}
        </button>
      </section>

      {/* Real-time monitoring dashboard - shown conditionally */}
      {showDashboard ? (
        <RealTimeDashboard onAnalyzed={handleAnalysisUpdate} />
      ) : (
        <>
          {/* Conversation analyzer input with analyze button and share */}
          <ConversationAnalyzerPolish onAnalyzed={handleAnalysisUpdate} />

          {/* Visualization of latest flagged results */}
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
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