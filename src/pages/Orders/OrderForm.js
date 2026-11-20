import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { money } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import CustomerSelect from '../../components/CustomerSelect/CustomerSelect';
import './OrderForm.css';

const emptyItem = { name: '', description: '', quantity: 1, unitPrice: '' };

export default function OrderForm({ initial, customers, onClose, onSaved }) {
  const [f, setF] = useState(initial
    ? {
      customerId: initial.customer.id, country: initial.country, supplierName: initial.supplierName, currency: initial.currency, note: initial.note || '',
      items: initial.items.map((i) => ({ name: i.name, description: i.description || '', quantity: i.quantity, unitPrice: i.unitPrice })),
    }
    : { customerId: '', country: 'CHINA', supplierName: '', currency: 'USD', note: '', items: [{ ...emptyItem }] });

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setItem = (i, k, v) => setF({ ...f, items: f.items.map((it, x) => (x === i ? { ...it, [k]: v } : it)) });
  const total = f.items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...f,
      customerId: Number(f.customerId),
      items: f.items.map((i) => ({ name: i.name, description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })),
    };
    try {
      if (initial) await api.put(`/orders/${initial.id}`, payload); else await api.post('/orders', payload);
      ok(initial ? 'Order updated' : 'Order saved');
      onSaved();
    } catch (err) { fail(err); }
  };

  return (
    <Modal title={initial ? `Edit Order ${initial.orderNo}` : 'New Order'} onClose={onClose} wide>
      <form className="form-grid" onSubmit={save}>
        <Field label="Customer *" full><CustomerSelect customers={customers} value={f.customerId} onChange={set('customerId')} /></Field>
        <Field label="Country of Purchase">
          <select value={f.country} onChange={set('country')}><option value="CHINA">China</option><option value="DUBAI">Dubai</option></select>
        </Field>
        <Field label="Product Currency *">
          <select value={f.currency} onChange={set('currency')}><option>USD</option><option>CNY</option><option>TZS</option></select>
        </Field>
        <Field label="Supplier / Company *" full><input required value={f.supplierName} onChange={set('supplierName')} /></Field>

        <div className="full">
          <div className="row-between">
            <h4>Products</h4>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setF({ ...f, items: [...f.items, { ...emptyItem }] })}>＋ Add Product</button>
          </div>
          {f.items.map((it, i) => (
            <div className="item-row" key={i}>
              <input required placeholder="Product Name" value={it.name} onChange={(e) => setItem(i, 'name', e.target.value)} />
              <input placeholder="Description" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
              <input required type="number" min="1" placeholder="Quantity" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} />
              <input required type="number" min="0" step="0.01" placeholder="Unit Price" value={it.unitPrice} onChange={(e) => setItem(i, 'unitPrice', e.target.value)} />
              <button type="button" className="icon-btn" disabled={f.items.length === 1} onClick={() => setF({ ...f, items: f.items.filter((_, x) => x !== i) })}>🗑️</button>
            </div>
          ))}
          <div className="total-line">Total: <b>{money(total, f.currency)}</b></div>
        </div>

        <Field label="Additional Notes" full><textarea rows="2" value={f.note} onChange={set('note')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save Order</button>
        </div>
      </form>
    </Modal>
  );
}
