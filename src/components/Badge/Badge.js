import React from 'react';
import { TONE } from '../../utils/labels';
import './Badge.css';

/* <Badge s="APPROVED" map={L.order} />  au  <Badge tone="dark">Maandishi</Badge> */
export default function Badge({ s, map, tone, children }) {
  const t = tone || TONE[s] || 'gray';
  return <span className={`badge b-${t}`}>{children ?? (map ? map[s] || s : s)}</span>;
}
