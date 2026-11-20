import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { SW, ok, fail, confirmBox } from '../../utils/alerts';
import { fmtDT } from '../../utils/format';
import { L } from '../../utils/labels';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Chip from '../../components/Chip/Chip';
import Loader from '../../components/Loader/Loader';
import UserForm from './UserForm';
import './Users.css';

/* ---------- SVG Icons ---------- */
const Svg = ({ size = 16, children, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
    {...rest}
  >
    {children}
  </svg>
);

const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Svg>
);

export default function Users({ me }) {
  const { data, loading, reload } = useData('/users');
  const [form, setForm] = useState(null);

  const toggle = async (u) => {
    if (!(await confirmBox(u.active ? 'Deactivate account?' : 'Activate account?', u.fullName))) return;
    try { await api.put(`/users/${u.id}`, { ...u, active: !u.active }); ok('Done'); reload(); } catch (e) { fail(e); }
  };
  const reset = async (u) => {
    const r = await SW.fire({
      title: `Reset password: ${u.fullName}`, input: 'text', inputLabel: 'New password (at least 8 characters)', showCancelButton: true,
      confirmButtonText: 'Reset', cancelButtonText: 'Cancel', inputValidator: (v) => (!v || v.length < 8 ? 'At least 8 characters' : undefined),
    });
    if (!r.isConfirmed) return;
    try { await api.post(`/users/${u.id}/reset-password`, { password: r.value }); ok('Password has been reset'); } catch (e) { fail(e); }
  };

  return (
    <div className="users-page">
      <PageHead title="Users" sub="Accounts and roles: Employee, Manager, System Administrator">
        <button className="btn btn-primary btn-icon" onClick={() => setForm({ fullName: '', email: '', phone: '', role: 'EMPLOYEE', password: '', active: true })}>
          <PlusIcon size={16} /> New user
        </button>
      </PageHead>
      {loading ? <Loader /> : (
        <Table
          rows={data}
          cols={[
            { h: 'Name', r: (r) => <b>{r.fullName}</b> },
            { h: 'Email', r: (r) => r.email },
            { h: 'Phone', r: (r) => r.phone || '-' },
            { h: 'Role', r: (r) => <Chip>{L.role[r.role]}</Chip> },
            { h: 'Last login', r: (r) => fmtDT(r.lastLogin) },
            { h: 'Status', r: (r) => <Badge tone={r.active ? 'green' : 'red'}>{r.active ? 'Active' : 'Deactivated'}</Badge> },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => setForm({ ...r, password: '' })}>Edit</button>
                <button className="btn btn-sm btn-ghost" onClick={() => reset(r)}>Password</button>
                {r.id !== me.id && <button className={`btn btn-sm ${r.active ? 'btn-danger' : 'btn-success'}`} onClick={() => toggle(r)}>{r.active ? 'Deactivate' : 'Activate'}</button>}
              </div>
            ) },
          ]}
        />
      )}
      {form && <UserForm initial={form} me={me} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload(); }} />}
    </div>
  );
}