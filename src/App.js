import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/FlaggedResultVisualization.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "discard",
  "ultimatum",
  "control",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [useRealTimeDashboard, setUseRealTimeDashboard] = useState(false);

  // Extract flagged behaviors as array of {type, label, confidence}
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];

    // Map signal types to label and confidence from analysisResult if available
    // We'll use confidence from analysisResult.confidence for all as fallback
    return analysisResult.signals.map((signal) => {
      // Label formatting: capitalize first letter, replace underscores
      const label = signal
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      // Use overall confidence as individual confidence fallback
      const confidence = analysisResult.confidence || 0;

      return {
        type: signal,
        label,
        confidence,
      };
    });
  }, [analysisResult]);

  // Determine verdict label for FlaggedResultVisualization
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";

    const label = analysisResult.verdict.label.toLowerCase();

    if (label === "flagged" || analysisResult.verdict.band === "red") return "Flagged";
    if (label === "caution" || analysisResult.verdict.band === "yellow") return "Caution";

    return "Safe";
  }, [analysisResult]);

  // Handle new analysis result updates and check for high-risk flags
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setHighRiskFlags([]);
      setAlertVisible(false);
      return;
    }

    const detectedHighRisk = analysisResult.signals.filter((f) => HIGH_RISK_FLAGS.has(f));
    setHighRiskFlags(detectedHighRisk);

    if (detectedHighRisk.length > 0) {
      setAlertVisible(true);
      // Trigger a native alert once immediately when flags appear
      alert(`High-risk behaviors detected: ${detectedHighRisk.join(", ")}`);
    } else {
      setAlertVisible(false);
    }
  }, [analysisResult]);

  // Alert dismissal handler
  const onDismissAlert = () => {
    setAlertVisible(false);
  };

  // Callback for analysis from ConversationAnalyzerPolish or RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle mode between paste-analyze and real-time dashboard
  const toggleDashboard = () => {
    setUseRealTimeDashboard((prev) => !prev);
    // Clear previous analysis on mode switch for clarity
    setAnalysisResult(null);
    setAlertVisible(false);
    setHighRiskFlags([]);
  };

  return (
    <main className="ui-container" role="main" aria-label="Flagged conversation analysis application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED: Conversation Red Flag Detector
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            className="peachy-button"
            onClick={toggleDashboard}
            aria-pressed={useRealTimeDashboard}
            aria-label={`Switch to ${useRealTimeDashboard ? "paste analyzer" : "real-time dashboard"} mode`}
          >
            {useRealTimeDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {alertVisible && highRiskFlags.length > 0 && (
        <ImmediateAlert flags={highRiskFlags} onDismiss={onDismissAlert} />
      )}

      {useRealTimeDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />
      )}

      {analysisResult && !useRealTimeDashboard && (
        <>
          <FlaggedResultVisualization
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult
            verdict={verdict}
            flaggedBehaviors={flaggedBehaviors}
            confidence={analysisResult.confidence || 0}
          />
        </>
      )}
    </main>
  );
}

export default App;