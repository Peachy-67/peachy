import React, { useEffect, useState, useRef } from "react";
import FlaggedOutput from "./FlaggedOutput.js";
import Verdict from "./Verdict.js";
import ShareButton from "./ShareButton.js";
import "../styles/RealTimeDashboard.css";

function RealTimeDashboard() {
  const [conversation, setConversation] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ws = useRef(null);

  // Connect to a websocket backend or SSE endpoint for real-time updates
  // For demo, we'll mock with polling simulated here.
  // Assumes backend supports streaming or WebSocket at /api/realtime or similar

  useEffect(() => {
    // Example websocket connection (adjust URL if real ws exists)
    // If no backend ws yet, fallback to no real-time connection
    if ("WebSocket" in window) {
      ws.current = new WebSocket(`${window.location.origin.replace(/^http/, "ws")}/api/realtime`);
      ws.current.onopen = () => {
        setError("");
      };
      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.conversation && data.analysis) {
            setConversation(data.conversation);
            setAnalysis(data.analysis);
          }
        } catch {
          // ignore malformed data
        }
      };
      ws.current.onerror = () => {
        setError("Real-time connection error");
      };
      ws.current.onclose = () => {
        setError("Real-time connection closed");
      };
      return () => ws.current.close();
    } else {
      setError("Real-time updates not supported by your browser");
    }
  }, []);

  // Fallback UI includes:
  // Conversation text area
  // Button to manually analyze for first launch or fallback
  // Displays verdict and flagged badges in real-time

  // Manual analyze fallback:
  async function analyzeText() {
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      if (!response.ok) {
        throw new Error(`Server ${response.status}`);
      }
      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError("No analysis returned");
      }
    } catch (err) {
      setError("Analyze error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-container" role="main" aria-label="Real-time Red Flags Dashboard">
      <section className="input-section" aria-labelledby="input-heading">
        <h2 id="input-heading" className="section-title">
          Conversation Input
        </h2>
        <textarea
          className="conversation-input"
          aria-label="Paste or type conversation text here"
          placeholder="Paste conversation text here for analysis..."
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          rows={6}
          spellCheck="false"
        />
        <button
          className="analyze-button"
          onClick={analyzeText}
          disabled={loading || !conversation.trim()}
          aria-disabled={loading || !conversation.trim()}
          aria-live="polite"
        >
          {loading ? "Analyzing..." : "Analyze Conversation"}
        </button>
        {error && (
          <p className="error-message" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
      </section>

      <section className="result-section" aria-live="polite" aria-label="Analysis results">
        <h2 className="section-title">Detected Red Flags & Insights</h2>
        {analysis ? (
          <>
            <Verdict verdict={analysis.verdict} />
            <FlaggedOutput flags={analysis.flags} />
            <ShareButton
              shareText={`Conversation flagged result:\nVerdict: ${analysis.verdict}\nFlags: ${analysis.flags
                .map((f) => f.type)
                .join(", ") || "None"}`}
              ariaLabel="Share flagged conversation result"
              className="share-button"
            />
          </>
        ) : (
          <p className="no-data-message">No analysis data available yet.</p>
        )}
      </section>
    </main>
  );
}

export default RealTimeDashboard;