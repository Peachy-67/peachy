import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = [
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
  "control",
  "guilt",
  "boundary_push",
];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Handler to trigger analysis from analyzer component
  const handleAnalyze = useCallback(async (text) => {
    setLoading(true);
    setError(null);
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
        const errorJson = await response.json();
        setError(errorJson.message || "Analysis failed.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Watch analysisResult for high-risk flags to trigger alerts
  useEffect(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return;

    const highRiskFound = analysisResult.signals.filter((sig) =>
      HIGH_RISK_FLAGS.includes(sig)
    );

    if (highRiskFound.length === 0) return;

    // Create alert messages for new flags
    const newAlerts = highRiskFound
      .filter(
        (flag) => !alerts.find((alert) => alert.flag === flag) // avoid duplicates
      )
      .map((flag) => ({
        id: `${flag}-${Date.now()}`,
        flag,
        message: `High risk behavior detected: ${flag}`,
      }));

    if (newAlerts.length) {
      // Show native alert for each new high risk flag
      newAlerts.forEach((alert) => {
        alertUserNative(alert.flag);
      });
      // Add new alerts to alerts state to be shown in banner
      setAlerts((oldAlerts) => [...oldAlerts, ...newAlerts]);
    }
  }, [analysisResult, alerts]);

  // Native alert with fallback to console for accessibility
  const alertUserNative = (flag) => {
    try {
      alert(`Alert: High risk behavior detected - ${flag}`);
    } catch {
      // ignore silent fallback
    }
  };

  // Dismiss alert banner by id
  const dismissAlert = (id) => {
    setAlerts((oldAlerts) => oldAlerts.filter((alert) => alert.id !== id));
  };

  // Toggle to switch dashboard view or paste analyzer view
  const toggleDashboard = () => {
    setShowRealTimeDashboard((v) => !v);
    // Reset analysis and alerts when switching views to avoid stale states
    setAnalysisResult(null);
    setError(null);
    setAlerts([]);
  };

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer app">
      <header style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h1
          tabIndex={-1}
          style={{ userSelect: "none", color: "#ff6f61", fontWeight: 700 }}
        >
          FLAGGED
        </h1>
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showRealTimeDashboard}
          className="peachy-button"
          style={{ marginBottom: "1.5rem" }}
        >
          {showRealTimeDashboard
            ? "Back to Paste Analyzer"
            : "Switch to Real-Time Dashboard"}
        </button>
      </header>

      {alerts.length > 0 && (
        <ImmediateAlert alerts={alerts} onDismiss={dismissAlert} />
      )}

      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onNewAnalysis={setAnalysisResult}
          alerts={alerts}
          onDismissAlert={dismissAlert}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: capitalizeFlagLabel(type),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                analysis={analysisResult}
                conversationText={analysisResult.meta?.inputText || ""}
              />
            </>
          )}
        </>
      )}
    </main>
  );
};

// Helper to capitalize flag label for display
const capitalizeFlagLabel = (label) =>
  label.charAt(0).toUpperCase() + label.slice(1);

export default App;