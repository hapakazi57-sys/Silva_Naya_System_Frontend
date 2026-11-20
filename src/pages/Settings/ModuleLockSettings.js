import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ok, fail, confirmBox } from '../../utils/alerts';

const MODS = [
  ['customers', 'Customers', '/settings/module-lock/customers'],
  ['orders', 'Orders', '/settings/module-lock/orders'],
  ['shipments', 'Shipments', '/settings/module-lock/shipments'],
  ['invoices', 'Invoices', '/settings/module-lock/invoices'],
  ['payments', 'Payments & Receipts', '/settings/module-lock/payments'],
];

function Row({ label, base }) {
  const [enabled, setEnabled] = useState(null);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`${base}/status`).then((r) => setEnabled(r.data.enabled)).catch(fail);
  }, [base]);

  const save = async (password) => {
    setBusy(true);
    try {
      const r = await api.put(base, { password });
      setEnabled(r.data.enabled); setPw('');
      ok(r.data.enabled ? `${label} password saved` : `${label} password removed`);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (await confirmBox(`Remove ${label} password?`, 'Anyone will be able to open this menu without a password.', 'Remove')) save('');
  };

  return (
    <div className="sec-row">
      <div className="sec-name">
        <b>{label}</b>
        <small>{enabled === null ? 'Checking...' : enabled ? 'Protected' : 'No password set'}</small>
      </div>
      <input type="text" autoComplete="off" placeholder={enabled ? 'New password' : 'Set password (min 4)'} value={pw} onChange={(e) => setPw(e.target.value)} />
      <button className="btn btn-sm btn-primary" disabled={busy || pw.length < 4} onClick={() => save(pw)}>Save</button>
      {enabled && <button className="btn btn-sm btn-danger" disabled={busy} onClick={remove}>Remove</button>}
    </div>
  );
}

export default function ModuleLockSettings() {
  return (
    <div className="sec-list">
      <p className="muted">Each menu has its own password, separate from login passwords. Share a menu password only with the staff who need it.</p>
      {MODS.map(([k, label, base]) => <Row key={k} label={label} base={base} />)}
    </div>
  );
}