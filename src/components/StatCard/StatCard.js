import React from 'react';
import './StatCard.css';

export default function StatCard({ label, value, icon, tone = 'blue' }) {
  return (
    <div className={`stat t-${tone}`}>
      <div className="stat-ic">{icon}</div>
      <div><span>{label}</span><b>{value}</b></div>
    </div>
  );
}
