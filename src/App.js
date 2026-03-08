import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/uiPolish.css";

/**
 * Main App component integrating conversation analysis,
 * immediate alerting, flagged results visualization, sharing,
 * and real-time monitoring dashboard toggle.
 */
const App = () => {
  // States to store analysis results and loading/error status
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for receiving analysis result from ConversationAnalyzerPolish
  const handleAnalysisResult = (result) => {
    setAnalysis(result);
    setErrorMsg("");
    setIsLoading(false);
  };

  // Handler for errors during analysis
  const handleAnalysisError = (error) => {
    setAnalysis(null);
    setErrorMsg(error);
    setIsLoading(false);
  };

  // Handler for toggling real-time dashboard view
  const toggleDashboard = () => setShowDashboard((v) => !v);

  // Determine if there are any high-risk flags to alert user
  const flaggedBehaviors = analysis?.signals || [];

  return (
    <main className="container" role="main" aria-label="FLAGGED main application interface">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>

      {/* Real-time dashboard toggle */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
          className="peachy-button"
          style={{ maxWidth: 280, minWidth: 160 }}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </div>

      {/* Dashboard section */}
      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisResult}
          onError={handleAnalysisError}
          initialData={analysis}
        />
      ) : (
        <>
          {/* Conversation analyzer input and result */}
          <ConversationAnalyzerPolish
            onResult={handleAnalysisResult}
            onError={handleAnalysisError}
            loading={isLoading}
            setLoading={setIsLoading}
          />

          {errorMsg && (
            <div role="alert" className="alert-banner" style={{ marginTop: "1rem" }}>
              {errorMsg}
            </div>
          )}

          {/* Immediate alert for high-risk flags */}
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

          {/* Polished flagged result visualization with share options */}
          {analysis && !errorMsg && !isLoading && (
            <section aria-label="Analysis results" style={{ marginTop: "2rem" }}>
              <FlaggedResultVisualization
                verdict={analysis.verdict?.label || "Safe"}
                flaggedBehaviors={flaggedBehaviors.map((type) => {
                  // Map signals to label and confidence if available in analysis
                  const label = type.charAt(0).toUpperCase() + type.slice(1);
                  const confidence = analysis.confidence || 0;
                  return { type, label, confidence };
                })}
                overallConfidence={analysis.confidence || 0}
              />
              <ShareableResult analysis={analysis} />
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default App;