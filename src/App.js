import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const App = () => {
  // State to hold analysis result object from ConversationAnalyzerPolish
  const [analysisResult, setAnalysisResult] = useState(null);
  // State to track whether real-time dashboard mode is enabled
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  // State to control alert visibility/dismiss state
  const [alertVisible, setAlertVisible] = useState(true);

  // Extract flagged behaviors from analysis (array of objects)
  // Map common signals to full label for badges display
  // We only map signals to label and confidence here, confidence is taken from analysisResult.confidence for simplicity
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    return analysisResult.signals.map((signal) => {
      // Map signal types to user-friendly labels
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
      const label = labelMap[signal] || signal;
      // Use overall confidence as proxy for individual confidence
      const confidence = analysisResult.confidence || 0;
      return { type: signal, label, confidence };
    });
  }, [analysisResult]);

  // Determine verdict label to map to VerdictDisplay accepted prop: 'Safe', 'Caution', 'Flagged'
  // - green band => Safe
  // - yellow band => Caution
  // - red band => Flagged
  const verdict = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
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

  // High risk flags are those with red band verdict or presence of critical signals
  // We treat "insult", "gaslighting", "threat", "ultimatum" as high-risk signals
  const hasHighRiskFlags = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return false;
    if (analysisResult.verdict.band === "red") return true;
    const highRiskSignals = new Set(["insult", "gaslighting", "threat", "ultimatum"]);
    return analysisResult.signals.some((sig) => highRiskSignals.has(sig));
  }, [analysisResult]);

  // Display alert only if high risk flags present and alertVisible is true
  const showAlert = hasHighRiskFlags && alertVisible;

  // Dismiss alert handler
  const dismissAlert = () => setAlertVisible(false);

  // When new analysis comes in, reset alert visibility to true to show alert again if applicable
  useEffect(() => {
    if (analysisResult) {
      setAlertVisible(true);
    }
  }, [analysisResult]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      {/* Toggle for real-time dashboard */}
      <section aria-label="Toggle real-time conversation monitoring" style={{ marginBottom: "1rem", textAlign: "center" }}>
        <label htmlFor="realtime-toggle" style={{ fontWeight: 600, fontSize: "1rem", marginRight: "0.5rem" }}>
          Real-Time Monitoring:
        </label>
        <input
          type="checkbox"
          id="realtime-toggle"
          checked={realtimeEnabled}
          onChange={(e) => setRealtimeEnabled(e.target.checked)}
          aria-checked={realtimeEnabled}
        />
      </section>

      {/* Immediate alert system appears on top when high risk flags detected */}
      {showAlert && (
        <ImmediateAlert flaggedBehaviors={flaggedBehaviors} onDismiss={dismissAlert} />
      )}

      {!realtimeEnabled && (
        <>
          {/* Conversation analyzer for user pasted conversation */}
          <ConversationAnalyzerPolish onResult={setAnalysisResult} />

          {/* Show flagged result visualization if analysis result is present */}
          {analysisResult && (
            <section aria-label="Conversation analysis results" style={{ marginTop: "1rem" }}>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={analysisResult.confidence || 0}
              />
              {/* Shareable result with share and copy functionality */}
              <ShareableResult analysisResult={analysisResult} conversationExcerpt={analysisResult.why?.[0] || ""} />
            </section>
          )}
        </>
      )}

      {realtimeEnabled && (
        <RealTimeDashboard onAnalysis={setAnalysisResult} />
      )}
    </main>
  );
};

export default App;