import React from 'react';

/** Tengeneza kiungo cha WhatsApp (wa.me) chenye ujumbe wa maandishi. */
export function waLink(phone, text) {
  let p = (phone || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = `255${p.slice(1)}`; // 07xx -> 2557xx
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

export function WaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ verticalAlign: '-3px', marginRight: 6 }}
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}