import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "discard",
  "control",
  "ultimatum",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [immediateAlertFlags, setImmediateAlertFlags] = useState([]);

  // When analysisResult changes, check for high-risk flags and show alert
  useEffect(() => {
    if (!analysisResult?.signals?.length) {
      setImmediateAlertFlags([]);
      return;
    }

    const highRiskFound = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );

    setImmediateAlertFlags(highRiskFound);
  }, [analysisResult]);

  // Handler for analysis result from ConversationAnalyzerPolish
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED red flag conversation analyzer">
      <header>
        <h1
          tabIndex={-1}
          style={{ userSelect: "none", textAlign: "center", color: "#ff5e48" }}
        >
          FLAGGED
        </h1>
        <p
          style={{
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "1.25rem",
            userSelect: "none",
          }}
        >
          Detect conversation red flags instantly.
        </p>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={
            showDashboard
              ? "Switch to Paste Conversation Analyzer"
              : "Switch to Real-Time Dashboard"
          }
          style={{ marginBottom: "1.5rem" }}
        >
          {showDashboard ? "Use Paste Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={immediateAlertFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleAnalysis}
          analysisResult={analysisResult}
          key="dashboard"
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysis} key="analyzer" />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => {
                  // Map signal type to label and confidence if known
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
                  return {
                    type,
                    label: labelMap[type] || type,
                    confidence: 0.9, // Confidence from backend is overall; individual unknown here
                  };
                })}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;