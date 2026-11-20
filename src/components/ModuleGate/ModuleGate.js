import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { fail } from '../../utils/alerts';
import { setLockToken, clearLockToken } from '../../utils/moduleLock';
import Loader from '../Loader/Loader';
import './ModuleGate.css';

const LockIcon = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);


export default function ModuleGate({ module, label, children }) {
  const url = `/settings/module-lock/${module}`;
  const [state, setState] = useState('checking'); // checking | locked | open
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`${url}/status`)
      .then((r) => setState(r.data.enabled ? 'locked' : 'open'))
      .catch((e) => { fail(e); setState('locked'); });
    return () => clearLockToken(module);
  }, [url, module]);

  const unlock = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const r = await api.post(`${url}/verify`, { password: pw });
      if (r.data?.token) setLockToken(module, r.data.token);
      setState('open');
    } catch (x) {
      setErr(x?.response?.data?.message || 'Could not verify the password');
      setPw('');
    } finally { setBusy(false); }
  };

  if (state === 'checking') return <Loader />;
  if (state === 'open') return children;
  return (
    <div className="gate">
      <form className="gate-card" onSubmit={unlock}>
        <div className="gate-icon"><LockIcon /></div>
        <h3>{label} is protected</h3>
        <p>Enter the {label} password to continue. This is different from your login password and is set by the Administrator.</p>
        <input type="password" autoFocus placeholder={`${label} password`} value={pw} onChange={(e) => setPw(e.target.value)} />
        {err && <small className="gate-err">{err}</small>}
        <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? 'Checking...' : 'Unlock'}</button>
      </form>
    </div>
  );
}