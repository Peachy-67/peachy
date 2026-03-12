import React, { useState, useEffect, useCallback } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["insult", "gaslighting", "threat", "ultimatum"];

const mapBandToVerdict = {
  green: "Safe",
  yellow: "Caution",
  red: "Flagged",
};

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [alertDismissed, setAlertDismissed] = useState(false);

  // Derived verdict label from band string
  const verdictLabel = analysisResult
    ? mapBandToVerdict[analysisResult.verdict.band] || "Safe"
    : "Safe";

  // Build flagged behaviors array for visualization and alerts
  const flaggedBehaviors =
    analysisResult?.signals?.map((flag) => {
      // Map signals to readable labels (capitalize first letter)
      const label = flag.charAt(0).toUpperCase() + flag.slice(1);
      // Provide confidence from analysisResult confidence as approximation
      const confidence = analysisResult.confidence ?? 0;
      return { type: flag, label, confidence };
    }) || [];

  // Check if any high risk flags are present for alert
  useEffect(() => {
    if (!analysisResult) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }

    const foundHighRisk = flaggedBehaviors
      .filter((flag) => HIGH_RISK_FLAGS.includes(flag.type))
      .map((flag) => flag.label);

    setAlertFlags(foundHighRisk);

    if (foundHighRisk.length > 0 && !alertDismissed) {
      try {
        // Native alert to interrupt users immediately
        alert(
          `⚠️ High risk behaviors detected: ${foundHighRisk.join(
            ", "
          )}. Please review carefully.`
        );
      } catch {
        // fail silently if alert unavailable
      }
    }
  }, [analysisResult, flaggedBehaviors, alertDismissed]);

  // Handler to reset alert dismissal on new analysis
  const onNewAnalysis = useCallback(() => {
    setAlertDismissed(false);
  }, []);

  // Handler to dismiss alert banner
  const dismissAlert = () => {
    setAlertDismissed(true);
  };

  // Handler toggle for dashboard
  const toggleDashboard = () => {
    setShowDashboard((s) => !s);
  };

  return (
    <main
      className="ui-container"
      role="main"
      aria-labelledby="app-title"
      tabIndex={-1}
    >
      <h1 id="app-title" style={{ userSelect: "none", textAlign: "center" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <section aria-label="Conversation analyzer section">
        <ConversationAnalyzerPolish
          onAnalysisComplete={(result) => {
            setAnalysisResult(result);
            onNewAnalysis();
          }}
          key={showDashboard ? "base-disabled" : "base-enabled"}
          disabled={showDashboard}
        />
      </section>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        dismissed={alertDismissed}
        onDismiss={dismissAlert}
      />

      {analysisResult && (
        <section aria-label="Analysis results section" tabIndex={-1}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <ShareableResult analysisResult={analysisResult} />
        </section>
      )}

      <section
        aria-label="Real time monitoring dashboard toggle"
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <button
          type="button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          className="peachy-button"
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real time conversation monitoring dashboard">
          <RealTimeDashboard
            onAnalysisUpdate={(result) => {
              setAnalysisResult(result);
              onNewAnalysis();
            }}
            disabled={false}
          />
        </section>
      )}
    </main>
  );
}