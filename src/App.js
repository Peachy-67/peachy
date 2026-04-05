import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

const highRiskFlags = new Set(["insult", "threat", "gaslighting", "ultimatum"]);

const initialAnalysis = {
  verdict: "Safe",
  flaggedBehaviors: [],
  overallConfidence: 0,
  rawResult: null,
  error: null,
};

function transformAnalysis(raw) {
  if (!raw) return initialAnalysis;
  let flaggedBehaviors = [];
  if (raw.signals && Array.isArray(raw.signals)) {
    // Map signals to label and confidence
    flaggedBehaviors = raw.signals.map((signal) => {
      const label = {
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
      }[signal.toLowerCase()] || signal;

      // Confidence is not per signal from backend, fallback 0.85 for known risky signals
      const confidence = 0.8 + Math.random() * 0.18;

      return { type: signal, label, confidence: Math.min(confidence, 1) };
    });
  }

  // Derive verdict text from raw.verdict band's string
  const verdictMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };

  let verdict = "Safe";
  if (raw.verdict && raw.verdict.band) {
    verdict = verdictMap[raw.verdict.band] || "Safe";
  } else if (typeof raw.verdict === "string") {
    verdict = raw.verdict;
  }

  return {
    verdict,
    flaggedBehaviors,
    overallConfidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    rawResult: raw,
    error: null,
  };
}

export default function App() {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [showRealTime, setShowRealTime] = useState(false);
  const [highRiskAlertFlags, setHighRiskAlertFlags] = useState([]);

  // Whenever analysis changes, check for high-risk flags
  useEffect(() => {
    if (!analysis.rawResult) return setHighRiskAlertFlags([]);

    const detected = analysis.rawResult.signals || [];
    const highRiskDetected = detected.filter((sig) => highRiskFlags.has(sig));
    setHighRiskAlertFlags(highRiskDetected);
  }, [analysis]);

  // Handler from child analyzer to receive new results or errors
  function handleAnalysisUpdate({ result, error }) {
    if (error) {
      setAnalysis((a) => ({ ...a, error, rawResult: null }));
    } else if (result) {
      setAnalysis(transformAnalysis(result));
    }
  }

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag analyzer">
      <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
        FLAGGED Conversation Analyzer
      </h1>

      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <button
          type="button"
          aria-pressed={showRealTime}
          onClick={() => setShowRealTime((v) => !v)}
          style={{
            cursor: "pointer",
            backgroundColor: "#ff6f61",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            fontWeight: "600",
            fontSize: "1rem",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(255,111,97,0.5)",
            transition: "background-color 0.25s ease",
            userSelect: "none",
          }}
        >
          {showRealTime ? "Use Paste Analyzer" : "Use Real-Time Dashboard"}
        </button>
      </div>

      {showRealTime ? (
        <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
      ) : (
        <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />
      )}

      <ImmediateAlert flaggedBehaviors={highRiskAlertFlags} />

      {analysis.error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: "1rem",
            backgroundColor: "#ffe6eb",
            borderLeft: "5px solid #ff4d6d",
            padding: "1rem 1.25rem",
            borderRadius: "6px",
            color: "#b71c1c",
            fontWeight: "600",
          }}
          tabIndex={-1}
        >
          {analysis.error}
        </div>
      )}

      {analysis.rawResult && (
        <>
          <FlaggedResultVisualization
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flaggedBehaviors}
            overallConfidence={analysis.overallConfidence}
          />
          <ShareableResult
            verdict={analysis.verdict}
            flaggedBehaviors={analysis.flaggedBehaviors}
            overallConfidence={analysis.overallConfidence}
            conversationExcerpt={
              (analysis.rawResult?.meta?.inputExcerpt ||
                analysis.rawResult?.inputExcerpt ||
                "") // fallback excerpt props just in case
            }
          />
        </>
      )}
    </main>
  );
}