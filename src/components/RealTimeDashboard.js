import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import ConversationInputWithPolish from './ConversationInputWithPolish';
import AnalyzeButton from './AnalyzeButton';
import FlaggedResultVisualization from './FlaggedResultVisualization';
import ShareableResult from './ShareableResult';
import ImmediateAlert from './ImmediateAlert';
import './RealTimeDashboard.css';

/**
 * RealTimeDashboard component provides a live monitoring UI for conversation input,
 * real-time updates of analysis results, and a live alert stream for high-risk flags.
 * 
 * Supports manual analysis trigger and receives live updates via WebSocket connection.
 */
const RealTimeDashboard = ({ wsUrl }) => {
  const [conversationText, setConversationText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  // Set up WebSocket connection for live updates if wsUrl provided
  useEffect(() => {
    if (!wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.debug('WebSocket connected for real-time monitoring');
    };

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data && data.verdict) {
          setAnalysisResult(data);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        console.error('Invalid WebSocket message data', e);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error', event);
      setError('Real-time connection error.');
    };

    ws.onclose = () => {
      console.debug('WebSocket connection closed');
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [wsUrl]);

  // Manual analyze function fallback if no live connection or for immediate analysis
  const handleAnalyzeClick = async () => {
    if (!conversationText.trim()) {
      setError('Please enter conversation text');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: conversationText }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(`Analyze failed: ${err.message}`);
      setAnalysisResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-container" role="main" aria-label="Real-time conversation monitoring dashboard">
      <h1 className="dashboard-title">FLAGGED Real-Time Monitoring</h1>
      <section className="input-section" aria-label="Conversation input">
        <ConversationInputWithPolish
          value={conversationText}
          onChange={(e) => setConversationText(e.target.value)}
          disabled={loading}
          aria-describedby="inputHelpText"
          placeholder="Paste conversation text here for real-time analysis..."
        />
        <small id="inputHelpText" className="input-help-text">Paste conversation text and analyze instantly or wait for live updates.</small>
        <AnalyzeButton
          onClick={handleAnalyzeClick}
          disabled={loading || !conversationText.trim()}
          aria-label="Analyze conversation manually"
        >
          {loading ? 'Analyzing...' : 'Analyze Now'}
        </AnalyzeButton>
        {error && <p className="error-message" role="alert">{error}</p>}
      </section>

      <section className="results-section" aria-live="polite" aria-label="Analysis results and alerts">
        {analysisResult ? (
          <>
            <ImmediateAlert flaggedBehaviors={analysisResult.flaggedBehaviors} />
            <ShareableResult
              verdict={analysisResult.verdict}
              flaggedBehaviors={analysisResult.flaggedBehaviors}
              overallConfidence={analysisResult.overallConfidence}
              conversationText={conversationText}
            />
          </>
        ) : (
          <p className="no-results">No analysis results yet.</p>
        )}
      </section>
    </main>
  );
};

RealTimeDashboard.propTypes = {
  wsUrl: PropTypes.string, // WebSocket URL for live updates, optional
};

RealTimeDashboard.defaultProps = {
  wsUrl: '', // No live update by default
};

export default RealTimeDashboard;