import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { fail } from '../../utils/alerts';
import { waLink, includesText, fmtD } from '../../utils/format';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Loader from '../../components/Loader/Loader';
import ModuleGate from '../../components/ModuleGate/ModuleGate';
import CustomerForm from './CustomerForm';
import CustomerView from './CustomerView';
import './Customers.css';

const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
);
const SearchIcon = (p) => (<Svg {...p}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>);
const PlusIcon = (p) => (<Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>);
const ChatIcon = (p) => (<Svg {...p}><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5A8.5 8.5 0 1 1 21 11.5z" /></Svg>);

/* Mounted (and fetched) only after the password is verified */
function CustomerList({ onEdit }) {
  const { data, loading } = useData('/customers');
  const [q, setQ] = useState('');
  const [view, setView] = useState(null);
  const list = data.filter((c) => includesText([c.name, c.phone, c.customerNo], q));

  const open = async (c) => {
    try { const r = await api.get(`/customers/${c.id}/summary`); setView(r.data); } catch (e) { fail(e); }
  };

  return (
    <>
      <div className="search-wrap cust-search">
        <SearchIcon />
        <input className="search" placeholder="Search name, phone or number..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? <Loader /> : (
        <Table
          rows={list}
          cols={[
            { h: 'Number', r: (r) => <b className="cust-no">{r.customerNo}</b> },
            { h: 'Name', r: (r) => r.name },
            { h: 'Phone', r: (r) => r.phone },
            { h: 'Address', r: (r) => r.address || '-' },
            { h: 'Date created', r: (r) => fmtD(r.createdAt) },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => open(r)}>View</button>
                <button className="btn btn-sm btn-ghost" onClick={() => onEdit(r)}>Edit</button>
                <a className="btn btn-sm btn-wa btn-icon" href={waLink(r.phone)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                  <ChatIcon size={14} />
                </a>
              </div>
            ) },
          ]}
        />
      )}
      {view && <CustomerView s={view} onClose={() => setView(null)} />}
    </>
  );
}

export default function Customers() {
  const [form, setForm] = useState(null);
  const [version, setVersion] = useState(0);

  return (
    <div className="customers-page">
      <PageHead title="Customers" sub="Register new customers. The list is protected by a password.">
        <button className="btn btn-primary btn-icon" onClick={() => setForm({})}><PlusIcon /> New customer</button>
      </PageHead>

      <ModuleGate module="customers" label="Customers">
        <CustomerList key={version} onEdit={setForm} />
      </ModuleGate>

      {form && (
        <CustomerForm
          initial={form.id ? form : null}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); setVersion((v) => v + 1); }}
        />
      )}
    </div>
  );
}