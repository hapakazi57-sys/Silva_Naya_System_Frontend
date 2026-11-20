import React, { useEffect, useRef, useState } from 'react';
import { L } from '../../utils/labels';
import { fmtDT } from '../../utils/format';
import './Topbar.css';

/* SVG icons (line style) */
const ICONS = {
  menu: (<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>),
  expand: (<><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></>),
  collapse: (<><path d="M3 8h3a2 2 0 0 0 2-2V3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>),
  chevron: (<path d="M6 9l6 6 6-6" />),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
};

const Icon = ({ name, size = 20 }) => (
  <svg className="tb-ic" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{ICONS[name]}</svg>
);

/* Live date and time */
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/* Network status */
function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return online;
}

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';

export default function Topbar({ me, onMenu, onProfile, onLogout }) {
  const now = useClock();
  const online = useOnline();
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const box = useRef(null);

  /* Close the menu by clicking outside or pressing Esc */
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  /* Full screen */
  useEffect(() => {
    const sync = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggleFull = () => {
    const job = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    if (job && job.catch) job.catch(() => {});
  };

  const pick = (fn) => () => { setOpen(false); fn(); };
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="topbar">
      <button type="button" className="tb-btn burger" onClick={onMenu} aria-label="Open menu"><Icon name="menu" size={22} /></button>

      <div className="tb-clock" title="Date and time">
        <span className="tb-clock__ic"><Icon name="clock" size={18} /></span>
        <div><b>{time}</b><small>{date}</small></div>
      </div>

      <div className="spacer" />

      <span className={`tb-status ${online ? 'is-online' : 'is-offline'}`} role="status">
        <i aria-hidden="true" />{online ? 'Online' : 'Offline'}
      </span>

      <button type="button" className="tb-btn tb-full" onClick={toggleFull} aria-label="Full Screen" title={full ? 'Escape full screen' : 'Full screen'}>
        <Icon name={full ? 'collapse' : 'expand'} />
      </button>

      <span className="tb-sep" aria-hidden="true" />

      <div className="tb-user" ref={box}>
        <button type="button" className={`user-chip ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
          <i className="tb-avatar">{initials(me.fullName)}</i>
          <div><b>{me.fullName}</b><small>{L.role[me.role]}</small></div>
          <Icon name="chevron" size={16} />
        </button>

        {open && (
          <div className="tb-menu" role="menu">
            <div className="tb-menu__head">
              <i className="tb-avatar tb-avatar--lg">{initials(me.fullName)}</i>
              <div>
                <b>{me.fullName}</b>
                <small>{me.email}</small>
                <span className={`tb-role tb-role--${me.role}`}>{L.role[me.role]}</span>
              </div>
            </div>
            <div className="tb-menu__meta">Last user login: <b>{fmtDT(me.lastLogin)}</b></div>
            <button type="button" role="menuitem" className="tb-item" onClick={pick(onProfile)}><Icon name="user" size={18} />My account</button>
            <button type="button" role="menuitem" className="tb-item tb-item--danger" onClick={pick(onLogout)}><Icon name="logout" size={18} />Logout from the system</button>
          </div>
        )}
      </div>
    </header>
  );
}