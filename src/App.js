import React, { useState, useEffect, useCallback } from 'react';
import ConversationAnalyzerPolish from './components/ConversationAnalyzerPolish';
import ImmediateAlert from './components/ImmediateAlert';
import FlaggedResultVisualization from './components/FlaggedResultVisualization';
import ShareableResult from './components/ShareableResult';
import RealTimeDashboard from './components/RealTimeDashboard';
import './styles/UiPolishImprovements.css';

const highRiskFlags = [
  'insult',
  'gaslighting',
  'threat',
  'ultimatum',
  'discard',
];

const App = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFlags, setAlertFlags] = useState([]);
  const [monitoringRealtime, setMonitoringRealtime] = useState(false);

  // Check if analysis result has any high-risk flags
  const checkForHighRiskFlags = useCallback((flags = []) => {
    return flags.some((flag) => highRiskFlags.includes(flag));
  }, []);

  // Effect to update alert visibility based on result flagged behaviors
  useEffect(() => {
    if (!analysisResult) {
      setShowAlert(false);
      setAlertFlags([]);
      return;
    }
    const flags = analysisResult.signals || [];
    if (checkForHighRiskFlags(flags)) {
      setShowAlert(true);
      setAlertFlags(flags.filter((f) => highRiskFlags.includes(f)));
    } else {
      setShowAlert(false);
      setAlertFlags([]);
    }
  }, [analysisResult, checkForHighRiskFlags]);

  // Handler for new analysis result from ConversationAnalyzer or Dashboard
  const handleAnalysisUpdate = useCallback((result) => {
    setAnalysisResult(result);
  }, []);

  // Toggle RealTimeDashboard visibility
  const toggleRealtimeMonitor = () => {
    setMonitoringRealtime((prev) => !prev);
  };

  return (
    <main className="main-container" aria-label="Flagged conversation analyzer application">
      <header>
        <h1 style={{ textAlign: 'center', color: '#cc2f2f', userSelect: 'none' }}>FLAGGED Conversation Analyzer</h1>
      </header>

      <section aria-labelledby="analyzer-section-label" style={{ marginBottom: '2rem' }}>
        <h2 id="analyzer-section-label" className="ui-section-header">
          Analyze a Conversation Sample
        </h2>
        <ConversationAnalyzerPolish onResult={handleAnalysisUpdate} />
        {analysisResult && (
          <>
            <ImmediateAlert flaggedBehaviors={alertFlags} visible={showAlert} onDismiss={() => setShowAlert(false)} />
            <FlaggedResultVisualization
              verdict={analysisResult.verdict?.label || 'Safe'}
              flaggedBehaviors={(analysisResult.signals || []).map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
            />
            <ShareableResult 
              verdict={analysisResult.verdict?.label || 'Safe'} 
              flaggedBehaviors={(analysisResult.signals || []).map((type) => ({
                type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                confidence: analysisResult.confidence || 0,
              }))}
              overallConfidence={analysisResult.confidence || 0}
              conversationText={analysisResult.inputText || ''}
            />
          </>
        )}
      </section>

      <section aria-labelledby="realtime-dashboard-section-label" style={{ marginTop: '3rem' }}>
        <h2 id="realtime-dashboard-section-label" className="ui-section-header">
          Real-time Conversation Monitoring
        </h2>
        <button
          type="button"
          className="peachy-button"
          aria-pressed={monitoringRealtime}
          onClick={toggleRealtimeMonitor}
          style={{ marginBottom: '1rem' }}
        >
          {monitoringRealtime ? 'Stop Real-time Monitoring' : 'Start Real-time Monitoring'}
        </button>
        {monitoringRealtime && (
          <RealTimeDashboard onAnalysis={handleAnalysisUpdate} />
        )}
      </section>
    </main>
  );
};

export default App;