import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [highRiskFlags, setHighRiskFlags] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Check for high-risk flags and trigger alert
  useEffect(() => {
    if (analysisResult?.signals?.length) {
      const highRiskDetected = analysisResult.signals.filter((s) =>
        HIGH_RISK_FLAGS.has(s.toLowerCase())
      );
      if (highRiskDetected.length > 0) {
        setHighRiskFlags(highRiskDetected);
        setShowAlert(true);
      } else {
        setHighRiskFlags([]);
        setShowAlert(false);
      }
    } else {
      setHighRiskFlags([]);
      setShowAlert(false);
    }
  }, [analysisResult]);

  const handleAnalyze = async (inputText) => {
    setLoading(true);
    setError("");
    setAnalysisResult(null);
    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || "Analysis failed");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDismissAlert = () => setShowAlert(false);

  return (
    <main className="ui-container" role="main" aria-label="FLAGGED conversation analysis app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED
        </h1>
        <nav style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            className="peachy-button"
            onClick={() => setRealTimeMode(false)}
            disabled={!realTimeMode}
            aria-pressed={!realTimeMode}
            aria-label="Switch to manual conversation analyzer mode"
            style={{ marginRight: "1rem" }}
          >
            Paste Analyzer
          </button>
          <button
            type="button"
            className="peachy-button"
            onClick={() => setRealTimeMode(true)}
            disabled={realTimeMode}
            aria-pressed={realTimeMode}
            aria-label="Switch to real-time dashboard mode"
          >
            Real-Time Dashboard
          </button>
        </nav>
      </header>

      {showAlert && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlags}
          onDismiss={onDismissAlert}
          ariaLive="assertive"
        />
      )}

      {!realTimeMode && (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />
          {analysisResult && !error && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label || "Safe"}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence || 0,
                }))}
                overallConfidence={analysisResult.confidence || 0}
              />
              <ShareableResult
                analysis={analysisResult}
                conversationText={analysisResult?.usage?.originalText || ""}
              />
            </>
          )}
        </>
      )}

      {realTimeMode && (
        <RealTimeDashboard
          onAnalysisUpdate={setAnalysisResult}
          initialInput=""
          // Pass highRiskFlags and alert controls to dashboard to sync alert banner if needed
          highRiskFlags={highRiskFlags}
          onHighRiskAlert={(flags) => {
            setHighRiskFlags(flags);
            setShowAlert(flags.length > 0);
          }}
        />
      )}

      <footer style={{ marginTop: "3rem", textAlign: "center", userSelect: "none" }}>
        <small style={{ color: "#aa6666" }}>
          © FLAGGED 2024 — Behavioral AI conversation analyzer
        </small>
      </footer>
    </main>
  );
};

export default App;