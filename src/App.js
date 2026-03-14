import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [inputConversation, setInputConversation] = useState("");

  // Update alert flags when analysisResult changes if there are high-risk flags
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) {
      setAlertFlags([]);
      return;
    }

    // Filter high-risk signals detected
    const detectedHighRisk = analysisResult.signals.filter((sig) =>
      HIGH_RISK_FLAGS.has(sig)
    );

    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Handler when analysis completes from ConversationAnalyzerPolish or RealTimeDashboard
  const onAnalysisUpdate = (newResult) => {
    // Accept full analysisResult with verdict, signals, confidence, etc
    setAnalysisResult(newResult);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED red flags conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <p style={{ userSelect: "none" }}>
          Detect red flags in conversations and identify harmful behavior
        </p>
      </header>

      {/* Immediate alert banner when high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Conversation input and analyze button */}
      {!dashboardVisible && (
        <ConversationAnalyzerPolish
          onAnalysisComplete={onAnalysisUpdate}
          initialConversation={inputConversation}
          onConversationChange={setInputConversation}
        />
      )}

      {/* Display flagged result visualization if analysis available */}
      {analysisResult && !dashboardVisible && (
        <section aria-label="Analysis result visualization" role="region">
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />

          {/* Share options for flagged result */}
          <ShareableResult
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={analysisResult.signals.map((type) => ({
              type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            confidence={analysisResult.confidence || 0}
            conversationExcerpt={
              inputConversation.length > 450
                ? inputConversation.substring(0, 450) + "..."
                : inputConversation
            }
          />
        </section>
      )}

      {/* Toggle button for real-time monitoring dashboard */}
      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setDashboardVisible(!dashboardVisible)}
          aria-pressed={dashboardVisible}
          className="peachy-button"
          aria-label={
            dashboardVisible
              ? "Hide real-time conversation monitoring dashboard"
              : "Show real-time conversation monitoring dashboard"
          }
        >
          {dashboardVisible ? "Close Real-Time Dashboard" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {/* Display RealTimeDashboard when toggled */}
      {dashboardVisible && (
        <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
      )}
    </main>
  );
};

export default App;