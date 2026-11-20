import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { ok, fail, warn, confirmBox } from '../../utils/alerts';
import { money } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import CustomerSelect from '../../components/CustomerSelect/CustomerSelect';
import './PaymentForm.css';

export default function PaymentForm({ customers, onClose, onSaved }) {
  // Slim list (no lock needed) - only the fields this form uses
  const invoices = useData('/invoices/options').data;
  const fx = useData('/rates/exchange').data;
  const [f, setF] = useState({ customerId: '', amount: '', currency: 'TZS', note: '' });
  const [alloc, setAlloc] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const open = invoices.filter((i) => String(i.customer?.id) === String(f.customerId) && !i.voided && i.balance > 0);
  const today = new Date().toISOString().slice(0, 10);
  // Rates come from the backend sorted by date descending, so the first match is the most recent rate
  const rate = f.currency === 'TZS' ? 1 : (fx.find((r) => r.currency === f.currency && r.effectiveFrom <= today)?.rateToTzs || 0);
  const amountTzs = Number(f.amount || 0) * rate;
  const used = Object.values(alloc).reduce((s, v) => s + Number(v || 0), 0);
  const left = amountTzs - used;

  const auto = () => {
    let rem = amountTzs;
    const a = {};
    open.forEach((i) => [['PURCHASE', i.purchaseBalance], ['SHIPPING', i.shippingBalance]].forEach(([part, bal]) => {
      const v = Math.min(rem, bal);
      if (v > 0) { a[`${i.id}|${part}`] = v.toFixed(2); rem -= v; }
    }));
    setAlloc(a);
  };

  const save = async (e) => {
    e.preventDefault();
    const allocations = Object.entries(alloc).filter(([, v]) => Number(v) > 0).map(([k, v]) => {
      const [invoiceId, part] = k.split('|');
      return { invoiceId: Number(invoiceId), part, amountTzs: Number(v) };
    });
    if (!allocations.length) return warn('Allocate payment', 'Allocate at least one amount to an invoice.');
    if (!(await confirmBox('Confirm payment?', `${money(f.amount, f.currency)} from the customer. A receipt will be generated.`, 'Confirm'))) return undefined;
    try {
      const r = await api.post('/payments', { customerId: Number(f.customerId), amount: Number(f.amount), currency: f.currency, note: f.note, allocations });
      ok(`Payment recorded • Receipt ${r.data.receiptNo}`);
      onSaved(r.data);
    } catch (err) { fail(err); }
    return undefined;
  };

  return (
    <Modal title="Record payment" onClose={onClose} wide>
      <form className="form-grid" onSubmit={save}>
        <Field label="Customer *" full>
          <CustomerSelect customers={customers} value={f.customerId} onChange={(e) => { set('customerId')(e); setAlloc({}); }} />
        </Field>
        <Field label="Amount received *"><input required type="number" step="0.01" min="0.01" value={f.amount} onChange={set('amount')} /></Field>
        <Field label="Currency"><select value={f.currency} onChange={set('currency')}><option>TZS</option><option>USD</option><option>CNY</option></select></Field>
        {f.currency !== 'TZS' && <div className="full note-box">Rate: 1 {f.currency} = TZS {rate} • Value: <b>{money(amountTzs)}</b></div>}

        {f.customerId && (
          <div className="full">
            <div className="row-between">
              <h4>Allocate payment to invoices (TZS)</h4>
              <button type="button" className="btn btn-sm btn-ghost" onClick={auto}>
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: '-2px', marginRight: 6 }}>
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
                Auto-allocate
              </button>
            </div>
            {open.length === 0 ? <p className="muted">This customer has no invoices with an outstanding balance.</p> : open.map((i) => (
              <div className="alloc" key={i.id}>
                <b>{i.invoiceNo}</b>
                {[['PURCHASE', i.purchaseBalance], ['SHIPPING', i.shippingBalance]].filter(([, b]) => b > 0).map(([part, bal]) => (
                  <label key={part}>
                    <span>{L.part[part]} (outstanding {money(bal, '')})</span>
                    <input
                      type="number" step="0.01" min="0" max={bal} value={alloc[`${i.id}|${part}`] || ''}
                      onChange={(e) => setAlloc({ ...alloc, [`${i.id}|${part}`]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
            ))}
            <div className="total-line">Allocated: <b>{money(used)}</b> • Remaining: <b className={left < -0.01 ? 'txt-red' : ''}>{money(left)}</b></div>
          </div>
        )}

        <Field label="Note (optional)" full><input value={f.note} onChange={set('note')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!f.customerId || left < -0.01}>Confirm payment</button>
        </div>
      </form>
    </Modal>
  );
}