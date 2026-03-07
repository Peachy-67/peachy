import React, { useState, useCallback } from "react";
import ConversationInput from "./ConversationInput.js";
import AnalyzeButton from "./AnalyzeButton.js";
import FlaggedResultDisplay from "./FlaggedResultDisplay.js";
import "./UIEnhancements.css";

export default function ConversationAnalyzer() {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onAnalyze = useCallback(async () => {
    if (!conversation.trim()) {
      setError("Please enter some conversation text before analyzing.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze conversation");
      }

      const data = await response.json();
      // expected data: { verdict, flags, confidence }

      setResult({
        verdict: data.verdict || "Safe",
        flags: data.flags || [],
        confidence: typeof data.confidence === "number" ? data.confidence : null,
      });
    } catch (err) {
      setError(err.message || "Unexpected error during analysis");
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  return (
    <div className="ui-container" aria-label="Conversation analysis interface">
      <ConversationInput
        value={conversation}
        onChange={(e) => setConversation(e.target.value)}
        disabled={loading}
      />
      <AnalyzeButton onClick={onAnalyze} disabled={loading} />
      {loading && (
        <p
          style={{ marginTop: "0.7rem", fontStyle: "italic", color: "#b3785b" }}
          aria-live="polite"
        >
          Analyzing conversation...
        </p>
      )}
      {error && (
        <p
          style={{
            marginTop: "0.7rem",
            color: "#c44331",
            fontWeight: "600",
            userSelect: "none",
          }}
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
      {result && (
        <FlaggedResultDisplay
          verdict={result.verdict}
          flags={result.flags}
          confidence={result.confidence}
        />
      )}
    </div>
  );
}