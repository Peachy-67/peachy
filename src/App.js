import React, { useState, useEffect } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';

import './styles/UiPolish.css';

const HIGH_RISK_FLAGS = ['insult', 'gaslighting', 'threat', 'ultimatum', 'discard'];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  
  // Extract flagged behaviors in an array form for visualization
  const flaggedBehaviors = React.useMemo(() => {
    if (!analysisResult || !analysisResult.signals) return [];
    // Map signals to expected flag objects to pass to FlaggedResultVisualization etc.
    // Provide a label and confidence if available (confidence fallback to 0.8)
    return analysisResult.signals.map(signal => {
      let label;
      switch(signal) {
        case 'insult':
          label = 'Insult';
          break;
        case 'manipulation':
          label = 'Manipulation';
          break;
        case 'gaslighting':
          label = 'Gaslighting';
          break;
        case 'discard':
          label = 'Discard';
          break;
        case 'control':
          label = 'Control';
          break;
        case 'guilt':
          label = 'Guilt';
          break;
        case 'threat':
          label = 'Threat';
          break;
        case 'ultimatum':
          label = 'Ultimatum';
          break;
        case 'boundary_push':
          label = 'Boundary Push';
          break;
        case 'inconsistency':
          label = 'Inconsistency';
          break;
        default:
          label = signal;
      }
      // Confidence score fallback based on general confidence
      const confidence = analysisResult.confidence || 0.8;
      return { type: signal, label, confidence };
    });
  }, [analysisResult]);

  // Determine overall verdict label and band for visualization
  const verdictObj = React.useMemo(() => {
    if (!analysisResult || !analysisResult.verdict) return { label: 'Safe', band: 'green'};
    return {
      label: analysisResult.verdict.label,
      band: analysisResult.verdict.band,
      score: analysisResult.verdict.score || 0,
    };
  }, [analysisResult]);

  // Immediate alert triggers if any high-risk flags detected
  useEffect(() => {
    if (flaggedBehaviors.length === 0) {
      setAlertFlags([]);
      return;
    }
    const highRiskDetected = flaggedBehaviors.filter(f => HIGH_RISK_FLAGS.includes(f.type));
    setAlertFlags(highRiskDetected);
  }, [flaggedBehaviors]);

  // Handler: Called when ConversationAnalyzerPolish completes analysis
  const handleAnalysisComplete = (result, errorMsg) => {
    if (errorMsg) {
      setAnalysisResult(null);
      setError(errorMsg);
      setLoading(false);
      return;
    }
    setAnalysisResult(result);
    setError('');
    setLoading(false);
  };

  // Handler: User toggles between paste analyzer and real-time dashboard
  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
    setError('');
    setAnalysisResult(null);
    setAlertFlags([]);
  };

  // Compose result summary text for sharing
  const getShareText = () => {
    if (!analysisResult) return "FLAGGED RUN - No analysis result to share.";
    const flaggedLabels = flaggedBehaviors.map(f => f.label).join(', ') || 'No red flags';
    const safeText = verdictObj.band === 'green' ? 'Safe conversation detected.' : '';
    const confidencePercent = Math.round((analysisResult.confidence || 0) * 100);
    return `FLAGGED.RUN verdict: ${verdictObj.label} (${confidencePercent}%)\nFlags: ${flaggedLabels}\n${safeText}\nAnalyze your conversations with FLAGGED.RUN`;
  };

  return (
    <main className="ui-container" aria-label="FLAGGED conversation analyzer main app">
      <header>
        <h1 tabIndex={-1} style={{userSelect: "text"}}>FLAGGED.RUN Conversation Analyzer</h1>
        <button 
          type="button" 
          onClick={toggleDashboard} 
          aria-pressed={showDashboard}
          className="peachy-button"
          aria-label={showDashboard ? "Switch to paste conversation analyzer" : "Switch to real-time monitoring dashboard"}
        >
          {showDashboard ? 'Use Paste Input Analyzer' : 'Use Real-Time Dashboard'}
        </button>
      </header>

      <section>
        {showDashboard ? (
          <RealTimeDashboard onAnalyze={handleAnalysisComplete} />
        ) : (
          <ConversationAnalyzerPolish 
            onAnalysisComplete={handleAnalysisComplete} 
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />
        )}
      </section>

      <ImmediateAlert flaggedBehaviors={alertFlags} />

      {analysisResult && !showDashboard && (
        <section aria-label="Flagged conversation results" style={{marginTop: '1.5rem'}}>
          <FlaggedResultVisualization 
            verdict={verdictObj.label} 
            flaggedBehaviors={flaggedBehaviors} 
            overallConfidence={analysisResult.confidence || 0}
          />
          <ShareableResult 
            resultText={getShareText()} 
          />
        </section>
      )}
    </main>
  );
};

export default App;