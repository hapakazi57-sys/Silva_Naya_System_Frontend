import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { fmtDT } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import Kv from '../../components/Kv/Kv';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import './Profile.css';

export default function Profile({ me, onClose, onUpdated }) {
  const [p, setP] = useState({ fullName: me.fullName, phone: me.phone || '' });
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '' });

  const saveP = async (e) => {
    e.preventDefault();
    try { const r = await api.put('/auth/profile', p); onUpdated(r.data); ok('Profile saved'); } catch (err) { fail(err); }
  };
  const savePw = async (e) => {
    e.preventDefault();
    try { await api.post('/auth/change-password', pw); setPw({ oldPassword: '', newPassword: '' }); ok('Password changed'); } catch (err) { fail(err); }
  };

  return (
    <Modal title="My account" onClose={onClose}>
      <div className="profile">
        <div className="kv-grid">
          <Kv k="Email" v={me.email} />
          <Kv k="Role" v={L.role[me.role]} />
          <Kv k="Last login" v={fmtDT(me.lastLogin)} />
        </div>
        <form className="form-grid" onSubmit={saveP}>
          <Field label="Full name"><input required value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} /></Field>
          <Field label="Phone"><input value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
          <div className="form-foot full"><button className="btn btn-primary">Save profile</button></div>
        </form>
        <h4>Change password</h4>
        <form className="form-grid" onSubmit={savePw}>
          <Field label="Current password">
            <PasswordInput required value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} />
          </Field>
          <Field label="New password (at least 8 characters)">
            <PasswordInput required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
          <div className="form-foot full"><button className="btn btn-ghost">Change password</button></div>
        </form>
      </div>
    </Modal>
  );
}