import React from 'react';
import { money, fmtDT } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import DocSheet from '../../components/DocSheet/DocSheet';
import DocActions from '../../components/DocActions/Docactions';
import useCompany from '../../hooks/Usecompany';
import Kv from '../../components/Kv/Kv';
import './ReceiptView.css';

export default function ReceiptView({ p, onClose }) {
  const co = useCompany();
  const msg = `Hello ${p.customer.name},\nReceipt ${p.receiptNo}\nYou paid: ${money(p.amount, p.currency)}${p.currency !== 'TZS' ? ` (≈ ${money(p.amountTzs)})` : ''}\nDate: ${fmtDT(p.paidAt)}\n\nThank you. ${co?.companyName || 'SILVA NAYA COMPANY LTD'}`;
  return (
    <Modal title={`Receipt ${p.receiptNo}`} onClose={onClose}>
      <DocSheet kind="receipt" title="PAYMENT RECEIPT" no={p.receiptNo} voided={p.receiptVoided} className="receipt">
        <div className="receipt-amount">
          <small>Amount paid</small>
          <b>{money(p.amount, p.currency)}</b>
          {p.currency !== 'TZS' && <span>≈ {money(p.amountTzs)} (rate {p.rateToTzs})</span>}
        </div>
        <div className="kv-grid">
          <Kv k="Customer" v={p.customer.name} />
          <Kv k="Payment date" v={fmtDT(p.paidAt)} />
          <Kv k="Received by" v={p.receivedBy?.fullName} />
        </div>
        <table className="doc-table">
          <thead><tr><th>Invoice</th><th>Part</th><th>Amount (TZS)</th></tr></thead>
          <tbody>
            {p.allocations.map((a) => <tr key={a.id}><td>{a.invoice.invoiceNo}</td><td>{L.part[a.part]}</td><td>{money(a.amountTzs, '')}</td></tr>)}
          </tbody>
        </table>
        {p.receiptVoided && <p className="muted">Voided by {p.voidedBy}: {p.voidReason}</p>}
      </DocSheet>
      <DocActions phone={p.customer.phone} message={msg} fileName={p.receiptNo} />
    </Modal>
  );
}