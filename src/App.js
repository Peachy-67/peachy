import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "threat",
  "discard",
  "gaslighting",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardMode, setDashboardMode] = useState(false);

  // Derived flagged behaviors array for visualization
  const flaggedBehaviors = analysisResult?.signals
    ? analysisResult.signals.map((signal) => ({
        type: signal,
        label: signal.charAt(0).toUpperCase() + signal.slice(1),
        confidence: analysisResult.confidence ?? 0,
      }))
    : [];

  // Determine if any high risk signals to trigger alert
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }
    const foundHighRisk = analysisResult.signals.filter((s) =>
      highRiskFlags.has(s)
    );
    setAlertFlags(foundHighRisk);
  }, [analysisResult]);

  // Handler: callback to receive analysis from ConversationAnalyzerPolish
  const onAnalysis = ({ result, error: err }) => {
    if (err) {
      setError(err);
      setAnalysisResult(null);
    } else {
      setAnalysisResult(result);
      setError(null);
    }
    setLoading(false);
  };

  // Toggle dashboard mode
  const toggleDashboard = () => {
    setDashboardMode((d) => !d);
    // Reset states when switching
    setAnalysisResult(null);
    setAlertFlags([]);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged application">
      <h1 style={{ textAlign: "center", userSelect: "none", color: "#ff6f61" }}>
        FLAGGED
      </h1>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={dashboardMode}
          aria-label={
            dashboardMode
              ? "Switch to conversation paste analyzer"
              : "Switch to real-time dashboard view"
          }
        >
          {dashboardMode ? "Use Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {dashboardMode ? (
        <>
          <RealTimeDashboard
            onAnalysisResult={(res) => {
              setAnalysisResult(res);
              setError(null);
            }}
            onError={(err) => {
              setError(err);
              setAnalysisResult(null);
            }}
          />
          {analysisResult && (
            <ShareableResult
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence}
              conversationExcerpt=""
              reactions={analysisResult.reaction}
            />
          )}
        </>
      ) : (
        <>
          <ConversationAnalyzerPolish
            onResult={(result) => {
              setLoading(false);
              onAnalysis({ result });
            }}
            onLoading={() => {
              setLoading(true);
              setError(null);
              setAnalysisResult(null);
            }}
            onError={(err) => {
              setLoading(false);
              onAnalysis({ error: err });
            }}
          />

          {loading && (
            <p role="status" aria-live="polite" style={{ textAlign: "center" }}>
              Analyzing conversation...
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="alert-banner"
              aria-live="assertive"
              tabIndex={-1}
              style={{ marginTop: "1rem" }}
            >
              {error}
            </div>
          )}

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
              />
              <ShareableResult
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence}
                conversationExcerpt=""
                reactions={analysisResult.reaction}
              />
            </>
          )}
        </>
      )}

      <ImmediateAlert alertFlags={alertFlags} />

    </main>
  );
};

export default App;