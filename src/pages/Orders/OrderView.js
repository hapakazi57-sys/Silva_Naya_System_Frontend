import React from 'react';
import { money } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Table from '../../components/Table/Table';
import Badge from '../../components/Badge/Badge';
import Kv from '../../components/Kv/Kv';
import './OrderView.css';

export default function OrderView({ o, onClose }) {
  return (
    <Modal title={`Oda ${o.orderNo}`} onClose={onClose} wide>
      <div className="print-area order-view">
        <div className="kv-grid">
          <Kv k="Customer" v={o.customer.name} />
          <Kv k="Country" v={L.country[o.country]} />
          <Kv k="Supplier" v={o.supplierName} />
          <Kv k="Status" v={<Badge s={o.status} map={L.order} />} />
          <Kv k="Created By" v={o.createdBy?.fullName} />
          <Kv k="Approved By" v={o.approvedBy?.fullName} />
          <Kv k="Actual Cost of Purchase" v={o.actualCost != null ? money(o.actualCost, o.currency) : 'Not recorded'} />
        </div>
        {o.managerNote && <div className="note-box">💬 Manager's Notes: {o.managerNote}</div>}
        <Table rows={o.items} cols={[
          { h: 'Product', r: (r) => r.name }, { h: 'Description', r: (r) => r.description || '-' }, { h: 'Quantity', r: (r) => r.quantity },
          { h: 'Unit Price', r: (r) => money(r.unitPrice, o.currency) }, { h: 'Total', r: (r) => money(r.lineTotal, o.currency) },
        ]} />
        <div className="total-line">Grand Total: <b>{money(o.totalAmount, o.currency)}</b></div>
      </div>
      <div className="form-foot no-print"><button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Print</button></div>
    </Modal>
  );
}
