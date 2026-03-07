import React from 'react';
import './PolishedContainer.css';

export default function PolishedContainer({ children }) {
  return (
    <div className="polished-container" role="main">
      {children}
    </div>
  );
}