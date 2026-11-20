import React from 'react';
import './CustomerSelect.css';

export default function CustomerSelect({ customers, value, onChange }) {
  return (
    <select className="customer-select" value={value} onChange={onChange}>
      <option value="">-- Chagua mteja --</option>
      {customers.map((c) => <option key={c.id} value={c.id}>{c.customerNo} - {c.name}</option>)}
    </select>
  );
}
