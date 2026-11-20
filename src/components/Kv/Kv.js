import React from 'react';
import './Kv.css';

export default function Kv({ k, v }) {
  return <div className="kv"><span>{k}</span><b>{v ?? '-'}</b></div>;
}
