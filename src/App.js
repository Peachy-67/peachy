import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/uiPolish.css";

/**
 * Main App component that integrates conversation analyzer, immediate alert system,
 * result visualization, shareable results, and real-time dashboard.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [lastAnalysisText, setLastAnalysisText] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);

  // Detect high-risk flags that should trigger immediate alert
  const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum", "discard", "control"];

  // On new analysis result, evaluate if alert needed
  useEffect(() => {
    if (analysisResult?.flaggedBehaviors && analysisResult.flaggedBehaviors.length) {
      const detectedHighRisk = analysisResult.flaggedBehaviors.filter((flag) =>
        highRiskFlags.includes(flag.type.toLowerCase())
      );
      if (detectedHighRisk.length > 0) {
        setAlertFlags(detectedHighRisk);
        setAlertVisible(true);
        // Additionally show native alert dialog
        const alertMsg =
          `⚠️ High-risk behaviors detected: ${detectedHighRisk
            .map((f) => f.label)
            .join(", ")}`;
        alert(alertMsg);
      } else {
        setAlertVisible(false);
        setAlertFlags([]);
      }
    } else {
      setAlertVisible(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handler to dismiss alert banner
  const dismissAlert = useCallback(() => {
    setAlertVisible(false);
  }, []);

  // Callback when ConversationAnalyzerPolish returns a new analysis
  const handleAnalysisUpdate = useCallback((result, inputText) => {
    setAnalysisResult(result);
    setLastAnalysisText(inputText);
  }, []);

  // Extract data for visualization if any
  // The analysisResult expected shape:
  // {
  //   verdict: "Safe" | "Caution" | "Flagged",
  //   flaggedBehaviors: [{type, label, confidence}],
  //   overallConfidence: number
  // }
  // But ConversationAnalyzerPolish's result may differ slightly,
  // so we normalize below if needed.

  const normalizedResult = React.useMemo(() => {
    if (!analysisResult) return null;

    // Defensive fallback: map signals to flaggedBehaviors with labels and confidence
    if (!analysisResult.flaggedBehaviors && Array.isArray(analysisResult.signals)) {
      const flaggedBehaviors = analysisResult.signals.map((signal) => {
        let label = signal;
        // Map canonical labels for known types
        switch(signal.toLowerCase()) {
          case "insult": label = "Insult"; break;
          case "gaslighting": label = "Gaslighting"; break;
          case "discard": label = "Discard"; break;
          case "control": label = "Control"; break;
          case "ultimatum": label = "Ultimatum"; break;
          case "threat": label = "Threat"; break;
          case "guilt": label = "Guilt"; break;
          case "boundary_push": label = "Boundary Push"; break;
          case "inconsistency": label = "Inconsistency"; break;
          case "manipulation": label = "Manipulation"; break;
          default: label = signal.charAt(0).toUpperCase() + signal.slice(1); break;
        }
        return {
          type: signal,
          label,
          confidence: 0.8,
        };
      });

      const verdictLabel = (() => {
        if (analysisResult.verdict && typeof analysisResult.verdict === "string") return analysisResult.verdict;
        if (analysisResult.verdict?.band) {
          switch (analysisResult.verdict.band) {
            case "green": return "Safe";
            case "yellow": return "Caution";
            case "red": return "Flagged";
            default: return "Safe";
          }
        }
        return "Safe";
      })();

      return {
        verdict: verdictLabel,
        flaggedBehaviors,
        overallConfidence:
          typeof analysisResult.confidence === "number"
          ? analysisResult.confidence
          : 0.0,
      };
    }

    // If already structured with flaggedBehaviors and verdict
    if (
      analysisResult.verdict &&
      typeof analysisResult.verdict === "string" &&
      Array.isArray(analysisResult.flaggedBehaviors)
    ) {
      return {
        verdict: analysisResult.verdict,
        flaggedBehaviors: analysisResult.flaggedBehaviors,
        overallConfidence: analysisResult.overallConfidence || 0,
      };
    }

    return null;
  }, [analysisResult]);

  return (
    <div className="container" aria-label="FLAGGED conversation red flag detection app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED</h1>

      {/* Toggle RealTimeDashboard */}
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => setShowDashboard((show) => !show)}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Hide real-time monitoring dashboard" : "Show real-time monitoring dashboard"}
          style={{
            cursor: "pointer",
            backgroundColor: "#cc2f2f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 14px",
            fontWeight: 700,
            fontSize: "1rem",
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#aa2626")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#cc2f2f")}
        >
          {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
        </button>
      </div>

      {/* Real-time Dashboard - full interface with input and results, enabled when toggled */}
      {showDashboard ? (
        <RealTimeDashboard />
      ) : (
        <>
          {/* Conversation Analyzer - user pastes text, triggers analysis */}
          <ConversationAnalyzerPolish onAnalysis={handleAnalysisUpdate} />

          {/* Immediate alert banner for high-risk flags */}
          {alertVisible && alertFlags.length > 0 && (
            <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
          )}

          {/* Result visualization - verdict, badges, confidence */}
          {normalizedResult && (
            <>
              <FlaggedResultVisualization
                verdict={normalizedResult.verdict}
                flaggedBehaviors={normalizedResult.flaggedBehaviors}
                overallConfidence={normalizedResult.overallConfidence}
              />
              {/* Shareable result for viral sharing */}
              <ShareableResult
                verdict={normalizedResult.verdict}
                flaggedBehaviors={normalizedResult.flaggedBehaviors}
                overallConfidence={normalizedResult.overallConfidence}
                conversationExcerpt={lastAnalysisText}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;