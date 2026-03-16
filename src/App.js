import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum"]);

const App = () => {
  // Analysis state: object with verdict, flaggedBehaviors, confidence, raw data etc.
  const [analysis, setAnalysis] = useState(null);
  // Flags currently triggering alert
  const [alertFlags, setAlertFlags] = useState([]);
  // Dismiss state for alert banner
  const [alertDismissed, setAlertDismissed] = useState(false);
  // Mode: live dashboard or paste analyzer
  const [isDashboardMode, setIsDashboardMode] = useState(false);

  // Derived flagged behaviors structure for visualization and alerts
  // Expect analysis.signals array and analysis.confidence number
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysis || !Array.isArray(analysis.signals)) return [];
    // Map detected signals to objects with type, label (capitalized), confidence (from analysis.confidence)
    return analysis.signals.map((type) => ({
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      confidence: analysis.confidence ?? 0,
    }));
  }, [analysis]);

  // verdict label for VerdictDisplay and visualization components
  const verdictLabel = analysis && analysis.verdict && analysis.verdict.label
    ? analysis.verdict.label
    : "Safe";

  // overall confidence for visualization progress bars or confidence score
  const overallConfidence = analysis && typeof analysis.confidence === "number"
    ? analysis.confidence
    : 0;

  // Watch for high-risk flags to show alert banner and native alert once per detection
  useEffect(() => {
    if (!flaggedBehaviors.length) {
      setAlertFlags([]);
      setAlertDismissed(false);
      return;
    }
    const detectedHighRisk = flaggedBehaviors
      .map((f) => f.type)
      .filter((type) => HIGH_RISK_FLAGS.has(type));
    if (detectedHighRisk.length) {
      // Only show alert banner if not dismissed already or if flags changed
      const newFlagsKey = detectedHighRisk.sort().join(",");
      const oldFlagsKey = alertFlags.sort().join(",");
      if (newFlagsKey !== oldFlagsKey) {
        setAlertFlags(detectedHighRisk);
        setAlertDismissed(false);
        window.alert(
          `⚠️ High-risk red flags detected: ${detectedHighRisk
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}. Please review carefully.`
        );
      }
    } else {
      setAlertFlags([]);
      setAlertDismissed(false);
    }
  }, [flaggedBehaviors, alertFlags]);

  // Handler for new analysis from analyzer component
  const onAnalysisUpdate = (result) => {
    setAnalysis(result);
  };

  // Toggle mode handler
  const toggleDashboardMode = () => setIsDashboardMode((v) => !v);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red-flag detection app">
      <header>
        <h1 style={{ userSelect: "none", textAlign: "center", color: "#cc2f2f" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", color: "#555", marginTop: 0 }}>
          Detect red flags in conversations with AI-assisted analysis.
        </p>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={toggleDashboardMode}
            className="peachy-button"
            aria-pressed={isDashboardMode}
            aria-label={`Switch to ${isDashboardMode ? "paste analyzer" : "real-time dashboard"} mode`}
          >
            {isDashboardMode ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      <section aria-label="Conversation input and analysis" style={{ marginBottom: "2rem" }}>
        {isDashboardMode ? (
          <RealTimeDashboard onAnalysisUpdate={onAnalysisUpdate} />
        ) : (
          <ConversationAnalyzerPolish onAnalysisUpdate={onAnalysisUpdate} />
        )}
      </section>

      <ImmediateAlert
        flaggedBehaviors={alertFlags}
        visible={alertFlags.length > 0 && !alertDismissed}
        onDismiss={() => setAlertDismissed(true)}
      />

      {analysis && !isDashboardMode && (
        <section aria-label="Analysis results visualization" style={{ marginBottom: "1rem" }}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={overallConfidence}
          />
          <ShareableResult analysis={analysis} />
        </section>
      )}
    </main>
  );
};

export default App;