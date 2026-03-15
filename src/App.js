import React, { useState } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

/**
 * The main app component that integrates:
 * - Conversation Analyzer with polished UI
 * - Immediate alert on high-risk flags
 * - Result visualization with verdict, flags, confidence
 * - Sharing interface for viral sharing and screenshot friendliness
 * - Real-time dashboard toggle and live monitoring
 */
const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Determine if any high-risk flags are present to trigger alerts
  const highRiskFlags = ["insult", "gaslighting", "threat", "ultimatum", "discard"];
  const flaggedBehaviors = analysisResult?.signals || [];
  const highRiskDetected = flaggedBehaviors.some((flag) => highRiskFlags.includes(flag.toLowerCase()));

  // Prepare flaggedBehaviors as array of {type, label, confidence} for visualization
  // We map known flags from analysisResult.signals using confidence from analysisResult.confidence if available
  // For unknown flags, fallback to label=type, confidence=0.5
  const mapFlagToObj = (flagType) => {
    const typeLower = flagType.toLowerCase();
    // We use label with uppercase first letter + spaces (e.g. 'Gaslighting')
    const label = typeLower.charAt(0).toUpperCase() + typeLower.slice(1).replace(/_/g, " ");
    const confidence = analysisResult?.confidence ?? 0.5;
    return { type: typeLower, label, confidence };
  };

  const flaggedBehaviorObjs =
    flaggedBehaviors.length > 0 ? flaggedBehaviors.map(mapFlagToObj) : [];

  // Overall verdict label map to expected values
  // Our backend verdict label might differ, but FlaggedResultVisualization expects one of 'Safe', 'Caution', or 'Flagged'
  // Map 'green' => 'Safe', 'yellow' => 'Caution', 'red' => 'Flagged'
  const verdictLabelMap = {
    green: "Safe",
    yellow: "Caution",
    red: "Flagged",
  };
  const verdictRaw = analysisResult?.verdict?.band ?? "green";
  const verdict = verdictLabelMap[verdictRaw] || "Safe";

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analysis application">
      <header>
        <h1 style={{ color: "#ff6f61", textAlign: "center", userSelect: "none" }}>
          FLAGGED
        </h1>
        <p style={{ textAlign: "center", maxWidth: 480, margin: "0 auto 20px" }}>
          Detect red flags in conversations, identify manipulation, gaslighting,
          and harmful behavior.
        </p>
      </header>

      {!showDashboard && (
        <>
          <ConversationAnalyzerPolish onResult={setAnalysisResult} />
          <ImmediateAlert flaggedBehaviors={flaggedBehaviorObjs} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={verdict}
                flaggedBehaviors={flaggedBehaviorObjs}
                overallConfidence={analysisResult.confidence ?? 0}
              />
              <ShareableResult
                textInput={analysisResult.meta?.inputText || ""}
                analysis={analysisResult}
              />
            </>
          )}
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              type="button"
              className="peachy-button"
              onClick={() => setShowDashboard(true)}
              aria-label="Switch to real-time monitoring dashboard"
            >
              Go to Real-Time Dashboard
            </button>
          </div>
        </>
      )}

      {showDashboard && (
        <>
          <RealTimeDashboard />
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button
              type="button"
              className="peachy-button"
              onClick={() => setShowDashboard(false)}
              aria-label="Switch to conversation paste analyzer"
            >
              Back to Conversation Analyzer
            </button>
          </div>
        </>
      )}
    </main>
  );
};

export default App;