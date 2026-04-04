import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, real-time dashboard, alerts, and sharing.
 */
const App = () => {
  // Analysis state for conversation paste analyzer
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Toggle between Conversation Analyzer (paste input) and RealTimeDashboard (live monitoring)
  const [showDashboard, setShowDashboard] = useState(false);

  // Immediate Alert state from flagged behaviors if any high-risk flags detected
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler when analyzer gets a new result
  const handleAnalysisUpdate = (result) => {
    setAnalysis(result);
    setError(null);
    setLoading(false);

    if (result && result.signals && result.signals.length > 0) {
      // Determine if any high-risk flags present (red flags)
      const highRiskFlags = result.signals.filter((flag) =>
        ["insult", "manipulation", "gaslighting", "discard", "control"].includes(flag)
      );
      setAlertFlags(highRiskFlags);
    } else {
      setAlertFlags([]);
    }
  };

  // Handler for errors from analyzer
  const handleAnalysisError = (err) => {
    setError(err);
    setAnalysis(null);
    setLoading(false);
    setAlertFlags([]);
  };

  // Handler for loading state from analyzer
  const handleLoading = (loadingState) => {
    setLoading(loadingState);
  };

  // Toggle dashboard mode
  const toggleDashboard = () => setShowDashboard((v) => !v);

  // Render header with toggle button
  const renderHeader = () => (
    <header
      style={{
        textAlign: "center",
        marginBottom: "1rem",
        userSelect: "none",
      }}
    >
      <h1
        style={{
          color: "#ff6f61",
          fontWeight: "900",
          fontSize: "2.25rem",
          marginBottom: "6px",
          letterSpacing: "0.04em",
        }}
      >
        FLAGGED
      </h1>
      <button
        type="button"
        onClick={toggleDashboard}
        aria-pressed={showDashboard}
        aria-label={
          showDashboard ? "Switch to paste conversation analyzer" : "Switch to live real-time dashboard"
        }
        style={{
          backgroundColor: "#ff6f61",
          color: "white",
          border: "none",
          padding: "0.5rem 1.25rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "1rem",
          boxShadow: "0 3px 7px rgba(255, 111, 97, 0.7)",
          transition: "background-color 0.25s ease",
          userSelect: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e65b50")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff6f61")}
      >
        {showDashboard ? "Use Paste Analyzer" : "Use Real-time Dashboard"}
      </button>
    </header>
  );

  return (
    <main className="ui-container" aria-label="FLAGGED Conversation Analyzer Application">
      {renderHeader()}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleAnalysisError}
          loading={loading}
          analysis={analysis}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalysisUpdate={handleAnalysisUpdate}
            onError={handleAnalysisError}
            onLoading={handleLoading}
          />
          {error && (
            <div
              role="alert"
              tabIndex={-1}
              style={{
                marginTop: "1rem",
                backgroundColor: "#ffe6eb",
                border: "1.5px solid #cc2f2f",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: "700",
                color: "#a63636",
                maxWidth: "440px",
                marginLeft: "auto",
                marginRight: "auto",
                userSelect: "text",
              }}
            >
              {error}
            </div>
          )}
          {loading && (
            <p
              aria-live="polite"
              style={{
                marginTop: "1rem",
                fontWeight: "600",
                fontStyle: "italic",
                color: "#ff6f61",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              Analyzing conversation...
            </p>
          )}
          {analysis && !loading && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict.label}
                flaggedBehaviors={analysis.signals.map((sig) => ({
                  type: sig,
                  label: sig.charAt(0).toUpperCase() + sig.slice(1),
                  confidence: analysis.confidence || 0,
                }))}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult
                analysis={analysis}
                conversationText={analysis.rawInputText || ""}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;