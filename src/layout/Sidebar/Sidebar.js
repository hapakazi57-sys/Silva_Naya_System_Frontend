import React from 'react';
import { COMPANY_WA } from '../../utils/labels';
import './Sidebar.css';

/* SVG icons (line style, color follows the button text) */
const ICONS = {
  dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.3c2 .7 3.5 2.5 3.5 5.7" /></>),
  cart: (<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></>),
  truck: (<><path d="M1 6h13v10H1z" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  receipt: (<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>),
  creditCard: (<><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6.5 15h3" /></>),
  scale: (<><path d="M12 3v18" /><path d="M6 21h12" /><path d="M5 7h14" /><path d="M5 7l-3 7a3 3 0 0 0 6 0L5 7z" /><path d="M19 7l-3 7a3 3 0 0 0 6 0l-3-7z" /></>),
  lock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  fileText: (<><path d="M6 3h8l4 4v14H6V3z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></>),
  chart: (<><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7.5" y="11" width="3" height="6" rx=".8" /><rect x="12.5" y="7" width="3" height="10" rx=".8" /><rect x="17.5" y="13" width="2.5" height="4" rx=".8" /></>),
  cog: (<><circle cx="12" cy="12" r="3" /><path d="M12 2.8l1.4 2.5 2.8-.6.9 2.7 2.6 1.2-.9 2.7 1.7 2.3-2.1 1.9.1 2.9-2.8.5-1.5 2.4-2.5-1.3-2.5 1.3-1.5-2.4-2.8-.5.1-2.9-2.1-1.9 1.7-2.3-.9-2.7 2.6-1.2.9-2.7 2.8.6z" /></>),
  chat: (<><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5A8.5 8.5 0 1 1 21 11.5z" /><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" /></>),
};

/* [key, icon name, menu label, allowed roles (optional)] */
const MENU = [
  ['dashboard', 'dashboard', 'Dashboard'],
  ['customers', 'users', 'Customers'],
  ['orders', 'cart', 'Purchases'],
  ['shipments', 'truck', 'Shipments'],
  ['invoices', 'receipt', 'Invoices'],
  ['payments', 'creditCard', 'Payments & Receipts'],
  ['rates', 'scale', 'Rates & Currency'],
  ['users', 'lock', 'Users', ['ADMIN']],
  ['reports', 'chart', 'Reports', ['MANAGER', 'ADMIN']],
  ['logs', 'fileText', 'Logs'],
  ['settings', 'cog', 'Settings', ['ADMIN']],
];

const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">{ICONS[name]}</svg>
);

export default function Sidebar({ role, page, open, onNavigate }) {
  const items = MENU.filter((m) => !m[3] || m[3].includes(role));
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="logo">SN</div><div><b>SILVA NAYA</b><small>COMPANY LTD</small></div></div>
      <nav>
        {items.map(([k, icon, label]) => (
          <button key={k} className={`nav-item ${page === k ? 'active' : ''}`} onClick={() => onNavigate(k)}>
            <Icon name={icon} />{label}
          </button>
        ))}
      </nav>
      <a className="nav-item wa" href={`https://wa.me/${COMPANY_WA}`} target="_blank" rel="noreferrer">
        <Icon name="chat" />Company WhatsApp
      </a>
    </aside>
  );
}