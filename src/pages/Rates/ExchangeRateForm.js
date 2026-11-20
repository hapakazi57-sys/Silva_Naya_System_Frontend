import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import './ExchangeRateForm.css';

export default function ExchangeRateForm({ onClose, onSaved }) {
  const [f, setF] = useState({ currency: 'USD', rateToTzs: '', effectiveFrom: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rates/exchange', { currency: f.currency, rateToTzs: Number(f.rateToTzs), effectiveFrom: f.effectiveFrom || null });
      ok('New rate saved');
      onSaved();
    } catch (err) { fail(err); }
  };

  return (
    <Modal title="Set exchange rate" onClose={onClose}>
      <form className="form-grid exchange-rate-form" onSubmit={save}>
        <Field label="Currency"><select value={f.currency} onChange={set('currency')}><option>USD</option><option>CNY</option></select></Field>
        <Field label="1 = TZS"><input required type="number" step="0.0001" min="0" value={f.rateToTzs} onChange={set('rateToTzs')} /></Field>
        <Field label="Effective from" full><input type="date" value={f.effectiveFrom} onChange={set('effectiveFrom')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}