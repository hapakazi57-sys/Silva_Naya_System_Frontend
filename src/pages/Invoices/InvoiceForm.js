import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { money, num } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import CustomerSelect from '../../components/CustomerSelect/CustomerSelect';
import './InvoiceForm.css';

export default function InvoiceForm({ customers, onClose, onSaved }) {
  // Slim lists (no lock needed) - only the fields this form uses
  const orders = useData('/orders/options').data;
  const shipments = useData('/shipments/options').data;
  const [f, setF] = useState({ customerId: '', orderId: '', shipmentId: '', dueDate: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value, ...(k === 'customerId' ? { orderId: '', shipmentId: '' } : {}) });
  const myOrders = orders.filter((o) => String(o.customer?.id) === String(f.customerId) && o.status === 'APPROVED');
  const myShips = shipments.filter((s) => String(s.customer?.id) === String(f.customerId));

  const save = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/invoices', { customerId: Number(f.customerId), orderId: num(f.orderId), shipmentId: num(f.shipmentId), dueDate: f.dueDate || null });
      ok(`Invoice ${r.data.invoiceNo} created`);
      onSaved(r.data);
    } catch (err) { fail(err); }
  };

  return (
    <Modal title="Create Invoice" onClose={onClose}>
      <form className="form-grid" onSubmit={save}>
        <Field label="Customer *" full><CustomerSelect customers={customers} value={f.customerId} onChange={set('customerId')} /></Field>
        <Field label="Purchase Order (Approved)" full>
          <select value={f.orderId} onChange={set('orderId')}>
            <option value="">-- None --</option>
            {myOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNo} • {money(o.actualCost ?? o.totalAmount, o.currency)}</option>)}
          </select>
        </Field>
        <Field label="Shipment (Shipping)" full>
          <select value={f.shipmentId} onChange={set('shipmentId')}>
            <option value="">-- None --</option>
            {myShips.map((s) => <option key={s.id} value={s.id}>{s.cargoNo} • {money(s.chargeTzs)}</option>)}
          </select>
        </Field>
        <Field label="Due Date" full><input type="date" value={f.dueDate} onChange={set('dueDate')} /></Field>
        <p className="muted full invoice-hint">Select an order, shipment, or both to generate an invoice. Once created, invoices cannot be modified. They can only be voided by the Manager.</p>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!f.customerId}>Create</button>
        </div>
      </form>
    </Modal>
  );
}