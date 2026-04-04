import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // Main app state for analysis
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State to toggle between conversation paste analyzer and realtime dashboard
  const [showDashboard, setShowDashboard] = useState(false);

  // State to track visible immediate alert flags (array of flag types)
  const [alertFlags, setAlertFlags] = useState([]);

  // When analysisResult changes, detect high-risk flags to alert immediately
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.flags)) {
      setAlertFlags([]);
      return;
    }
    // Define high-risk flags that trigger immediate alert
    const highRiskFlags = new Set(["insult", "gaslighting", "threat", "discard", "manipulation", "control", "ultimatum"]);
    const foundFlags = analysisResult.flags.filter((flag) => highRiskFlags.has(flag.type.toLowerCase()));

    if (foundFlags.length > 0) {
      setAlertFlags(foundFlags.map((f) => f.label));
      // Also trigger native alert
      alert(
        `Warning: High risk behavior detected: ${foundFlags.map((f) => f.label).join(", ")}. Please review carefully.`
      );
    } else {
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis from conversation analyzer or realtime dashboard
  const handleNewAnalysis = (result) => {
    setAnalysisResult(result);
    setError(null);
    setLoading(false);
  };

  // Handler for errors from analyzer components
  const handleError = (err) => {
    setError(err);
    setLoading(false);
  };

  // Handler for loading state from analyzer
  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // Render UI
  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none", marginBottom: "1rem" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
      </header>

      <nav style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          aria-pressed={!showDashboard}
          onClick={() => setShowDashboard(false)}
          className="peachy-button"
          style={{ marginRight: 10 }}
        >
          Paste Analyzer
        </button>
        <button
          type="button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard(true)}
          className="peachy-button"
        >
          Real-Time Dashboard
        </button>
      </nav>

      <ImmediateAlert flags={alertFlags} onDismiss={() => setAlertFlags([])} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysis={handleNewAnalysis}
          onError={handleError}
          onLoading={handleLoading}
          analysisResult={analysisResult}
          loading={loading}
          error={error}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysis={handleNewAnalysis}
            onError={handleError}
            onLoading={handleLoading}
          />

          {loading && (
            <p style={{ marginTop: "1rem", fontWeight: "600", color: "#cc4a4a" }}>Analyzing conversation...</p>
          )}

          {error && (
            <p role="alert" style={{ marginTop: "1rem", fontWeight: "700", color: "#c62828" }}>
              Error: {error}
            </p>
          )}

          {analysisResult && !loading && !error && (
            <section aria-label="Analysis results" style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={
                  analysisResult.flags || analysisResult.signals?.map((s) => ({
                    type: s,
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                    confidence: analysisResult.confidence || 0,
                  })) || []
                }
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult analysis={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;