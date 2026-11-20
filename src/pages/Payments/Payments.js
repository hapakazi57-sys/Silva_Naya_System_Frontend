import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { ok, fail, askText } from '../../utils/alerts';
import { money, fmtDT, includesText } from '../../utils/format';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import ModuleGate from '../../components/ModuleGate/ModuleGate';
import PaymentForm from './PaymentForm';
import ReceiptView from './ReceiptView';
import './Payments.css';

const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
);
const SearchIcon = (p) => (<Svg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>);
const PlusIcon = (p) => (<Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>);

/* Mounted only after unlock */
function PaymentList({ me, onView }) {
  const { data, loading, reload } = useData('/payments');
  const [q, setQ] = useState('');
  const list = data.filter((p) => includesText([p.receiptNo, p.customer?.name], q));

  const voidIt = async (p) => {
    const reason = await askText(`Void receipt ${p.receiptNo}`, 'Enter the reason. The payment will be returned to the invoice.');
    if (!reason) return;
    try { await api.post(`/payments/${p.id}/void`, { reason }); ok('Receipt voided'); reload(); } catch (e) { fail(e); }
  };

  return (
    <>
      <div className="search-wrap list-search">
        <SearchIcon />
        <input className="search" placeholder="Search receipt or customer..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <Table
          rows={list}
          cols={[
            { h: 'Receipt', r: (r) => <b>{r.receiptNo}</b> },
            { h: 'Customer', r: (r) => r.customer.name },
            { h: 'Date', r: (r) => fmtDT(r.paidAt) },
            { h: 'Amount', r: (r) => money(r.amount, r.currency) },
            { h: 'Value (TZS)', r: (r) => money(r.amountTzs) },
            { h: 'Received by', r: (r) => r.receivedBy?.fullName },
            { h: 'Status', r: (r) => (r.receiptVoided ? <Badge tone="dark">Voided</Badge> : <Badge tone="green">Valid</Badge>) },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => onView(r)}>Receipt</button>
                {me.role === 'MANAGER' && !r.receiptVoided && <button className="btn btn-sm btn-danger" onClick={() => voidIt(r)}>Void</button>}
              </div>
            ) },
          ]}
        />
      )}
    </>
  );
}

export default function Payments({ me }) {
  const customers = useData('/customers/options').data;
  const [form, setForm] = useState(false);
  const [view, setView] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <div className="payments-page">
      <PageHead title="Payments & Receipts" sub="Cash received from customers">
        {me.role !== 'ADMIN' && (
          <button className="btn btn-primary btn-icon" onClick={() => setForm(true)}><PlusIcon /> Record payment</button>
        )}
      </PageHead>
      <ModuleGate module="payments" label="Payments">
        <PaymentList key={version} me={me} onView={setView} />
      </ModuleGate>
      {form && <PaymentForm customers={customers} onClose={() => setForm(false)} onSaved={(p) => { setForm(false); setVersion((v) => v + 1); setView(p); }} />}
      {view && <ReceiptView p={view} onClose={() => setView(null)} />}
    </div>
  );
}