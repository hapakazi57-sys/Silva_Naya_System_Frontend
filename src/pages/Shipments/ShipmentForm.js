import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import { money, num } from '../../utils/format';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import CustomerSelect from '../../components/CustomerSelect/CustomerSelect';
import './ShipmentForm.css';

/* ---------- SVG Icons ---------- */
const Svg = ({ size = 16, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    style={{ flexShrink: 0 }} {...rest}>
    {children}
  </svg>
);
const PlaneIcon = (p) => (
  <Svg {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </Svg>
);
const ShipIcon = (p) => (
  <Svg {...p}>
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
    <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
    <path d="M12 10v4" /><path d="M12 2v3" />
  </Svg>
);
const CalculatorIcon = (p) => (
  <Svg {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
  </Svg>
);

export default function ShipmentForm({ initial, customers, onClose, onSaved }) {
  // Slim list (no lock needed) - only the fields this form uses
  const orders = useData('/orders/options').data;
  const [f, setF] = useState(initial
    ? {
      customerId: initial.customer.id, orderId: initial.purchaseOrder?.id || '', mode: initial.mode, goodsType: initial.goodsType || 'NORMAL', originCountry: initial.originCountry,
      origin: initial.origin || '', destination: initial.destination || '', trackingNo: initial.trackingNo || '', description: initial.description || '',
      packages: initial.packages, weightKg: initial.weightKg, lengthCm: initial.lengthCm, widthCm: initial.widthCm, heightCm: initial.heightCm,
      departureDate: initial.departureDate || '', expectedArrival: initial.expectedArrival || '',
    }
    : {
      customerId: '', orderId: '', mode: 'AIR', goodsType: 'NORMAL', originCountry: 'CHINA', origin: '', destination: 'Dar es Salaam, Tanzania', trackingNo: '', description: '',
      packages: 1, weightKg: '', lengthCm: '', widthCm: '', heightCm: '', departureDate: '', expectedArrival: '',
    });
  const [prev, setPrev] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const myOrders = orders.filter((o) => String(o.customer?.id) === String(f.customerId));

  const body = () => ({
    ...f,
    customerId: Number(f.customerId), orderId: num(f.orderId), packages: num(f.packages) || 1,
    weightKg: num(f.weightKg), lengthCm: num(f.lengthCm), widthCm: num(f.widthCm), heightCm: num(f.heightCm),
    departureDate: f.departureDate || null, expectedArrival: f.expectedArrival || null,
  });

  const calc = async () => {
    try { const r = await api.post('/shipments/calc', body()); setPrev(r.data); } catch (e) { fail(e); }
  };
  const save = async (e) => {
    e.preventDefault();
    try {
      const res = initial ? await api.put(`/shipments/${initial.id}`, body()) : await api.post('/shipments', body());
      ok(initial ? 'Shipment updated' : 'Shipment registered');
      onSaved(res.data, !initial);
    } catch (err) { fail(err); }
  };

  return (
    <Modal title={initial ? `Edit shipment ${initial.cargoNo}` : 'Register new shipment'} onClose={onClose} wide>
      <form className="form-grid" onSubmit={save}>
        <Field label="Customer *"><CustomerSelect customers={customers} value={f.customerId} onChange={set('customerId')} /></Field>
        <Field label="Purchase order (optional)">
          <select value={f.orderId} onChange={set('orderId')}>
            <option value="">-- None --</option>
            {myOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNo} - {o.supplierName}</option>)}
          </select>
        </Field>
        <Field label="Shipping mode">
          <div className="mode-select">
            {f.mode === 'AIR' ? <PlaneIcon /> : <ShipIcon />}
            <select value={f.mode} onChange={set('mode')}>
              <option value="AIR">Air</option>
              <option value="SEA">Sea</option>
            </select>
          </div>
        </Field>
        <Field label="Goods type">
          <select value={f.goodsType} onChange={set('goodsType')}>
            <option value="NORMAL">Normal Goods (clothes and regular items)</option>
            <option value="HK">HK - Hong Kong Goods (chemicals, batteries, etc.)</option>
          </select>
        </Field>
        <Field label="Origin country">
          <select value={f.originCountry} onChange={set('originCountry')}><option value="CHINA">China</option><option value="DUBAI">Dubai</option></select>
        </Field>
        <Field label="Place of origin"><input value={f.origin} onChange={set('origin')} placeholder="e.g. Guangzhou" /></Field>
        <Field label="Destination"><input value={f.destination} onChange={set('destination')} /></Field>
        <Field label="Tracking number"><input value={f.trackingNo} onChange={set('trackingNo')} /></Field>
        <Field label="Number of packages"><input type="number" min="1" value={f.packages} onChange={set('packages')} /></Field>
        <Field label="Shipment description" full><input value={f.description} onChange={set('description')} /></Field>
        <Field label="Weight (kg)"><input type="number" step="0.01" min="0" value={f.weightKg} onChange={set('weightKg')} /></Field>
        <Field label="Length (cm)"><input type="number" step="0.1" min="0" value={f.lengthCm} onChange={set('lengthCm')} /></Field>
        <Field label="Width (cm)"><input type="number" step="0.1" min="0" value={f.widthCm} onChange={set('widthCm')} /></Field>
        <Field label="Height (cm)"><input type="number" step="0.1" min="0" value={f.heightCm} onChange={set('heightCm')} /></Field>
        <Field label="Departure date"><input type="date" value={f.departureDate} onChange={set('departureDate')} /></Field>
        <Field label="Expected arrival"><input type="date" value={f.expectedArrival} onChange={set('expectedArrival')} /></Field>

        <div className="full calc-box">
          <button type="button" className="btn btn-sm btn-ghost btn-icon" onClick={calc}>
            <CalculatorIcon size={14} /> Calculate cost
          </button>
          {prev && (
            <div className="calc-res">
              <span>CBM: <b>{prev.cbm}</b></span>
              <span>Chargeable weight: <b>{prev.chargeableKg} kg</b></span>
              <span>Cost: <b>{money(prev.amount, prev.currency)}</b></span>
              <span>≈ <b>{money(prev.amountTzs)}</b></span>
            </div>
          )}
        </div>

        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save shipment</button>
        </div>
      </form>
    </Modal>
  );
}