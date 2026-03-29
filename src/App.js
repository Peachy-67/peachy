import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = ["gaslighting", "threat", "ultimatum", "discard", "insult"];

const App = () => {
  // State for analysis results from paste input
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time dashboard toggle
  const [showDashboard, setShowDashboard] = useState(false);

  // State for immediate alerts triggered by high-risk flags
  const [alertFlags, setAlertFlags] = useState([]);

  // Handler for new analysis result (from ConversationAnalyzerPolish)
  const handleAnalysisUpdate = (result) => {
    setAnalysisResult(result);
    setAnalysisError(null);

    // Determine if any high risk flags are present
    const flaggedTypes = (result?.signals || []).map((s) => s.toLowerCase());
    const highRiskDetected = flaggedTypes.filter((f) => HIGH_RISK_FLAGS.includes(f));

    setAlertFlags(highRiskDetected);
  };

  // Handler for analysis error
  const handleAnalysisError = (error) => {
    setAnalysisError(error);
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  // Handler to clear the visible alert banner
  const dismissAlert = () => setAlertFlags([]);

  // When switching to dashboard, clear any past analysis alerts to avoid confusion
  useEffect(() => {
    if (showDashboard) {
      setAlertFlags([]);
    }
  }, [showDashboard]);

  return (
    <main className="ui-container" aria-label="Flagged conversation analysis application">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED.RUN
        </h1>
      </header>

      <section aria-label="Application mode toggle" style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          type="button"
          className="peachy-button"
          onClick={() => setShowDashboard((v) => !v)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer mode" : "Switch to real-time dashboard mode"}
        >
          {showDashboard ? "Use Paste Conversation Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </section>

      {showDashboard ? (
        <section aria-label="Real time conversation monitoring dashboard">
          <RealTimeDashboard onResultUpdate={handleAnalysisUpdate} />
        </section>
      ) : (
        <section aria-label="Paste conversation analyzer">
          <ConversationAnalyzerPolish
            onAnalysis={handleAnalysisUpdate}
            onError={handleAnalysisError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </section>
      )}

      {/* Immediate Alert for high-risk flags */}
      <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />

      {/* Display analysis results with visualization and sharing */}
      {analysisResult && !showDashboard && (
        <section
          aria-label="Flagged conversation analysis result"
          style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <FlaggedResultVisualization
            verdict={mapBandToLabel(analysisResult.verdict?.band)}
            flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
          />

          <ShareableResult
            verdict={mapBandToLabel(analysisResult.verdict?.band)}
            flaggedBehaviors={mapSignalsToFlags(analysisResult.signals, analysisResult.confidence)}
            overallConfidence={analysisResult.confidence}
            conversationExcerpt={analysisResult.meta?.conversationExcerpt || ""}
          />
        </section>
      )}

      {/* Error display below analyzer */}
      {analysisError && !showDashboard && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: 16,
            color: "#c62828",
            fontWeight: "700",
            textAlign: "center",
            userSelect: "text",
          }}
        >
          {analysisError}
        </div>
      )}
    </main>
  );
};

// Helper: Map backend band to verdict label expected by FlaggedResultVisualization
function mapBandToLabel(band) {
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
}

// Helper: Map signals array to flaggedBehaviors as expected by FlaggedResultVisualization
function mapSignalsToFlags(signals, confidence) {
  if (!Array.isArray(signals) || signals.length === 0) return [];

  // Map known flags with labels and confidence (overall confidence reused on all for now)
  const flagLabelMap = {
    insult: "Insult",
    manipulation: "Manipulation",
    gaslighting: "Gaslighting",
    discard: "Discard",
    control: "Control",
    ultimatum: "Ultimatum",
    threat: "Threat",
    guilt: "Guilt-tripping",
    boundary_push: "Boundary Push",
    inconsistency: "Inconsistency",
  };

  return signals
    .map((signal) => {
      const type = signal.toLowerCase();
      if (!(type in flagLabelMap)) return null;
      return {
        type,
        label: flagLabelMap[type],
        confidence: confidence ?? 0.7,
      };
    })
    .filter(Boolean);
}

export default App;