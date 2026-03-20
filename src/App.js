import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "threat",
  "gaslighting",
  "ultimatum",
  "discard",
  "control",
]);

const analyzeResultInitialState = {
  verdict: "Safe",
  flaggedBehaviors: [],
  confidence: 0,
  rawData: null,
};

const App = () => {
  const [analysis, setAnalysis] = useState(analyzeResultInitialState);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [modeRealtime, setModeRealtime] = useState(false);

  // Called when a new analysis is available from conversation analyzer or realtime dashboard
  const handleAnalysisUpdate = (analysisData) => {
    if (!analysisData) {
      setAnalysis(analyzeResultInitialState);
      setAlertFlags([]);
      setAlertVisible(false);
      return;
    }

    const flagged = analysisData.signals || [];
    const verdictStr = (() => {
      const vband = analysisData.verdict?.band || "green";
      if (vband === "green") return "Safe";
      if (vband === "yellow") return "Caution";
      if (vband === "red") return "Flagged";
      return "Safe";
    })();

    // Compose flagged behaviors array with label and confidence for visualization
    // Use known flags labels consistent with FlagBadge usage
    const flaggedBehaviors = flagged.map((flag) => ({
      type: flag,
      label: flag.charAt(0).toUpperCase() + flag.slice(1),
      confidence: analysisData.confidence || 0,
    }));

    setAnalysis({
      verdict: verdictStr,
      flaggedBehaviors,
      confidence: analysisData.confidence || 0,
      rawData: analysisData,
    });

    // Determine if any high risk flags present for alert
    const highRisksPresent = flagged.filter((f) => HIGH_RISK_FLAGS.has(f));
    if (highRisksPresent.length > 0) {
      setAlertFlags(highRisksPresent);
      setAlertVisible(true);
      // Also trigger native alert for accessibility & immediate user attention
      alert(
        `Alert: High risk behaviors detected - ${highRisksPresent
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}`
      );
    } else {
      setAlertFlags([]);
      setAlertVisible(false);
    }
  };

  const dismissAlert = () => {
    setAlertVisible(false);
  };

  // Toggle between paste analyzer mode and real-time dashboard mode
  const toggleRealtimeMode = () => {
    setModeRealtime((v) => !v);
    // Clear existing analysis and alerts on mode switch
    setAnalysis(analyzeResultInitialState);
    setAlertFlags([]);
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED - Conversation Red Flag Detector
      </h1>

      <button
        type="button"
        onClick={toggleRealtimeMode}
        aria-pressed={modeRealtime}
        aria-label={modeRealtime ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
        style={{
          margin: "1rem auto",
          display: "block",
          backgroundColor: "#ff6747",
          color: "#fff",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          border: "none",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "1rem",
          boxShadow: "0 3px 8px rgba(255,103,71,0.7)",
          userSelect: "none",
          transition: "background-color 0.25s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ff4b29")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ff6747")}
      >
        {modeRealtime ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
      </button>

      {/* Immediate alert banner */}
      <ImmediateAlert visible={alertVisible} flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />

      {modeRealtime ? (
        <RealTimeDashboard onResult={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {analysis.rawData && (
            <>
              <FlaggedResultVisualization
                verdict={analysis.verdict}
                flaggedBehaviors={analysis.flaggedBehaviors}
                overallConfidence={analysis.confidence}
              />
              <ShareableResult result={analysis.rawData} />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;