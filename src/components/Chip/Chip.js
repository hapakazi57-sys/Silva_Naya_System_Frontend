import React from 'react';
import './Chip.css';

export default function Chip({ danger, children }) {
  return <span className={`chip ${danger ? 'chip-red' : ''}`}>{children}</span>;
}
