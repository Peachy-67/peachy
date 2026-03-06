import React, { useState } from "react";
import ConversationInput from "./ConversationInput";
import AnalyzeButton from "./AnalyzeButton";
import FlaggedOutput from "./FlaggedOutput";
import ShareButton from "./ShareButton";

export default function AnalyzeConversation() {
  const [conversationText, setConversationText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    if (!conversationText.trim()) {
      setError("Please enter a conversation to analyze.");
      setAnalysisResult(null);
      return;
    }
    setError(null);
    setLoading(true);
    setAnalysisResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversation: conversationText }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || "Error analyzing conversation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <ConversationInput value={conversationText} onChange={setConversationText} />
      <AnalyzeButton onClick={handleAnalyze} disabled={loading} />
      {loading && <p aria-live="polite">Analyzing...</p>}
      {error && (
        <p role="alert" style={{ color: "red", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}
      {analysisResult && (
        <div style={{ marginTop: "1rem" }}>
          <FlaggedOutput flags={analysisResult.flags} />
          <ShareButton textToShare={JSON.stringify(analysisResult.flags)} />
        </div>
      )}
    </section>
  );
}