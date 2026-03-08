import React, { useState } from "react";
import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import RealTimeDashboard from "./components/RealTimeDashboard";
import ShareableResult from "./components/ShareableResult";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import "./styles/UiPolish.css";
import "./styles/UiPolishImprovements.css";

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [alertActiveFlags, setAlertActiveFlags] = useState([]);

  // Handler to receive analysis from conversation analyzer or dashboard
  const handleAnalysis = (result) => {
    setAnalysisResult(result);
    // Extract high-risk flags for ImmediateAlert
    const highRiskFlags = result?.flaggedBehaviors?.filter(({ type }) =>
      ["insult", "manipulation", "gaslighting", "discard", "control"].includes(type.toLowerCase())
    ) || [];
    setAlertActiveFlags(highRiskFlags);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation red flag detector app">
      <h1 style={{ textAlign: "center", color: "#cc2f2f", userSelect: "none" }}>
        FLAGGED
      </h1>

      {/* Conversation Analyzer for pasted text input & manual analysis */}
      <section aria-label="Conversation Analyzer">
        <ConversationAnalyzerPolish onAnalysis={handleAnalysis} />
      </section>

      {/* Show Immediate Alert if any high-risk flags detected */}
      <ImmediateAlert flaggedBehaviors={alertActiveFlags} />

      {/* Show analysis result visualization if available */}
      {analysisResult && (
        <section
          aria-label="Conversation Analysis Result"
          style={{ margin: "2rem auto", maxWidth: "480px" }}
        >
          <FlaggedResultVisualization
            verdict={analysisResult.verdict}
            flaggedBehaviors={analysisResult.flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />
          <div style={{ marginTop: "12px" }}>
            <ShareableResult analysisResult={analysisResult} />
          </div>
        </section>
      )}

      {/* Real-time dashboard section for live conversation monitoring */}
      <section aria-label="Real-time Conversation Monitoring Dashboard" style={{ marginTop: "3rem" }}>
        <RealTimeDashboard onAnalysis={handleAnalysis} />
      </section>
    </main>
  );
};

export default App;