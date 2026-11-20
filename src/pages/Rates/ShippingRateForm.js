import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { num } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import './ShippingRateForm.css';

export default function ShippingRateForm({ preset, onClose, onSaved }) {
  const [f, setF] = useState({ mode: preset?.mode || 'AIR', category: preset?.category || 'NORMAL', originCountry: 'ALL', ratePerKg: '', ratePerCbm: '', minCharge: '', volumetricDivisor: 6000, currency: 'USD', effectiveFrom: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rates/shipping', {
        ...f, ratePerKg: num(f.ratePerKg), ratePerCbm: num(f.ratePerCbm), minCharge: num(f.minCharge),
        volumetricDivisor: num(f.volumetricDivisor), effectiveFrom: f.effectiveFrom || null,
      });
      ok('New rate saved');
      onSaved();
    } catch (err) { fail(err); }
  };

  return (
    <Modal title="Add new shipping rate" onClose={onClose}>
      <form className="form-grid shipping-rate-form" onSubmit={save}>
        <Field label="Transport mode"><select value={f.mode} onChange={set('mode')}><option value="AIR">Air</option><option value="SEA">Sea</option></select></Field>
        <Field label="Goods type">
          <select value={f.category} onChange={set('category')}><option value="NORMAL">Normal Goods</option><option value="HK">HK (Hong Kong Goods)</option></select>
        </Field>
        <Field label="Country of origin">
          <select value={f.originCountry} onChange={set('originCountry')}><option value="ALL">All</option><option value="CHINA">China</option><option value="DUBAI">Dubai</option></select>
        </Field>
        <Field label="Rate per kg"><input type="number" step="0.01" min="0" value={f.ratePerKg} onChange={set('ratePerKg')} /></Field>
        <Field label="Rate per CBM"><input type="number" step="0.01" min="0" value={f.ratePerCbm} onChange={set('ratePerCbm')} /></Field>
        <Field label="Minimum charge"><input type="number" step="0.01" min="0" value={f.minCharge} onChange={set('minCharge')} /></Field>
        <Field label="Volumetric divisor (air)"><input type="number" min="1" value={f.volumetricDivisor} onChange={set('volumetricDivisor')} /></Field>
        <Field label="Currency"><select value={f.currency} onChange={set('currency')}><option>USD</option><option>CNY</option><option>TZS</option></select></Field>
        <Field label="Effective from"><input type="date" value={f.effectiveFrom} onChange={set('effectiveFrom')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </Modal>
  );
}