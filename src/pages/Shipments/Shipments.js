import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { SW, ok, fail } from '../../utils/alerts';
import { money, includesText, fmtD } from '../../utils/format';
import { L } from '../../utils/labels';
import { GOODS } from '../../utils/goods';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Loader from '../../components/Loader/Loader';
import ModuleGate from '../../components/ModuleGate/ModuleGate';
import ShipmentForm from './ShipmentForm';
import ShipmentView from './ShipmentView';
import DeliverForm from './DeliverForm';
import ShipmentMessage from './Shipmentmessage';
import './Shipments.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

/* Mounted only after the password is verified */
function ShipmentsList({ onView, onForm, onDeliver, onMsg }) {
  const MSG_KIND = { RECEIVED_ORIGIN: 'RECEIVED', IN_TRANSIT: 'IN_TRANSIT', ARRIVED: 'ARRIVED' };
  const { data, loading, reload } = useData('/shipments');
  const [q, setQ] = useState('');
  const [fs, setFs] = useState('');
  const list = data.filter((s) => (!fs || s.status === fs) && includesText([s.cargoNo, s.trackingNo, s.customer?.name], q));

  const changeStatus = async (s) => {
    const opts = Object.entries(L.ship)
      .filter(([k]) => k !== 'DELIVERED')
      .map(([k, v]) => `<option value="${k}" ${k === s.status ? 'selected' : ''}>${v}</option>`).join('');
    const r = await SW.fire({
      title: `Change status of ${s.cargoNo}`,
      html: `<select id="st" class="swal2-select sn-swal-input">${opts}</select><textarea id="nt" class="swal2-textarea sn-swal-input" placeholder="Notes (optional)"></textarea>`,
      focusConfirm: false, showCancelButton: true, confirmButtonText: 'Save', cancelButtonText: 'Cancel',
      preConfirm: () => ({ status: document.getElementById('st').value, note: document.getElementById('nt').value }),
    });
    if (!r.isConfirmed) return;
    try {
      const res = await api.post(`/shipments/${s.id}/status`, r.value);
      ok('Shipment status updated');
      reload();
      // In transit / Arrived in Tanzania: offer a message to the customer
    // In transit / Arrived in Tanzania / Received at origin: offer a message to the customer
if (r.value.status !== s.status && MSG_KIND[r.value.status]) {
  onMsg({ s: { ...s, ...(res.data || {}), customer: res.data?.customer || s.customer }, kind: MSG_KIND[r.value.status] });
}
    } catch (e) { fail(e); }
  };

  return (
    <>
      <div className="list-toolbar">
        <div className="search-wrap">
          <SearchIcon />
          <input className="search" placeholder="Number, tracking or customer..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="search" value={fs} onChange={(e) => setFs(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(L.ship).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      {loading ? <Loader /> : (
        <Table
          rows={list}
          cols={[
            { h: 'Number', r: (r) => <><b>{r.cargoNo}</b><small className="sub">{r.trackingNo || ''}</small></> },
            { h: 'Customer', r: (r) => r.customer.name },
            { h: 'Mode', r: (r) => `${L.mode[r.mode]} • ${L.country[r.originCountry] || r.originCountry}` },
            { h: 'Type', r: (r) => (r.goodsType === 'HK' ? 'HK' : GOODS.NORMAL) },
            { h: 'Measurement', r: (r) => `${r.weightKg}kg / ${r.cbm}cbm` },
            { h: 'Cost', r: (r) => <><b>{money(r.chargeAmount, r.chargeCurrency)}</b><small className="sub">{money(r.chargeTzs)}</small></> },
            { h: 'Date created', r: (r) => fmtD(r.createdAt) },
            { h: 'Status', r: (r) => <Badge s={r.status} map={L.ship} /> },
            { h: 'Actions', r: (r) => (
              <div className="actions">
                <button className="btn btn-sm btn-ghost" onClick={() => onView(r.id)}>View</button>
                {r.status !== 'DELIVERED' && <button className="btn btn-sm btn-ghost" onClick={() => changeStatus(r)}>Status</button>}
                {(r.status === 'ARRIVED' || r.status === 'READY_FOR_PICKUP') && <button className="btn btn-sm btn-success" onClick={() => onDeliver(r)}>Deliver</button>}
                {r.status !== 'DELIVERED' && <button className="btn btn-sm btn-ghost" onClick={() => onForm(r)}>Edit</button>}
              </div>
            ) },
          ]}
        />
      )}
    </>
  );
}

export default function Shipments() {
  const customers = useData('/customers/options').data;// slim list: id, name, customerNo
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [deliver, setDeliver] = useState(null);
  const [msg, setMsg] = useState(null); // { s, kind } - WhatsApp message to the customer
  const [version, setVersion] = useState(0); // incremented to reload the list

  const refresh = () => setVersion((v) => v + 1);

  return (
    <div className="shipments-page">
      <PageHead title="Cargo Shipments" sub="Registration, tracking and delivery of shipments">
        <button className="btn btn-primary btn-icon" onClick={() => setForm({})}><PlusIcon /> New shipment</button>
      </PageHead>

      <ModuleGate module="shipments" label="Shipments">
        <ShipmentsList key={version} onView={setView} onForm={setForm} onDeliver={setDeliver} onMsg={setMsg} />
      </ModuleGate>

      {form && (
        <ShipmentForm
          initial={form.id ? form : null}
          customers={customers}
          onClose={() => setForm(null)}
          onSaved={(saved, created) => { setForm(null); refresh(); if (created && saved) setMsg({ s: saved, kind: 'RECEIVED' }); }}
        />
      )}
      {msg && <ShipmentMessage s={msg.s} kind={msg.kind} onClose={() => setMsg(null)} />}
      {view && <ShipmentView id={view} onClose={() => setView(null)} />}
      {deliver && <DeliverForm s={deliver} onClose={() => setDeliver(null)} onSaved={() => { setDeliver(null); refresh(); }} />}
    </div>
  );
}