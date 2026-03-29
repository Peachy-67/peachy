import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css"; // Use canonical main UI polish CSS

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum", "control"];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertsActive, setAlertsActive] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showRealTime, setShowRealTime] = useState(false);
  const [conversationText, setConversationText] = useState("");

  // Handle new analysis results, update alert flags if any high-risk detected
  useEffect(() => {
    if (analysisResult?.signals) {
      const detectedHighRisk = analysisResult.signals.filter((sig) =>
        HIGH_RISK_FLAGS.includes(sig)
      );
      if (detectedHighRisk.length) {
        setAlertsActive(true);
        setAlertFlags(detectedHighRisk);
        // Also show native alert immediately for user attention
        alert(
          `High-risk flags detected: ${detectedHighRisk
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}`
        );
      } else {
        setAlertsActive(false);
        setAlertFlags([]);
      }
    } else {
      setAlertsActive(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler for new analysis triggered by the conversation analyzer
  const handleAnalyze = async (text) => {
    setLoading(true);
    setError("");
    setAnalysisResult(null);
    setConversationText(text);

    try {
      const resp = await fetch("/v1/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        setError(errData.message || "Analysis failed");
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setAnalysisResult(data);
      setLoading(false);
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Dismiss alert banner
  const dismissAlert = () => {
    setAlertsActive(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: "center", color: "#ff6f3c", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Conversation input and analysis" style={{ marginBottom: "1.5rem" }}>
        {!showRealTime && (
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
            initialText={conversationText}
          />
        )}
      </section>

      {alertsActive && (
        <ImmediateAlert flagTypes={alertFlags} onDismiss={dismissAlert} />
      )}

      <section aria-label="Analysis results and sharing" style={{ marginBottom: "2rem" }}>
        {analysisResult && !showRealTime && (
          <div style={{ textAlign: "center" }}>
            <FlaggedResultVisualization
              verdict={analysisResult.verdict.label}
              flaggedBehaviors={analysisResult.signals.map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysis={analysisResult} conversationText={conversationText} />
          </div>
        )}
      </section>

      <section aria-label="Real-time conversation monitoring dashboard">
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowRealTime((show) => !show)}
          aria-pressed={showRealTime}
          aria-label="Toggle real-time conversation monitoring dashboard"
          style={{ display: "block", margin: "0 auto 2rem" }}
        >
          {showRealTime ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
        </button>

        {showRealTime && <RealTimeDashboard />}
      </section>
    </main>
  );
};

export default App;