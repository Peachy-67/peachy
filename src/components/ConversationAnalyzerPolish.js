import React, { useState } from 'react';
import './uiPolishImprovements.css';
import FlaggedResultPolish from './FlaggedResultPolish';
import ShareResultButtonPolish from './ShareResultButtonPolish';

export default function ConversationAnalyzerPolish() {
  const [conversation, setConversation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function analyze() {
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation }),
      });
      if (!response.ok) {
        const respJson = await response.json();
        throw new Error(respJson.error || 'Analysis failed');
      }
      const data = await response.json();
      // Expect data: { verdict: string, flaggedBehaviors: array, confidenceScores: object }
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Compose share text with verdict and flagged behavior names
  const shareText = result
    ? `Conversation analysis result:\nVerdict: ${result.verdict}\nFlags: ${
        result.flaggedBehaviors && result.flaggedBehaviors.length > 0
          ? result.flaggedBehaviors.map((f) => f.type || f).join(', ')
          : 'None'
      }`
    : '';

  return (
    <section className="flagged-result-container" aria-label="Conversation analyzer">
      <label htmlFor="conversation-input" style={{ fontWeight: '600', marginBottom: '6px', display: 'block' }}>
        Paste conversation text:
      </label>
      <textarea
        id="conversation-input"
        rows="10"
        style={{
          width: '100%',
          borderRadius: '8px',
          border: '1px solid #f8b195',
          padding: '12px 14px',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '160px',
          boxShadow: '0 2px 6px #ffd8c1',
        }}
        value={conversation}
        onChange={(e) => setConversation(e.target.value)}
        placeholder="Paste the conversation you want to analyze..."
        aria-multiline="true"
        aria-describedby="conversation-helptext"
        spellCheck="true"
      />
      <div id="conversation-helptext" style={{ fontSize: '0.85rem', marginTop: '4px', color: '#a63f1a' }}>
        Paste complete conversation for best results.
      </div>
      <button
        onClick={analyze}
        disabled={loading || !conversation.trim()}
        style={{
          marginTop: '18px',
          backgroundColor: conversation.trim() && !loading ? '#ff7b49' : '#ffccbb',
          color: loading || !conversation.trim() ? '#664330a0' : '#4a1e00',
          fontWeight: '700',
          padding: '12px 28px',
          borderRadius: '22px',
          border: 'none',
          cursor: loading || !conversation.trim() ? 'not-allowed' : 'pointer',
          boxShadow: loading || !conversation.trim() ? 'none' : '0 4px 9px #ffa07a99',
          transition: 'background-color 0.3s ease',
          fontSize: '1.1rem',
          userSelect: 'none',
          alignSelf: 'start',
          display: 'block',
        }}
        aria-label="Analyze conversation for red flags"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: '14px',
            color: '#b00020',
            fontWeight: '600',
            backgroundColor: '#ffe6e3',
            padding: '10px 14px',
            borderRadius: '10px',
            boxShadow: 'inset 0 0 8px #f44336a8',
          }}
        >
          {error}
        </p>
      )}

      {result && (
        <>
          <FlaggedResultPolish
            verdict={result.verdict}
            flaggedBehaviors={result.flaggedBehaviors || []}
            confidenceScores={result.confidenceScores || {}}
          />
          <div style={{ textAlign: 'center' }}>
            <ShareResultButtonPolish textToShare={shareText} />
          </div>
        </>
      )}
    </section>
  );
}