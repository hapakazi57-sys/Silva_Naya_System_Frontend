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
  const msg = `Habari ${p.customer.name},\nRisiti ${p.receiptNo}\nUmelipa: ${money(p.amount, p.currency)}${p.currency !== 'TZS' ? ` (≈ ${money(p.amountTzs)})` : ''}\nTarehe: ${fmtDT(p.paidAt)}\n\nAsante. ${co?.companyName || 'SILVA NAYA COMPANY LTD'}`;
  return (
    <Modal title={`Risiti ${p.receiptNo}`} onClose={onClose}>
      <DocSheet kind="receipt" title="RISITI" no={p.receiptNo} voided={p.receiptVoided} className="receipt">
        <div className="receipt-amount">
          <small>Kiasi kilicholipwa</small>
          <b>{money(p.amount, p.currency)}</b>
          {p.currency !== 'TZS' && <span>≈ {money(p.amountTzs)} (kiwango {p.rateToTzs})</span>}
        </div>
        <div className="kv-grid">
          <Kv k="Mteja" v={p.customer.name} />
          <Kv k="Tarehe ya malipo" v={fmtDT(p.paidAt)} />
          <Kv k="Aliyepokea malipo" v={p.receivedBy?.fullName} />
        </div>
        <table className="doc-table">
          <thead><tr><th>Ankara</th><th>Sehemu</th><th>Kiasi (TZS)</th></tr></thead>
          <tbody>
            {p.allocations.map((a) => <tr key={a.id}><td>{a.invoice.invoiceNo}</td><td>{L.part[a.part]}</td><td>{money(a.amountTzs, '')}</td></tr>)}
          </tbody>
        </table>
        {p.receiptVoided && <p className="muted">Imebatilishwa na {p.voidedBy}: {p.voidReason}</p>}
      </DocSheet>
      <DocActions phone={p.customer.phone} message={msg} fileName={p.receiptNo} />
    </Modal>
  );
}