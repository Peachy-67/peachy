import React, { useState, useEffect, useCallback } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

/**
 * Main App component integrating:
 * - Conversation paste analyzer with polished UI
 * - Immediate alert system for high-risk flags
 * - Polished flagged result visualization with confidence and badges
 * - Shareable result interface
 * - Real-time dashboard toggled for live monitoring
 * 
 * Manages analysis state and UI mode toggle per product roadmap.
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for new analysis from ConversationAnalyzerPolish and RealTimeDashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
    setErrorMessage("");
    setIsLoading(false);
  }, []);

  // Handler for loading and error states (mainly for paste analyzer)
  const handleLoading = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
  }, []);

  const handleError = useCallback((msg) => {
    setErrorMessage(msg || "Failed to analyze. Please try again.");
    setIsLoading(false);
  }, []);

  // Determines if there are any high-risk flags for immediate alert
  const highRiskFlags = ["insult", "gaslighting", "control", "threat", "discard", "ultimatum"];
  const flaggedBehaviors = analysisResult?.signals || [];
  const hasHighRiskFlag = flaggedBehaviors.some((flag) => highRiskFlags.includes(flag.toLowerCase()));

  // Map raw signals to flagged behaviors labeled for visualization and sharing
  // We assume a common display mapping consistent with FlagBadge component keys and labels
  const flaggedDisplayMap = {
    insult: { label: "Insult" },
    manipulation: { label: "Manipulation" },
    gaslighting: { label: "Gaslighting" },
    discard: { label: "Discard" },
    control: { label: "Control" },
    ultimatum: { label: "Ultimatum" },
    threat: { label: "Threat" },
    guilt: { label: "Guilt" },
    boundary_push: { label: "Boundary Push" },
    inconsistency: { label: "Inconsistency" },
  };

  // Convert signals to objects with type, label, and a default confidence if not present
  // Use confidence from analysisResult.confidence uniformly for all badges for simplicity
  const flaggedBehaviorsDetailed = flaggedBehaviors.map((signal) => ({
    type: signal,
    label: flaggedDisplayMap[signal.toLowerCase()]?.label || signal,
    confidence: analysisResult?.confidence ?? 0.5,
  }));

  // Verdict label categorization for visualization per roadmap ("Safe"/"Caution"/"Flagged")
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdictKey = analysisResult?.verdict?.band || "green";
  const verdictLabel = verdictLabelMap[verdictKey] || "Safe";

  // Share text generation for shareable result
  const shareText = React.useMemo(() => {
    if (!analysisResult) return "";
    let excerpt = "";
    if (analysisResult.meta?.originalText) {
      excerpt = analysisResult.meta.originalText.slice(0, 280).trim().replace(/\n+/g, " ") + (analysisResult.meta.originalText.length > 280 ? "…" : "");
    }
    const flagsString = flaggedBehaviorsDetailed.length
      ? flaggedBehaviorsDetailed.map((f) => f.label).join(", ")
      : "No red flags detected";
    return `FLAGGED Conversation Analysis:
Verdict: ${verdictLabel}
Detected flags: ${flagsString}
Confidence: ${(analysisResult.confidence * 100).toFixed(0)}%

Excerpt: "${excerpt}"`;
  }, [analysisResult, flaggedBehaviorsDetailed, verdictLabel]);

  // Toggle mode between paste analyzer and real-time dashboard
  const toggleMode = () => setShowDashboard((prev) => !prev);

  return (
    <main className="ui-container" aria-label="Flagged conversation analyzer main interface">
      <header>
        <h1 style={{ userSelect: "none", color: "#cc2f2f", textAlign: "center", marginBottom: "1rem" }}>FLAGGED Conversation Analyzer</h1>
        <button 
          className="peachy-button" 
          onClick={toggleMode} 
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
          type="button"
          style={{ marginBottom: "1.5rem", width: "100%" }}
        >
          {showDashboard ? "Use Paste Analyzer Instead" : "Use Real-Time Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          loading={isLoading}
          onLoading={handleLoading}
        />
      ) : (
        <ConversationAnalyzerPolish
          onAnalysisUpdate={handleAnalysisUpdate}
          onError={handleError}
          loading={isLoading}
          onLoading={handleLoading}
        />
      )}

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="alert-banner"
        >
          {errorMessage}
        </div>
      )}

      {/* Immediate alert notification for high-risk flags */}
      <ImmediateAlert flaggedBehaviors={flaggedBehaviorsDetailed} />

      {analysisResult && (
        <>
          {/* Visualize flagged result */}
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviorsDetailed}
            overallConfidence={analysisResult.confidence}
          />
          {/* Shareable result with sharing and copy */}
          <ShareableResult
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviorsDetailed}
            confidence={analysisResult.confidence}
            shareText={shareText}
          />
        </>
      )}
    </main>
  );
};

export default App;