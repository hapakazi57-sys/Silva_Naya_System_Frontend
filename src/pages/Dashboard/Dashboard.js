import React from 'react';
import useData from '../../hooks/useData';
import { money, fmtDT } from '../../utils/format';
import { L } from '../../utils/labels';
import './Dashboard.css';

/* SVG icons (mistari, rangi inatoka kwenye tone ya kadi) */
const ICONS = {
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.3c2 .7 3.5 2.5 3.5 5.7" /></>),
  cart: (<><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6" /></>),
  package: (<><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 7.5L12 12.5l8.7-5" /><path d="M12 22V12.5" /><path d="M7.5 5.3l9 5" /></>),
  ship: (<><path d="M3 17l1.5 3h15L21 17H3z" /><path d="M5 17v-6h14v6" /><path d="M9 11V7h6v4" /><path d="M12 7V4" /></>),
  mapPin: (<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>),
  checkCircle: (<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 9.5" /></>),
  hourglass: (<path d="M7 3h10v4l-5 5 5 5v4H7v-4l5-5-5-5V3z" />),
  receipt: (<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>),
  creditCard: (<><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /><path d="M6.5 15h3" /></>),
  trendDown: (<><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>),
  banknote: (<><rect x="2.5" y="6" width="19" height="12" rx="2" /><circle cx="12" cy="12" r="2.8" /><path d="M6 9.5v.01M18 14.5v.01" /></>),
  shield: (<><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2.2 2.2 4.3-4.2" /></>),
  userCheck: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 11l2 2 4-4" /></>),
  userX: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M17 9l4 4M21 9l-4 4" /></>),
};

/* [ufunguo wa data, jina, jina la icon, rangi, ni fedha?] */
const CARDS = [
  ['customers', 'Customers', 'users', 'blue'], ['orders', 'Orders', 'cart', 'teal'], ['shipments', 'Shipments', 'package', 'indigo'],
  ['inTransit', 'In Transit', 'ship', 'amber'], ['arrivedNotCollected', 'Arrived Not Collected', 'mapPin', 'orange'], ['delivered', 'Delivered', 'checkCircle', 'green'],
  ['ordersPending', 'Pending Orders', 'hourglass', 'amber'], ['invoicesUnpaid', 'Unpaid Invoices', 'receipt', 'red'], ['invoicesPartial', 'Partially Paid Invoices', 'creditCard', 'blue'],
  ['totalDebt', 'Total Debt', 'trendDown', 'red', true], ['totalReceived', 'Total Received', 'banknote', 'green', true],
  ['usersTotal', 'Total Users', 'shield', 'indigo'], ['usersActive', 'Active Users', 'userCheck', 'green'], ['usersInactive', 'Inactive Users', 'userX', 'gray'],
];

export default function Dashboard({ me }) {
  const { data, loading } = useData('/dashboard', true, {});

  if (loading) return <div className="dash-loader"><div className="dash-spinner" /></div>;

  const cards = CARDS.filter((c) => data[c[0]] !== undefined);
  const recent = data.recent || [];

  return (
    <div className="dash">
      <div className="dash-head">
        <h2>Hi, {me.fullName}</h2>
        <p>Dashboard overview • {L.role[me.role]}</p>
      </div>

      <div className="dash-cards">
        {cards.map(([k, label, icon, tone, isMoney]) => (
          <div className={`dash-stat t-${tone}`} key={k}>
            <div className="dash-stat__ic">
              <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">{ICONS[icon]}</svg>
            </div>
            <div>
              <span>{label}</span>
              <b>{isMoney ? money(data[k]) : data[k]}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-panel">
        <h3>Recent Activities</h3>
        <div className="dash-table">
          <table>
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Details</th></tr>
            </thead>
            <tbody>
              {recent.length ? recent.map((r, i) => (
                <tr key={r.id ?? i}>
                  <td>{fmtDT(r.createdAt)}</td>
                  <td>{r.userName}</td>
                  <td><span className="dash-chip">{r.action}</span></td>
                  <td>{`${r.entity}: ${r.details || ''}`}</td>
                </tr>
              )) : <tr><td colSpan={4} className="dash-empty">No activities yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}