import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import './CustomerForm.css';

export default function CustomerForm({ initial, onClose, onSaved }) {
  const [f, setF] = useState(initial || { name: '', phone: '', email: '', address: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (initial) await api.put(`/customers/${initial.id}`, f); else await api.post('/customers', f);
      ok(initial ? 'Customer details updated' : 'Customer registered');
      onSaved();
    } catch (err) { fail(err); }
  };

  return (
    <Modal title={initial ? 'Edit Customer' : 'Register New Customer'} onClose={onClose}>
      <form className="form-grid customer-form" onSubmit={save}>
        <Field label="Customer Name *" full><input required value={f.name} onChange={set('name')} /></Field>
        <Field label="Phone Number *"><input required value={f.phone} onChange={set('phone')} placeholder="0712345678" /></Field>
        <Field label="Email"><input type="email" value={f.email || ''} onChange={set('email')} /></Field>
        <Field label="Address" full><input value={f.address || ''} onChange={set('address')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}
