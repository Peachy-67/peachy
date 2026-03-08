import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Extract flagged behaviors for badges from analysis result
  const flaggedBehaviors =
    analysisResult?.signals?.map((signal) => {
      // Map known signal types to label with capitalization for clarity
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
      return {
        type: signal,
        label: labelMap[signal] || signal,
        confidence: analysisResult.confidence || 0,
      };
    }) || [];

  // Decide verdict label for FlaggedResultVisualization
  // The FlaggedResultVisualization expects 'Safe', 'Caution', or 'Flagged' verdict strings.
  // Map backend verdict bands or label accordingly.
  // The analysis result format may be from backend formatAnalyzeResponse,
  // which returns bands as green/yellow/red for verdict.band,
  // so we map those.
  const verdict =
    analysisResult?.verdict?.band === "green"
      ? "Safe"
      : analysisResult?.verdict?.band === "yellow"
      ? "Caution"
      : analysisResult?.verdict?.band === "red"
      ? "Flagged"
      : "Safe";

  // Show alert if any high risk flags present
  // High risk: insult, gaslighting, discard, threat, ultimatum, control
  const highRiskFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control"];

  useEffect(() => {
    if (flaggedBehaviors.length === 0) {
      setAlertVisible(false);
      setAlertFlags([]);
      return;
    }
    const detectedHighRisk = flaggedBehaviors.filter((f) =>
      highRiskFlags.includes(f.type.toLowerCase())
    );
    if (detectedHighRisk.length > 0) {
      setAlertFlags(detectedHighRisk);
      setAlertVisible(true);
      // Also trigger native alert for immediate notification
      window.alert(
        `Warning: High-risk behaviors detected: ${detectedHighRisk
          .map((f) => f.label)
          .join(", ")}`
      );
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [flaggedBehaviors]);

  // Handler to clear immediate alert banner
  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detection app">
      <header style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{ color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>
        <p style={{ fontWeight: 600, color: "#555" }}>
          Detect red flags in conversations &amp; share results easily
        </p>
      </header>

      {alertVisible && (
        <ImmediateAlert flaggedBehaviors={alertFlags} onDismiss={dismissAlert} />
      )}

      <section aria-label="Conversation input and analysis">
        <ConversationAnalyzerPolish onResult={setAnalysisResult} />
      </section>

      {analysisResult && (
        <>
          <section aria-label="Flagged conversation result visualization">
            <FlaggedResultVisualization
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
            />
          </section>

          <section aria-label="Share flagged conversation results">
            <ShareableResult
              verdict={verdict}
              flaggedBehaviors={flaggedBehaviors}
              overallConfidence={analysisResult.confidence || 0}
              conversationText={analysisResult?.meta?.originalText || ""}
            />
          </section>
        </>
      )}

      <section style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time dashboard" : "Show real-time dashboard"}
        >
          {showDashboard ? "Hide Real-Time Dashboard" : "Show Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: "1rem" }}>
          <RealTimeDashboard />
        </section>
      )}

      <footer style={{ marginTop: "3rem", fontSize: "0.8rem", color: "#aaa", textAlign: "center", userSelect: "none" }}>
        &copy; 2024 FLAGGED &mdash; Powered by Peachy AI
      </footer>
    </main>
  );
};

export default App;