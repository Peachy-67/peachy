import React, { useState, useEffect } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";
import "./styles/UiPolish.css";

const highRiskFlags = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
  "discard",
]);

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check if any high risk flags exist in current result
  const highRiskInResult =
    analysisResult?.signals?.some((flag) => highRiskFlags.has(flag)) ?? false;

  // Extract verdict label mapping from backend verdict.band to UI strings
  const mapBandToVerdict = (band) => {
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
  };

  // Prepare flagged behaviors to pass to visualization and alerts
  // Map signals to types and labels, add mock confidence for visualization
  const flaggedBehaviors =
    analysisResult?.signals?.map((type) => {
      // Map to user-friendly label
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
      }[type.toLowerCase()] || type;

      // Fallback confidence from overall if no detail confidence available
      const confidence =
        typeof analysisResult.confidence === "number"
          ? analysisResult.confidence
          : 0.5;

      return {
        type,
        label,
        confidence,
      };
    }) || [];

  const verdictLabel =
    analysisResult && analysisResult.verdict
      ? mapBandToVerdict(analysisResult.verdict.band)
      : "Safe";
  const overallConfidence =
    typeof analysisResult?.confidence === "number"
      ? analysisResult.confidence
      : 0;

  // Handle conversation submit from analyzer
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
        const errorBody = await response.json();
        setError(errorBody.message || "Unknown error");
        setLoading(false);
        return;
      }
      const result = await response.json();

      setAnalysisResult(result);

      setLoading(false);
    } catch (err) {
      setError(err.message || "Network error");
      setLoading(false);
    }
  };

  // Reset alert dismissal when new result with high risk appears
  const [alertDismissed, setAlertDismissed] = useState(false);
  useEffect(() => {
    if (!highRiskInResult) setAlertDismissed(false);
  }, [highRiskInResult]);

  // Toggle between paste analyzer and realtime dashboard modes
  const toggleDashboard = () => {
    setShowDashboard((v) => !v);
    // Reset analysis and error states when switching modes
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED red flag conversation analyzer">
      <header style={{textAlign:'center', marginBottom: '1.5rem'}}>
        <h1 tabIndex="0" style={{userSelect:"none", color: "#cc2f2f"}}>FLAGGED</h1>
        <button
          type="button"
          className="peachy-button"
          onClick={toggleDashboard}
          aria-pressed={showDashboard}
          aria-label={showDashboard ? "Switch to conversation analyzer" : "Switch to real-time dashboard"}
        >
          {showDashboard ? "Switch to Analyzer" : "Switch to Dashboard"}
        </button>
      </header>

      {showDashboard ? (
        // RealTimeDashboard manages input and analysis internally
        <RealTimeDashboard
          onAnalysisUpdate={(result) => {
            setAnalysisResult(result);
            setError(null);
          }}
          error={error}
          loading={loading}
        />
      ) : (
        <>
          {/* Conversation analyzer input and analyze button */}
          <ConversationAnalyzerPolish
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />

          {/* Immediate Alert for high risk flags */}
          {highRiskInResult && !alertDismissed && analysisResult?.signals?.length > 0 && (
            <ImmediateAlert
              flaggedBehaviors={flaggedBehaviors.filter((f) =>
                highRiskFlags.has(f.type)
              )}
              onDismiss={() => setAlertDismissed(true)}
            />
          )}

          {/* Result visualization */}
          {analysisResult && (
            <section aria-live="polite" aria-label="Analysis result">
              <FlaggedResultVisualization
                verdict={verdictLabel}
                flaggedBehaviors={flaggedBehaviors}
                overallConfidence={overallConfidence}
              />
              <ShareableResult analysisResult={analysisResult} />
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;