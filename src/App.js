import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

const App = () => {
  // Analysis state from either analyzer or dashboard
  const [analysis, setAnalysis] = useState(null);
  // Flags that triggered immediate alert
  const [alertFlags, setAlertFlags] = useState([]);
  // Show/hide real-time dashboard instead of paste analyzer
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysis(result);

    if (result && Array.isArray(result.signals)) {
      const highRiskDetected = result.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );

      // Only update if alert flags changed to prevent repeated alerts
      setAlertFlags((currentAlerts) => {
        const currentSet = new Set(currentAlerts);
        const newSet = new Set(highRiskDetected);
        // Compare sets shallowly
        const changed =
          currentAlerts.length !== highRiskDetected.length ||
          highRiskDetected.some((flag) => !currentSet.has(flag));

        if (changed) {
          // Immediate native alert on new high-risk flags
          if (highRiskDetected.length > 0) {
            const namesText = highRiskDetected
              .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
              .join(", ");
            // Use try to catch if alert is blocked in browser
            try {
              window.alert(
                `⚠️ High-risk behavior detected: ${namesText}. Please review carefully.`
              );
            } catch {
              // fail silent
            }
          }
          return highRiskDetected;
        }
        return currentAlerts; // no change
      });
    } else {
      setAlertFlags([]);
    }
  }, []);

  // Clear alert on dismiss from ImmediateAlert component
  const dismissAlert = () => {
    setAlertFlags([]);
  };

  // Toggle between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    setAnalysis(null);
    setAlertFlags([]);
  };

  return (
    <main
      className="ui-container"
      aria-label="FLAGGED conversation red flag detection application"
      role="main"
    >
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1
          tabIndex={-1}
          style={{
            fontWeight: "900",
            color: "#cc2f2f",
            userSelect: "none",
            textShadow: "0 0 10px #fcc",
          }}
        >
          FLAGGED
        </h1>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={showDashboard}
          onClick={toggleDashboard}
        >
          {showDashboard ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </header>

      <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />

      {showDashboard ? (
        <RealTimeDashboard onAnalysisUpdate={handleAnalysisUpdate} />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisUpdate={handleAnalysisUpdate} />

          {analysis && (
            <>
              <section
                aria-label="Flagged conversation results"
                role="region"
                tabIndex={-1}
                className="flagged-result-container"
              >
                <FlaggedResultVisualization
                  verdict={
                    analysis.verdict?.label === "Safe"
                      ? "Safe"
                      : analysis.verdict?.label === "Caution"
                      ? "Caution"
                      : "Flagged"
                  }
                  flaggedBehaviors={(analysis.signals || []).map((signal) => {
                    // Map signal to label and confidence from why or confidence approx
                    // Use signal as label capitalized fallback
                    return {
                      type: signal,
                      label:
                        signal
                          .split("_")
                          .map((w) => w[0].toUpperCase() + w.slice(1))
                          .join(" ") || signal,
                      confidence:
                        typeof analysis.confidence === "number"
                          ? analysis.confidence
                          : 0,
                    };
                  })}
                  overallConfidence={
                    typeof analysis.confidence === "number"
                      ? analysis.confidence
                      : 0
                  }
                />
                <ShareableResult analysis={analysis} />
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
};

export default App;