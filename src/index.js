import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './components/MainApp';
import './styles/ui-polish.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}