/* Visaidizi vya kuonyesha data */
export const money = (n, c = 'TZS') =>
  `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.trim();

export const fmtDT = (v) => (v ? new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '-');
export const fmtD = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '-');

export const num = (v) => (v === '' || v == null ? null : Number(v));

export const includesText = (values, q) => values.some((v) => (v || '').toLowerCase().includes(q.toLowerCase()));

export const waLink = (phone) => {
  let n = (phone || '').replace(/\D/g, '');
  if (n.startsWith('0')) n = `255${n.slice(1)}`;
  return `https://wa.me/${n}`;
};
