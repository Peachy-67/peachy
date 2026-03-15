import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css"; // Core consistent polish styles

const HIGH_RISK_FLAGS = new Set(["insult", "gaslighting", "threat", "ultimatum", "discard", "control"]);

const App = () => {
  // State for the latest analysis result from ConversationAnalyzerPolish or RealTimeDashboard manual analysis
  const [analysisResult, setAnalysisResult] = useState(null);

  // Track if an immediate alert has been shown to prevent repeated alerts for same flags
  const [alertDismissedFlags, setAlertDismissedFlags] = useState(new Set());

  // Flag to toggle real-time dashboard mode instead of single conversation analyze mode
  const [realTimeDashboardActive, setRealTimeDashboardActive] = useState(false);

  // Handler for analysis updates - receives full analysis result object with:
  // { verdict, signals, confidence, ... }
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setAlertDismissedFlags(new Set()); // reset dismissed alerts on new result
  };

  // Derive flagged behaviors array for visualization (with label and confidence)
  // Map signals to known labels and pass confidence from analysisResult.confidence (simplified assumption)
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // Map known signals to label and confidence (using the overall confidence as a proxy)
    const mapping = {
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
    return analysisResult.signals.map((type) => ({
      type,
      label: mapping[type] || type.charAt(0).toUpperCase() + type.slice(1),
      confidence: analysisResult.confidence ?? 0,
    }));
  }, [analysisResult]);

  // Derive verdict string expected by FlaggedResultVisualization ('Safe', 'Caution', 'Flagged')
  // Based on the verdict band from analysis result ('green', 'yellow', 'red')
  const verdictForDisplay = React.useMemo(() => {
    if (!analysisResult?.verdict?.band) return "Safe";
    switch (analysisResult.verdict.band) {
      case "green":
        return "Safe";
      case "yellow":
        return "Caution";
      case "red":
        return "Flagged";
      default:
        return "Safe";
    }
  }, [analysisResult]);

  // Automatically trigger ImmediateAlert if any high-risk flags detected and alert not dismissed
  const highRiskFlagsDetected = React.useMemo(() => {
    if (!analysisResult?.signals) return [];
    return analysisResult.signals.filter((flag) => HIGH_RISK_FLAGS.has(flag));
  }, [analysisResult]);

  // Handler for dismissing immediate alerts and tracking dismissed flags
  const onAlertDismiss = () => {
    if (!analysisResult?.signals) return;
    setAlertDismissedFlags(new Set(analysisResult.signals));
  };

  // Determine if alert should show: if any high-risk flags, and not dismissed for those flags
  const showImmediateAlert = highRiskFlagsDetected.some(
    (flag) => !alertDismissedFlags.has(flag)
  );

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer main application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED Conversation Analyzer
        </h1>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setRealTimeDashboardActive((v) => !v)}
            aria-pressed={realTimeDashboardActive}
            className="peachy-button"
            style={{ minWidth: 200 }}
          >
            {realTimeDashboardActive ? "Switch to Paste & Analyze" : "Switch to Real-Time Dashboard"}
          </button>
        </div>
      </header>

      {showImmediateAlert && (
        <ImmediateAlert
          flaggedBehaviors={highRiskFlagsDetected}
          onDismiss={onAlertDismiss}
        />
      )}

      {/* Conditionally render the main analyzer or real-time dashboard */}
      {!realTimeDashboardActive && (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      {realTimeDashboardActive && (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      )}

      {/* Show flagged results only if analysis result exists */}
      {analysisResult && (
        <>
          <FlaggedResultVisualization
            verdict={verdictForDisplay}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence ?? 0}
          />
          <ShareableResult analysisResult={analysisResult} />
        </>
      )}
    </main>
  );
};

export default App;