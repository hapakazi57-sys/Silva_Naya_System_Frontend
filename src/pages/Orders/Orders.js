import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { SW, ok, fail, confirmBox, askText } from '../../utils/alerts';
import { money } from '../../utils/format';
import { L } from '../../utils/labels';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import ModuleGate from '../../components/ModuleGate/ModuleGate';
import OrderForm from './OrderForm';
import OrderView from './OrderView';
import './Orders.css';

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

/* Inapakiwa tu baada ya password kuthibitishwa */
function OrdersList({ me, onForm, onView }) {
  const { data, loading, reload } = useData('/orders');
  const [fs, setFs] = useState('');
  const isMgr = me.role === 'MANAGER';
  const list = data.filter((o) => !fs || o.status === fs);

  const act = async (fn, msg) => { try { await fn(); ok(msg); reload(); } catch (e) { fail(e); } };

  const submit = async (o) => {
    if (await confirmBox('Submit?', `Order ${o.orderNo} will be submitted to the manager for approval.`, 'Submit')) act(() => api.post(`/orders/${o.id}/submit`), 'Order submitted to manager');
  };
  const approve = async (o) => {
    if (await confirmBox('Approve Order?', `${o.orderNo} - ${money(o.totalAmount, o.currency)}`, 'Approve')) act(() => api.post(`/orders/${o.id}/approve`), 'Order approved');
  };
  const reject = async (o) => {
    const n = await askText('Reject Order', 'Explain the reason for rejection');
    if (n) act(() => api.post(`/orders/${o.id}/reject`, { note: n }), 'Order rejected');
  };
  const revise = async (o) => {
    const n = await askText('Request Revision', 'Explain what needs to be revised');
    if (n) act(() => api.post(`/orders/${o.id}/revision`, { note: n }), 'Order sent for revision');
  };
  const cost = async (o) => {
    const r = await SW.fire({
      title: 'Actual Cost of Purchase', input: 'number', inputLabel: `Amount (${o.currency})`, inputValue: o.actualCost ?? o.totalAmount,
      inputAttributes: { step: '0.01', min: '0' }, showCancelButton: true, confirmButtonText: 'Save', cancelButtonText: 'Cancel',
    });
    if (r.isConfirmed) act(() => api.post(`/orders/${o.id}/actual-cost`, { amount: Number(r.value) }), 'Actual cost recorded');
  };

  return (
    <>
      <div className="list-toolbar">
        <select className="search" value={fs} onChange={(e) => setFs(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(L.order).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading ? <Loader /> : (
        <Table
          rows={list}
          cols={[
            { h: 'Order Number', r: (r) => <b>{r.orderNo}</b> },
            { h: 'Customer', r: (r) => r.customer.name },
            { h: 'Country', r: (r) => L.country[r.country] },
            { h: 'Supplier', r: (r) => r.supplierName },
            { h: 'Total', r: (r) => money(r.totalAmount, r.currency) },
            { h: 'Status', r: (r) => <Badge s={r.status} map={L.order} /> },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => onView(r)}>View</button>
                {(r.status === 'DRAFT' || r.status === 'REVISION') && (
                  <>
                    <button className="btn btn-sm btn-ghost" onClick={() => onForm(r)}>Edit</button>
                    <button className="btn btn-sm btn-primary" onClick={() => submit(r)}>Submit</button>
                  </>
                )}
                {isMgr && r.status === 'SUBMITTED' && r.createdBy?.id !== me.id && (
                  <>
                    <button className="btn btn-sm btn-success" onClick={() => approve(r)}>Approve</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => revise(r)}>Revise</button>
                    <button className="btn btn-sm btn-danger" onClick={() => reject(r)}>Reject</button>
                  </>
                )}
                {r.status === 'APPROVED' && me.role !== 'ADMIN' && <button className="btn btn-sm btn-ghost" onClick={() => cost(r)}>Actual Cost</button>}
              </div>
            ) },
          ]}
        />
      )}
    </>
  );
}

export default function Orders({ me }) {
  const customers = useData('/customers/options').data;
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <div className="orders-page">
      <PageHead title="Orders" sub="Orders for customers">
        <button className="btn btn-primary btn-icon" onClick={() => setForm({})}><PlusIcon /> New Order</button>
      </PageHead>

      <ModuleGate module="orders" label="Orders">
        <OrdersList key={version} me={me} onForm={setForm} onView={setView} />
      </ModuleGate>

      {form && <OrderForm initial={form.id ? form : null} customers={customers} onClose={() => setForm(null)} onSaved={() => { setForm(null); setVersion((v) => v + 1); }} />}
      {view && <OrderView o={view} onClose={() => setView(null)} />}
    </div>
  );
}