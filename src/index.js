import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './components/MainApp';
import './styles/FlaggedResultVisualization.css';
import './styles/MainApp.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(<MainApp />);