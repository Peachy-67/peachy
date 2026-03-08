import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showImmediateAlert, setShowImmediateAlert] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // When analysis result updates, check for high-risk flags to trigger alert
  useEffect(() => {
    if (
      !analysisResult ||
      !analysisResult.signals ||
      analysisResult.signals.length === 0
    ) {
      setShowImmediateAlert(false);
      return;
    }
    const hasHighRisk = analysisResult.signals.some((flag) =>
      highRiskFlags.has(flag.toLowerCase())
    );
    setShowImmediateAlert(hasHighRisk);
  }, [analysisResult]);

  return (
    <div className="ui-container" aria-label="Flagged conversation analysis application">
      <header>
        <h1 style={{ color: "#ff6f61", textAlign: "center", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
      </header>

      {showImmediateAlert && (
        <ImmediateAlert
          flaggedBehaviors={
            analysisResult?.signals
              ?.filter((flag) => highRiskFlags.has(flag.toLowerCase()))
              .map((f) => f.charAt(0).toUpperCase() + f.slice(1)) || []
          }
          onDismiss={() => setShowImmediateAlert(false)}
        />
      )}

      <section aria-label="Conversation analysis input and results" tabIndex={-1}>
        {!realTimeMode && (
          <>
            <ConversationAnalyzerPolish
              onResult={setAnalysisResult}
              key="conversation-analyzer"
            />
            {analysisResult && !realTimeMode && (
              <>
                <FlaggedResultVisualization
                  verdict={
                    analysisResult.verdict?.label ||
                    (analysisResult.verdict?.band === "green"
                      ? "Safe"
                      : analysisResult.verdict?.band === "yellow"
                      ? "Caution"
                      : "Flagged")
                  }
                  flaggedBehaviors={
                    analysisResult.signals
                      ? analysisResult.signals.map((signal) => ({
                          type: signal,
                          label:
                            signal.charAt(0).toUpperCase() + signal.slice(1),
                          confidence: analysisResult.confidence || 0,
                        }))
                      : []
                  }
                  overallConfidence={analysisResult.confidence || 0}
                />
                <ShareableResult
                  result={analysisResult}
                  conversationExcerpt={
                    analysisResult?.meta?.excerpt || ""
                  }
                />
              </>
            )}
          </>
        )}
      </section>

      <section
        aria-label="Real-time conversation monitoring dashboard"
        style={{ marginTop: 32 }}
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setRealTimeMode((prev) => !prev)}
          aria-pressed={realTimeMode}
          aria-label={
            realTimeMode
              ? "Disable real-time conversation monitoring"
              : "Enable real-time conversation monitoring"
          }
        >
          {realTimeMode ? "Disable" : "Enable"} Real-Time Dashboard
        </button>

        {realTimeMode && (
          <RealTimeDashboard
            onLiveAnalysis={setAnalysisResult}
            key="real-time-dashboard"
          />
        )}
      </section>
    </div>
  );
};

export default App;