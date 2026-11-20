import React from 'react';
import './PageHead.css';

export default function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      <div className="head-actions">{children}</div>
    </div>
  );
}
