import React, { useState, useEffect } from 'react';
import { api, getToken, clearAuth } from './utils/api';
import { SW, confirmBox } from './utils/alerts';
import Loader from './components/Loader/Loader';
import Sidebar from './layout/Sidebar/Sidebar';
import Topbar from './layout/Topbar/Topbar';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Customers from './pages/Customers/Customers';
import Orders from './pages/Orders/Orders';
import Shipments from './pages/Shipments/Shipments';
import Invoices from './pages/Invoices/Invoices';
import Payments from './pages/Payments/Payments';
import Rates from './pages/Rates/Rates';
import Users from './pages/Users/Users';
import Logs from './pages/Logs/Logs';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Reports from './pages/Reports/Reports';
import './App.css';

const IDLE_MS = 30 * 60 * 1000; // 30 minutes

/* Pages restricted by role (pages not listed here are open to everyone) */
const PAGE_ROLES = {
  users: ['ADMIN'],
  settings: ['ADMIN'],
  reports: ['ADMIN', 'MANAGER'],
};

export default function App() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [profile, setProfile] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onOut = () => setMe(null);
    window.addEventListener('sn-logout', onOut);
    if (getToken()) api.get('/auth/me').then((r) => setMe(r.data)).catch(() => clearAuth()).finally(() => setReady(true));
    else setReady(true);
    return () => window.removeEventListener('sn-logout', onOut);
  }, []);

  useEffect(() => { // automatic logout after inactivity
    if (!me) return undefined;
    let t;
    const evs = ['click', 'keydown', 'mousemove', 'touchstart'];
    const reset = () => {
      clearTimeout(t);
      t = setTimeout(() => { clearAuth(); setMe(null); SW.fire({ icon: 'info', title: 'Session expired', text: 'You were signed out for security because you were inactive for too long.', confirmButtonText: 'OK' }); }, IDLE_MS);
    };
    evs.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, reset)); };
  }, [me]);

  const logout = async () => { if (await confirmBox('Log out of the system?', 'You will need to sign in again.', 'Log out')) { clearAuth(); setMe(null); setPage('dashboard'); } };

  if (!ready) return <Loader />;
  if (!me) return <Login onLogin={setMe} />;

  const views = {
    dashboard: <Dashboard me={me} />, customers: <Customers />, orders: <Orders me={me} />, shipments: <Shipments />,
    invoices: <Invoices me={me} />, payments: <Payments me={me} />, rates: <Rates me={me} />, users: <Users me={me} />, logs: <Logs />,
    settings: <Settings me={me} />,
    reports: <Reports me={me} />,
  };

  /* Fall back to the dashboard if the user's role cannot open this page */
  const allowed = !PAGE_ROLES[page] || PAGE_ROLES[page].includes(me.role);
  const current = allowed ? page : 'dashboard';

  return (
    <div className="app">
      <Sidebar role={me.role} page={current} open={menu} onNavigate={(k) => { setPage(k); setMenu(false); }} />
      <div className="main">
        <Topbar me={me} onMenu={() => setMenu(!menu)} onProfile={() => setProfile(true)} onLogout={logout} />
        <main className="page" key={current}>{views[current]}</main>
      </div>
      {profile && <Profile me={me} onClose={() => setProfile(false)} onUpdated={(u) => setMe(u)} />}
    </div>
  );
}