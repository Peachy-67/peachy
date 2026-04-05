import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  // Analysis state from conversation analyzer or real-time dashboard
  const [analysisResult, setAnalysisResult] = useState(null);
  // Track reported high risk flags for immediate alert
  const [alertFlags, setAlertFlags] = useState([]);
  // Show error or loading state in main view
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // Toggle between paste analyzer and real-time dashboard modes
  const [useRealTimeMode, setUseRealTimeMode] = useState(false);

  // When analysis result changes, detect high-risk flags for alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const detectedHighRisk = analysisResult.signals.filter((flag) =>
      HIGH_RISK_FLAGS.has(flag)
    );
    setAlertFlags(detectedHighRisk);
  }, [analysisResult]);

  // Handler for analysis request updates from ConversationAnalyzerPolish
  const handleAnalysisUpdate = (result, loadingState, errorMsg) => {
    setLoading(loadingState);
    setError(errorMsg);
    if (result) {
      setAnalysisResult(result);
    }
  };

  // Handler for analysis updates from RealTimeDashboard (live input)
  const handleRealTimeAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Toggle between modes
  const toggleMode = () => {
    setUseRealTimeMode((prev) => !prev);
    // Reset results on mode switch
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
    setAlertFlags([]);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED Red Flags Detection App">
      <header>
        <h1
          tabIndex={-1}
          style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}
        >
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", marginTop: "-0.4rem", userSelect: "none" }}>
          Detect red flags in your conversations
        </p>
        <div style={{ textAlign: "center", margin: "12px 0" }}>
          <button
            onClick={toggleMode}
            aria-pressed={useRealTimeMode}
            aria-label={
              useRealTimeMode
                ? "Switch to paste conversation analyzer"
                : "Switch to real-time monitoring dashboard"
            }
            className="peachy-button"
            type="button"
          >
            {useRealTimeMode ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {/* Immediate alert shown if high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {/* Conditional UI modes */}

      {useRealTimeMode ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleRealTimeAnalysisUpdate}
          initialResult={analysisResult}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          loading={loading}
          error={error}
          initialResult={analysisResult}
        />
      )}

      {/* Show results visualization and sharing when we have results and NO error or loading */}

      {!loading && !error && analysisResult && analysisResult.verdict && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => {
              // Map known label and confidence if available or provide fallback
              // Use same label as signal for now
              return {
                type: signal,
                label: signal.charAt(0).toUpperCase() + signal.slice(1),
                confidence: analysisResult.confidence || 0,
              };
            })}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals}
            confidence={analysisResult.confidence}
            conversationExcerpt="" // No excerpt available at this level, could be added if desired
          />
        </>
      )}

      {/* Show loading or error message */}
      {loading && (
        <p aria-live="polite" style={{ textAlign: "center", marginTop: "1rem" }}>
          Analyzing conversation...
        </p>
      )}
      {error && (
        <p
          role="alert"
          style={{ color: "#cc2f2f", fontWeight: "600", textAlign: "center", marginTop: "1rem" }}
        >
          {error}
        </p>
      )}
    </main>
  );
};

export default App;