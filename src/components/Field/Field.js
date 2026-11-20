import React from 'react';
import './Field.css';

export default function Field({ label, children, full }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}><span>{label}</span>{children}</label>
  );
}
