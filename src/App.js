import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "threat", "gaslighting", "discard", "ultimatum"]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertFlags, setAlertFlags] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Effect: watch for high-risk flags to trigger alert and native alert once per update
  useEffect(() => {
    if (!analysisResult || !analysisResult.signals) {
      setAlertFlags([]);
      return;
    }

    const highRiskDetected = analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
    if (highRiskDetected.length) {
      setAlertFlags(highRiskDetected);

      // Trigger native alert once (not repeat for same flags)
      if (window && !window._flaggedAlertShown) {
        alert(
          `Warning: High-risk behavior detected: ${highRiskDetected.join(", ")}. Please proceed with caution.`
        );
        window._flaggedAlertShown = true;
      }
    } else {
      setAlertFlags([]);
      window._flaggedAlertShown = false;
    }
  }, [analysisResult]);

  const handleAnalyze = async (text) => {
    setLoading(true);
    setErrorMsg(null);
    setAnalysisResult(null);
    window._flaggedAlertShown = false; // reset alert flag on new analyze

    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        setErrorMsg(json?.message || "Failed to analyze conversation.");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setErrorMsg("Network error while analyzing conversation.");
    }
    setLoading(false);
  };

  // Derive simplified verdict label for visualization from verdict.band
  const verdictLabelFromBand = (band) => {
    switch (band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  };

  return (
    <div className="ui-container" role="main" aria-label="FLAGGED conversation analyzer application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ textAlign: "center", maxWidth: 400, margin: "0 auto 1rem" }}>
          Detect red flags in conversations: manipulation, gaslighting, insults, discard, control.
        </p>
      </header>

      <section aria-label="Conversation paste analyzer">
        {!showDashboard && (
          <ConversationAnalyzerPolish onAnalyze={handleAnalyze} loading={loading} error={errorMsg} />
        )}

        {analysisResult && !showDashboard && (
          <>
            <FlaggedResultVisualization
              verdict={verdictLabelFromBand(analysisResult.verdict.band)}
              flaggedBehaviors={
                analysisResult.signals.map((signal) => {
                  // Map signal to label and confidence - Use confidence from result or default 0.7
                  const labelMap = {
                    insult: "Insult",
                    manipulation: "Manipulation",
                    gaslighting: "Gaslighting",
                    discard: "Discard",
                    control: "Control",
                    ultimatum: "Ultimatum",
                    threat: "Threat",
                    guilt: "Guilt",
                    boundary_push: "Boundary Push",
                    inconsistency: "Inconsistency",
                  };
                  const label = labelMap[signal] || signal.charAt(0).toUpperCase() + signal.slice(1);
                  // Use approximate confidence from result or 0.7 fallback
                  return {
                    type: signal,
                    label,
                    confidence: analysisResult.confidence || 0.7,
                  };
                })
              }
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult analysis={analysisResult} />
          </>
        )}

        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            className="alert-banner"
            style={{ marginTop: "1rem", color: "#b71c1c", backgroundColor: "#ffe6e3" }}
          >
            {errorMsg}
          </div>
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      <section
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          userSelect: "none",
        }}
      >
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation paste analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real time conversation monitoring dashboard" style={{ marginTop: "2rem" }}>
          <RealTimeDashboard
            onAnalysisUpdate={(data) => {
              setAnalysisResult(data);
            }}
            onAlertFlags={(flags) => setAlertFlags(flags)}
          />
        </section>
      )}

      <footer style={{ textAlign: "center", marginTop: 40, color: "#aaa", userSelect: "none" }}>
        <small>FLAGGED &copy; 2024 Peachy AI</small>
      </footer>
    </div>
  );
};

export default App;