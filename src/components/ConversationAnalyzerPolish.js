import React, { useState } from 'react';
import { ConversationInputPolish } from './ConversationInputPolish.js';
import { AnalyzeButtonPolish } from './AnalyzeButtonPolish.js';
import { FlaggedResultPolish } from './FlaggedResultPolish.js';
import './UIEnhancements.css';

export function ConversationAnalyzerPolish() {
  const [conversation, setConversation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeConversation = async () => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();

      // Expecting data.verdict: "Safe" | "Caution" | "Flagged"
      // and data.flags: array of flagged behavior strings
      setResult({
        verdict: data.verdict || 'Safe',
        flaggedBehaviors: Array.isArray(data.flags) ? data.flags : [],
      });
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ui-container"
      style={{ maxWidth: 740, marginTop: 24 }}
      aria-live="polite"
      aria-atomic="true"
    >
      <ConversationInputPolish value={conversation} onChange={setConversation} />
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <AnalyzeButtonPolish
          onClick={analyzeConversation}
          disabled={!conversation.trim() || loading}
          label={loading ? 'Analyzing...' : 'Analyze Conversation'}
        />
      </div>
      {error && <div className="ui-alert" role="alert">{error}</div>}
      {result && !error && (
        <FlaggedResultPolish
          verdict={result.verdict}
          flaggedBehaviors={result.flaggedBehaviors}
        />
      )}
    </div>
  );
}