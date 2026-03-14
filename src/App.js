import React, { useState, useEffect } from "react";

import ConversationAnalyzerPolish from "./components/ConversationAnalyzerPolish";
import ImmediateAlert from "./components/ImmediateAlert";
import FlaggedResultVisualization from "./components/FlaggedResultVisualization";
import ShareableResult from "./components/ShareableResult";
import RealTimeDashboard from "./components/RealTimeDashboard";

import "./styles/UiPolish.css";

const HIGH_RISK_FLAGS = new Set([
  "insult",
  "gaslighting",
  "threat",
  "ultimatum",
]);

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [isRealTimeDashboard, setIsRealTimeDashboard] = useState(false);

  // Whenever new analysis results arrive, check if alert or reset
  useEffect(() => {
    if (analysisResult && analysisResult.signals) {
      const highRiskDetected = analysisResult.signals.filter((signal) =>
        HIGH_RISK_FLAGS.has(signal)
      );

      if (highRiskDetected.length > 0) {
        setAlertFlags(highRiskDetected);
        setShowAlert(true);
        // Native alert dialog for immediate attention
        alert(
          `⚠️ High-risk flags detected: ${highRiskDetected
            .map((f) => f.charAt(0).toUpperCase() + f.slice(1))
            .join(", ")}. Please review carefully!`
        );
      } else {
        setShowAlert(false);
        setAlertFlags([]);
      }
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult]);

  // Handle dismiss alert banner
  const dismissAlert = () => {
    setShowAlert(false);
  };

  // Toggle real-time dashboard mode
  const toggleRealTimeDashboard = () => {
    setIsRealTimeDashboard((prev) => !prev);
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer app">
      <header>
        <h1 style={{ textAlign: "center", color: "#ff6f61", userSelect: "none" }}>
          FLAGGED 🚩
        </h1>
      </header>

      <section aria-label="Toggle real-time monitoring dashboard">
        <button
          type="button"
          onClick={toggleRealTimeDashboard}
          aria-pressed={isRealTimeDashboard}
          className="peachy-button"
        >
          {isRealTimeDashboard ? "Return to Analyzer" : "Open Real-Time Dashboard"}
        </button>
      </section>

      {showAlert && (
        <ImmediateAlert flags={alertFlags} onDismiss={dismissAlert} />
      )}

      {isRealTimeDashboard ? (
        <RealTimeDashboard
          onAnalysisUpdate={(result) => setAnalysisResult(result)}
        />
      ) : (
        <>
          <ConversationAnalyzerPolish onAnalysisResult={setAnalysisResult} />
          {analysisResult && (
            <>
              <FlaggedResultVisualization
                verdict={analysisResult.verdict.label}
                flaggedBehaviors={analysisResult.signals.map((type) => ({
                  type,
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  confidence: analysisResult.confidence ?? 0,
                }))}
                overallConfidence={analysisResult.confidence ?? 0}
              />

              <ShareableResult
                analysisResult={analysisResult}
                conversationExcerpt={
                  analysisResult?.meta?.conversationExcerpt ?? ""
                }
              />
            </>
          )}
        </>
      )}

      <footer
        style={{
          textAlign: "center",
          marginTop: "2rem",
          fontSize: "0.85rem",
          color: "#999",
          userSelect: "none",
        }}
      >
        &copy; 2024 FLAGGED.RUN
      </footer>
    </main>
  );
};

export default App;