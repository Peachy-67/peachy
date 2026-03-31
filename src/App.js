import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const App = () => {
  // State for analysis result from pasted conversation
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State to toggle between paste input analyzer and real-time dashboard UI
  const [showDashboard, setShowDashboard] = useState(false);

  // Extract flagged behaviors in expected format for visualization
  // Map signals to objects with type, label, confidence to reuse FlaggedResultVisualization props pattern
  const flaggedBehaviors =
    analysisResult && Array.isArray(analysisResult.signals)
      ? analysisResult.signals.map((signal) => {
          // Define label and confidence from signals and confidence scores
          // For label, capitalize type
          const label = signal.charAt(0).toUpperCase() + signal.slice(1);
          // Confidence from analysis confidence (overall), or 0.5 fallback
          // If more detailed confidence per flag exists in backend later, can improve here
          const confidence = analysisResult.confidence || 0.5;
          return { type: signal, label, confidence };
        })
      : [];

  // Derive verdict string ('Safe', 'Caution', 'Flagged') based on band
  // Map band to verdict label
  const verdictBand = analysisResult?.verdict?.band || "green";
  let verdictLabel = "Safe";
  if (verdictBand === "yellow") verdictLabel = "Caution";
  else if (verdictBand === "red") verdictLabel = "Flagged";

  // ImmediateAlert expects flaggedBehaviors array with type information and automatically determines which are high-risk

  // Handlers for ConversationAnalyzerPolish
  const handleAnalyze = async (text) => {
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAnalysisError(errorData.message || "Analysis failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setAnalysisResult(data);
      setIsLoading(false);
    } catch (error) {
      setAnalysisError(error.message || "Network error");
      setIsLoading(false);
    }
  };

  // Reset analysis result when toggling view to dashboard to avoid confusion
  useEffect(() => {
    if (showDashboard) {
      setAnalysisResult(null);
      setAnalysisError(null);
      setIsLoading(false);
    }
  }, [showDashboard]);

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#ff6f3c", marginBottom: "1rem", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="View mode toggle" style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to Paste Analyzer view" : "Switch to Real-Time Dashboard view"}
          style={{ minWidth: 220 }}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={isLoading}
            error={analysisError}
            result={analysisResult}
          />

          {/* Immediate alert triggers on flagged high-risk signals */}
          <ImmediateAlert flaggedBehaviors={flaggedBehaviors} />

          {/* Show flagged result visualization only if we have analysis result */}
          {analysisResult && (
            <FlaggedResultVisualization
              verdict={verdictLabel}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
            />
          )}

          {/* Show shareable result only if we have analysis result */}
          {analysisResult && <ShareableResult analysis={analysisResult} inputVisible={false} />}
        </>
      )}

      {showDashboard && <RealTimeDashboard />}

      <footer style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.85rem", color: "#999", userSelect: "none" }}>
        &copy; 2024 FLAGGED.RUN - Detect red flags in your conversations
      </footer>
    </main>
  );
};

export default App;