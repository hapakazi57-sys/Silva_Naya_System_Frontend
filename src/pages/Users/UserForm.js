import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import './UserForm.css';

export default function UserForm({ initial, me, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (f.id) await api.put(`/users/${f.id}`, f); else await api.post('/users', f);
      ok(f.id ? 'User updated' : 'User registered');
      onSaved();
    } catch (err) { fail(err); }
  };

  return (
    <Modal title={f.id ? 'Edit user' : 'New user'} onClose={onClose}>
      <form className="form-grid user-form" onSubmit={save}>
        <Field label="Full name *" full><input required value={f.fullName} onChange={set('fullName')} /></Field>
        <Field label="Email *"><input required type="email" disabled={!!f.id} value={f.email} onChange={set('email')} /></Field>
        <Field label="Phone"><input value={f.phone || ''} onChange={set('phone')} /></Field>
        <Field label="Role" full>
          <select value={f.role} disabled={f.id === me.id} onChange={set('role')}>
            {Object.entries(L.role).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        {!f.id && (
          <Field label="Initial password * (at least 8 characters)" full>
            <PasswordInput required minLength={8} value={f.password} onChange={set('password')} />
          </Field>
        )}
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}