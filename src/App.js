import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const App = () => {
  // State to hold the latest analysis result from conversation analyzer
  const [analysis, setAnalysis] = useState(null);
  // State for any error during analysis
  const [error, setError] = useState(null);
  // State to toggle real-time dashboard visibility
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for when conversation analyzer returns new result or error
  const handleAnalysisUpdate = (result, err) => {
    if (err) {
      setError(err);
      setAnalysis(null);
    } else {
      setError(null);
      setAnalysis(result);
    }
  };

  // Extract necessary data for ImmediateAlert and visualization if available
  const flaggedBehaviors =
    analysis && Array.isArray(analysis.flags)
      ? analysis.flags
      : analysis && Array.isArray(analysis.signals)
      ? // Map string signals to objects with default labels and confidence 1 if flags not provided
        analysis.signals.map((signal) => ({
          type: signal,
          label: signal.charAt(0).toUpperCase() + signal.slice(1),
          confidence: 1,
        }))
      : [];

  const verdict =
    analysis && analysis.verdict && analysis.verdict.label
      ? analysis.verdict.label
      : "Safe";

  const overallConfidence = analysis ? analysis.confidence || 0 : 0;

  return (
    <main className="ui-container" aria-label="Flagged conversation detector app">
      <header>
        <h1>FLAGGED Conversation Analyzer</h1>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={() => setShowDashboard((v) => !v)}
          aria-label={`${showDashboard ? "Hide" : "Show"} real-time dashboard`}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </header>

      <section aria-label="Conversation analysis input">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
        {error && (
          <div
            role="alert"
            className="alert-banner"
            aria-live="assertive"
            style={{ marginTop: "12px" }}
          >
            {error}
          </div>
        )}
      </section>

      {analysis && (
        <>
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />
          <section
            aria-label="Analysis result visualization and sharing"
            style={{ marginTop: "1.5rem", textAlign: "center" }}
          >
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={overallConfidence}
            />
            <ShareableResult analysis={analysis} />
          </section>
        </>
      )}

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard />
        </section>
      )}
    </main>
  );
};

export default App;