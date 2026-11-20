import React from 'react';
import { money, fmtDT, waLink } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Kv from '../../components/Kv/Kv';
import './CustomerView.css';

export default function CustomerView({ s, onClose }) {
  const c = s.customer;
  return (
    <Modal title={`${c.name} • ${c.customerNo}`} onClose={onClose} wide>
      <div className="customer-view">
        <div className="kv-grid">
          <Kv k="Simu" v={c.phone} />
          <Kv k="Barua pepe" v={c.email} />
          <Kv k="Anwani" v={c.address} />
          <Kv k="Jumla iliyolipwa" v={money(s.totalPaid)} />
          <Kv k="Deni la sasa" v={<span className={s.debt > 0 ? 'txt-red' : 'txt-green'}>{money(s.debt)}</span>} />
        </div>
        <a className="btn btn-wa" href={waLink(c.phone)} target="_blank" rel="noreferrer">💬 Contact WhatsApp</a>

        <h4>Purchase Orders ({s.orders.length})</h4>
        <Table rows={s.orders} cols={[
          { h: 'Order Number', r: (r) => r.orderNo }, { h: 'Supplier', r: (r) => r.supplierName },
          { h: 'Total', r: (r) => money(r.totalAmount, r.currency) }, { h: 'Status', r: (r) => <Badge s={r.status} map={L.order} /> },
        ]} />

        <h4>Shipments ({s.shipments.length})</h4>
        <Table rows={s.shipments} cols={[
          { h: 'Order Number', r: (r) => r.cargoNo }, { h: 'Mode', r: (r) => L.mode[r.mode] },
          { h: 'Charge', r: (r) => money(r.chargeTzs) }, { h: 'Status', r: (r) => <Badge s={r.status} map={L.ship} /> },
        ]} />

        <h4>Invoices ({s.invoices.length})</h4>
        <Table rows={s.invoices} cols={[
          { h: 'Order Number', r: (r) => r.invoiceNo }, { h: 'Total', r: (r) => money(r.total) }, { h: 'Balance', r: (r) => money(r.balance) },
          { h: 'Status', r: (r) => (r.voided ? <Badge tone="dark">Rejected</Badge> : <Badge s={r.status} map={L.pay} />) },
        ]} />

        <h4>Payments ({s.payments.length})</h4>
        <Table rows={s.payments} cols={[
          { h: 'Receipt', r: (r) => r.receiptNo }, { h: 'Date', r: (r) => fmtDT(r.paidAt) },
          { h: 'Amount', r: (r) => money(r.amount, r.currency) }, { h: 'TZS', r: (r) => money(r.amountTzs) },
        ]} />
      </div>
    </Modal>
  );
}
