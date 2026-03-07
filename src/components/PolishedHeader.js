import React from 'react';
import './PolishedHeader.css';

export default function PolishedHeader({ title, subtitle }) {
  return (
    <header className="polished-header">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </header>
  );
}