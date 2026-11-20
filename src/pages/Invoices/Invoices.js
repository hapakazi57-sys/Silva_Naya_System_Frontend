import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { ok, fail, askText } from '../../utils/alerts';
import { money, fmtD, includesText } from '../../utils/format';
import { L } from '../../utils/labels';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import ModuleGate from '../../components/ModuleGate/ModuleGate';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';
import './Invoices.css';

const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
);
const SearchIcon = (p) => (<Svg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>);
const PlusIcon = (p) => (<Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>);

/* Mounted only after unlock */
function InvoiceList({ me, onView }) {
  const { data, loading, reload } = useData('/invoices');
  const [q, setQ] = useState('');
  const list = data.filter((i) => includesText([i.invoiceNo, i.customer?.name], q));

  const voidIt = async (i) => {
    const reason = await askText(`Void invoice ${i.invoiceNo}`, 'Enter reason for voiding this invoice (e.g. wrong order, wrong amount, etc.)');
    if (!reason) return;
    try { await api.post(`/invoices/${i.id}/void`, { reason }); ok('Invoice voided'); reload(); } catch (e) { fail(e); }
  };

  return (
    <>
      <div className="search-wrap list-search">
        <SearchIcon />
        <input className="search" placeholder="Invoice number or customer..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <Table
          rows={list}
          cols={[
            { h: 'Number', r: (r) => <b>{r.invoiceNo}</b> },
            { h: 'Customer', r: (r) => r.customer.name },
            { h: 'Type', r: (r) => L.itype[r.type] },
            { h: 'Issue Date', r: (r) => fmtD(r.issueDate) },
            { h: 'Total', r: (r) => money(r.total) },
            { h: 'Balance', r: (r) => <span className={r.balance > 0 && !r.voided ? 'txt-red' : ''}>{money(r.balance)}</span> },
            { h: 'Status', r: (r) => (r.voided ? <Badge tone="dark">Voided</Badge> : <Badge s={r.status} map={L.pay} />) },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => onView(r)}>View / Edit</button>
                {me.role === 'MANAGER' && !r.voided && r.paid <= 0 && <button className="btn btn-sm btn-danger" onClick={() => voidIt(r)}>Void</button>}
              </div>
            ) },
          ]}
        />
      )}
    </>
  );
}

export default function Invoices({ me }) {
  const customers = useData('/customers/options').data;
  const [form, setForm] = useState(false);
  const [view, setView] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <div className="invoices-page">
      <PageHead title="Invoices" sub="Invoices for sales, shipping, or adjustments">
        {me.role !== 'ADMIN' && (
          <button className="btn btn-primary btn-icon" onClick={() => setForm(true)}><PlusIcon /> New Invoice</button>
        )}
      </PageHead>
      <ModuleGate module="invoices" label="Invoices">
        <InvoiceList key={version} me={me} onView={setView} />
      </ModuleGate>
      {form && <InvoiceForm customers={customers} onClose={() => setForm(false)} onSaved={(inv) => { setForm(false); setVersion((v) => v + 1); setView(inv); }} />}
      {view && <InvoiceView inv={view} onClose={() => setView(null)} />}
    </div>
  );
}