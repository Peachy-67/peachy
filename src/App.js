import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["threat", "ultimatum", "discard", "gaslighting"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDashboard, setShowDashboard] = useState(false);

  // Determine if any high risk flags are present
  const highRiskFlagsDetected =
    analysisResult?.signals?.some((flag) => HIGH_RISK_FLAGS.has(flag)) || false;

  // Handler to perform analysis when user inputs conversation text
  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err?.message || "Analysis failed");
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setAnalysisResult(data);
      setIsLoading(false);
    } catch (e) {
      setError("Network or server error");
      setIsLoading(false);
    }
  };

  // Callback for RealTimeDashboard to update analysis results in real-time
  const handleDashboardUpdate = (result) => {
    setAnalysisResult(result);
    setError(null);
  };

  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Clear any previous result and error when switching modes for clarity
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flags detection app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button onClick={toggleDashboard} aria-pressed={showDashboard} className="peachy-button" type="button">
            {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard onUpdate={handleDashboardUpdate} />
      ) : (
        <ConversationAnalyzerPolish
          onAnalyze={handleAnalyze}
          loading={isLoading}
          error={error}
          result={analysisResult}
        />
      )}

      <ImmediateAlert flaggedBehaviors={analysisResult?.signals || []} />

      {analysisResult && !showDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={analysisResult.verdict?.label || "Safe"}
            flaggedBehaviors={
              analysisResult.signals.map((type) => {
                // Map type to label and confidence
                // Confidence fallback to overall confidence as no individual confidence in backend output
                return {
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                };
              }) || []
            }
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult result={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;