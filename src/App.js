import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/uiPolish.css';

const App = () => {
  // State for conversation analysis results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State controlling dashboard visibility
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler called when ConversationAnalyzerPolish triggers an analysis
  const handleAnalyze = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || 'Analysis failed. Please try again.');
        setLoading(false);
        return;
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (e) {
      setError('Network error or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // Extract flagged behaviors in detailed format for visualization and alert
  // flaggedBehaviors array with { type, label, confidence }
  // Map signals to user friendly labels with confidence from analysisResult if available
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult?.signals || analysisResult.signals.length === 0) return [];

    // Simple mapping for friendly labels and confidence from reaction or signals not guaranteed,
    // fallback confidence to 1 or from analysisResult.confidence
    return analysisResult.signals.map((type) => {
      // Map shorter type names to user friendly
      const labelMap = {
        insult: 'Insult',
        manipulation: 'Manipulation',
        gaslighting: 'Gaslighting',
        discard: 'Discard',
        control: 'Control',
        ultimatum: 'Ultimatum',
        threat: 'Threat',
        guilt: 'Guilt',
        boundary_push: 'Boundary Push',
        inconsistency: 'Inconsistency',
      };

      let label = labelMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
      // Determine confidence for the flag, fallback to overall confidence or 1
      // No detailed confidence per individual signal from backend currently, so fallback
      const confidence = analysisResult?.confidence ?? 1;

      return { type, label, confidence };
    });
  }, [analysisResult]);

  // Derive verdict label string: Map backend verdict band to "Safe", "Caution", "Flagged"
  // Backend verdict.band values: "green", "yellow", "red"
  const verdictLabel = React.useMemo(() => {
    if (!analysisResult?.verdict) return 'Safe';
    const band = analysisResult.verdict.band;
    switch (band) {
      case 'green': return 'Safe';
      case 'yellow': return 'Caution';
      case 'red': return 'Flagged';
      default: return 'Safe';
    }
  }, [analysisResult]);

  // Show Immediate Alert if flagged behaviors include any high risk signals (red flags)
  // Define high risk flags as insult, gaslighting, discard, ultimatum, threat, manipulation
  const highRiskFlags = ['insult', 'gaslighting', 'discard', 'ultimatum', 'threat', 'manipulation'];
  const highRiskDetected = flaggedBehaviors.some(fb => highRiskFlags.includes(fb.type));

  // Handler for closing alert, we manage alert visibility with local state
  const [alertVisible, setAlertVisible] = useState(false);
  useEffect(() => {
    if (highRiskDetected) {
      setAlertVisible(true);
      // Also trigger browser native alert for immediate attention
      alert('High-risk behavior detected in conversation! Please review carefully.');
    } else {
      setAlertVisible(false);
    }
  }, [highRiskDetected]);

  // Compose shareable text summary for share button
  const shareText = React.useMemo(() => {
    if (!analysisResult) return '';
    const summaryLines = [];
    summaryLines.push(`FLAGGED Verdict: ${verdictLabel}`);
    if (flaggedBehaviors.length > 0) {
      summaryLines.push('Detected red flags:');
      flaggedBehaviors.forEach(fb => {
        summaryLines.push(`- ${fb.label} (${Math.round(fb.confidence * 100)}%)`);
      });
    } else {
      summaryLines.push('No red flags detected.');
    }
    return summaryLines.join('\n');
  }, [analysisResult, flaggedBehaviors, verdictLabel]);

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer application">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', userSelect: 'none', color: '#cc2f2f' }}>
        FLAGGED Conversation Analyzer
      </h1>

      <ConversationAnalyzerPolish onAnalyze={handleAnalyze} loading={loading} error={error} />

      <ImmediateAlert
        flaggedBehaviors={flaggedBehaviors}
        visible={alertVisible}
        onDismiss={() => setAlertVisible(false)}
      />

      {analysisResult && (
        <section aria-label="Conversation analysis result" style={{ marginTop: '1.5rem' }}>
          <FlaggedResultVisualization
            verdict={verdictLabel}
            flaggedBehaviors={flaggedBehaviors}
            overallConfidence={analysisResult.confidence}
          />

          <ShareableResult
            textToShare={shareText}
            disabled={!analysisResult}
          />
        </section>
      )}

      {/* Toggle for RealTimeDashboard */}
      <section style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => setShowDashboard((v) => !v)}
          className="peachy-button"
          aria-pressed={showDashboard}
          aria-label="Toggle real-time conversation dashboard"
        >
          {showDashboard ? 'Hide Real-Time Dashboard' : 'Show Real-Time Dashboard'}
        </button>
      </section>

      {showDashboard && (
        <section aria-label="Real-time conversation monitoring dashboard" style={{ marginTop: '1rem' }}>
          <RealTimeDashboard />
        </section>
      )}
    </main>
  );
};

export default App;