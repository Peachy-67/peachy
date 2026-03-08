import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  // State for analyzed results from conversation input
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for real-time dashboard toggle
  const [useLiveDashboard, setUseLiveDashboard] = useState(false);

  // Immediate alert control state to dismiss alert manually
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Extract verdict, flagged behaviors, and confidence safely for visualization
  const verdictLabel = analysisResult?.verdict?.label || "Safe";

  // flaggedBehaviors array structure: [{type, label, confidence}]
  // We derive flagged behaviors from signals with confidence if available
  const flaggedBehaviors =
    analysisResult?.signals?.map((signal) => {
      // Find label and confidence for each signal from detailed flags if present in result
      // The input only has signals as strings, so fallback to a minimal label and confidence 0.7
      // If detailed flags are available (like labeled behaviors with confidence), use them
      if (analysisResult?.meta?.flags && Array.isArray(analysisResult.meta.flags)) {
        const metaFlag = analysisResult.meta.flags.find((f) => f.type === signal);
        if (metaFlag) {
          return {
            type: metaFlag.type,
            label: metaFlag.label || metaFlag.type,
            confidence: typeof metaFlag.confidence === "number" ? metaFlag.confidence : 0.7,
          };
        }
      }
      return { type: signal, label: signal.charAt(0).toUpperCase() + signal.slice(1), confidence: 0.7 };
    }) || [];

  const overallConfidence = typeof analysisResult?.confidence === "number" ? analysisResult.confidence : 0;

  // Determine if there are any high-risk flags present for alert
  const hasHighRiskFlags = flaggedBehaviors.some((flag) => highRiskFlags.has(flag.type));

  // Reset alert dismissed if new analysis with high risk flags arrives
  useEffect(() => {
    if (hasHighRiskFlags) {
      setAlertDismissed(false);
    }
  }, [hasHighRiskFlags]);

  // Handler for conversation analysis result from ConversationAnalyzerPolish
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  }, []);

  // Handler for errors from ConversationAnalyzerPolish
  const handleAnalysisError = useCallback((err) => {
    setError(err);
    setAnalysisResult(null);
    setLoading(false);
  }, []);

  // Handler for loading state updates from ConversationAnalyzerPolish
  const handleLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  // Handler for toggle of real-time dashboard on/off
  const toggleDashboard = () => {
    setUseLiveDashboard((enabled) => !enabled);
  };

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation red flag detection interface">
      <h1>FLAGGED Conversation Analyzer</h1>

      {/* Real-time monitor toggle */}
      <section aria-label="Toggle real-time monitoring dashboard">
        <button type="button" onClick={toggleDashboard} aria-pressed={useLiveDashboard} className="peachy-button">
          {useLiveDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {/* Conditionally show real-time dashboard or the conversation analyzer */}
      {useLiveDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          {/* Conversation input and analyze button */}
          <ConversationAnalyzerPolish
            onResult={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoadingState}
            loading={loading}
          />

          {/* Show immediate alert if any high-risk flags */}
          {hasHighRiskFlags && !alertDismissed && analysisResult ? (
            <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={() => setAlertDismissed(true)} />
          ) : null}

          {/* Show flagged result visualization if analysis available */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
          )}

          {/* Show shareable result including share buttons */}
          {analysisResult && <ShareableResult analysisResult={analysisResult} />}
          
          {/* Show errors if any */}
          {error && (
            <p role="alert" style={{ color: "#cc2f2f", fontWeight: "600", marginTop: "1rem" }}>
              Error: {error}
            </p>
          )}
        </>
      )}
    </main>
  );
};

export default App;