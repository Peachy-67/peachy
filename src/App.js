import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Called when new analysis is done (from paste analyzer or dashboard)
  const handleAnalysisUpdate = useCallback((result) => {
    if (!result || typeof result !== "object") {
      setAnalysisResult(null);
      setAlertFlags([]);
      return;
    }
    setAnalysisResult(result);

    // Check for immediate alert flags
    const foundHighRiskFlags = (result.signals || []).filter((flag) =>
      HIGH_RISK_FLAGS.includes(flag)
    );
    setAlertFlags(foundHighRiskFlags);
  }, []);

  // Handler for toggling real-time dashboard view
  const toggleDashboard = () => {
    setError(null);
    setAnalysisResult(null);
    setAlertFlags([]);
    setInputText("");
    setShowDashboard((v) => !v);
  };

  // Handle manual analyze from ConversationAnalyzerPolish
  const onAnalyze = async (text) => {
    setError(null);
    setIsAnalyzing(true);
    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Analysis failed");
      }
      const data = await response.json();
      handleAnalysisUpdate(data);
    } catch (err) {
      setError(err.message || "Error analyzing conversation");
      setAnalysisResult(null);
      setAlertFlags([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            type="button"
            className="peachy-button"
            onClick={toggleDashboard}
            aria-pressed={showDashboard}
            aria-label={
              showDashboard
                ? "Switch to single conversation analyzer mode"
                : "Switch to real-time monitor dashboard mode"
            }
          >
            {showDashboard ? "Paste Conversation" : "Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish
          inputText={inputText}
          setInputText={setInputText}
          onAnalyze={() => onAnalyze(inputText)}
          isLoading={isAnalyzing}
          error={error}
          analysisResult={analysisResult}
        />
      )}

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && (
        <section
          aria-live="polite"
          aria-label="Analysis result visualization with verdict and flagged behaviors"
          style={{ marginTop: "2rem", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals.map((signal) => ({
              type: signal,
              label: signal.charAt(0).toUpperCase() + signal.slice(1),
              confidence: analysisResult.confidence || 0,
            }))}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            result={analysisResult}
            inputText={inputText}
            verdict={analysisResult.verdict.label}
            flaggedBehaviors={analysisResult.signals}
          />
        </section>
      )}
    </main>
  );
};

export default App;