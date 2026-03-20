import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main App component integrating conversation analyzer, alert system, 
 * flagged result visualization with sharing, and real-time dashboard toggle.
 */
const App = () => {
  // State for analysis result: verdict, flagged behaviors, confidence, etc.
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // State for error message (analyze errors)
  const [error, setError] = useState(null);
  
  // State to track loading during analysis
  const [loading, setLoading] = useState(false);
  
  // State to control real-time dashboard toggle
  const [showRealTimeDashboard, setShowRealTimeDashboard] = useState(false);
  
  // Extracted flagged behaviors for alerting and visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !Array.isArray(analysisResult.signals)) return [];
    // Map signals to objects with type, label, and confidence (if any)
    // We can utilize a label mapping array for better visualization labels
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
    // Retrieve confidence from analysisResult.confidence as estimate for all flags (since no per flag)
    // This can be refined if per-signal confidence available
    return analysisResult.signals.map((signal) => ({
      type: signal,
      label: labelMap[signal] || signal,
      confidence: analysisResult.confidence || 0.5,
    }));
  }, [analysisResult]);
  
  // Derive verdict string for visualization and shareable result
  const verdictLabel = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return "Safe";
    const v = analysisResult.verdict.label || analysisResult.verdict;
    if (typeof v === "string") return v;
    // Defensive fallback
    return "Safe";
  }, [analysisResult]);
  
  // Overall confidence score number between 0 and 1
  const overallConfidence = React.useMemo(() => {
    if (!analysisResult) return 0;
    return typeof analysisResult.confidence === "number" ? analysisResult.confidence : 0;
  }, [analysisResult]);
  
  // Handler for analysis submission from ConversationAnalyzerPolish
  const handleAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const response = await fetch("/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const { message } = await response.json();
        setError(message || "Failed to analyze conversation");
        setLoading(false);
        return;
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError("Network or server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // State to hold flags that triggered immediate alert, to avoid repeated alerts
  const [alertedFlags, setAlertedFlags] = useState([]);
  
  // High-risk flags for triggering immediate alert modal/banner
  const highRiskFlags = React.useMemo(() => {
    const dangerousFlags = ["insult", "gaslighting", "discard", "threat", "ultimatum", "control"];
    return flaggedBehaviors.filter((flag) => dangerousFlags.includes(flag.type.toLowerCase()));
  }, [flaggedBehaviors]);
  
  // When high-risk flags detected and not alerted before, show immediate alert
  useEffect(() => {
    if (highRiskFlags.length === 0) {
      setAlertedFlags([]);
      return;
    }
    const newAlerts = highRiskFlags.map((f) => f.type);
    const newUnalerted = newAlerts.filter((flag) => !alertedFlags.includes(flag));
    if (newUnalerted.length > 0) {
      // Show native alert for initial flags
      alert(
        `High-risk behavior detected: ${newUnalerted
          .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
          .join(", ")}.\nPlease review carefully.`
      );
      setAlertedFlags((prev) => [...prev, ...newUnalerted]);
    }
  }, [highRiskFlags, alertedFlags]);
  
  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer main application">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>FLAGGED Conversation Analyzer</h1>

      <button
        type="button"
        onClick={() => setShowRealTimeDashboard((show) => !show)}
        aria-pressed={showRealTimeDashboard}
        style={{
          margin: "1rem auto 1.5rem",
          display: "block",
          padding: "0.6rem 1.2rem",
          borderRadius: "8px",
          backgroundColor: showRealTimeDashboard ? "#cc2f2f" : "#ffa07a",
          color: "white",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 3px 8px rgb(204 47 47 / 0.5)",
          userSelect: "none",
          transition: "background-color 0.3s ease",
          outlineOffset: "3px",
        }}
      >
        {showRealTimeDashboard ? "Switch to Paste Analyzer" : "Switch to Real-Time Dashboard"}
      </button>

      {showRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={setAnalysisResult}
          onError={setError}
          loading={loading}
          flaggedBehaviors={flaggedBehaviors}
          verdict={verdictLabel}
          confidence={overallConfidence}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult
                analysisResult={analysisResult}
              />
            </>
          )}

          <ImmediateAlert
            flaggedBehaviors={highRiskFlags}
          />
        </>
      )}
    </main>
  );
};

export default App;