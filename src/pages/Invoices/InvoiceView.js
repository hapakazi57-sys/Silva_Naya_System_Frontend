import React from 'react';
import { money, fmtD } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import DocSheet from '../../components/DocSheet/DocSheet';
import DocActions from '../../components/DocActions/Docactions';
import useCompany from '../../hooks/Usecompany';
import './InvoiceView.css';

export default function InvoiceView({ inv, onClose }) {
  const co = useCompany();
  const msg = `Hello ${inv.customer.name},\nInvoice ${inv.invoiceNo}\nTotal: ${money(inv.total)}\nPaid: ${money(inv.paid)}\nBalance: ${money(inv.balance)}\nDue date: ${fmtD(inv.dueDate)}\n\n${co?.companyName || 'SILVA NAYA COMPANY LTD'}`;
  return (
    <Modal title={`Invoice ${inv.invoiceNo}`} onClose={onClose} wide>
      <DocSheet kind="invoice" title="INVOICE" note={inv.createdBy?.fullName ? `Issued by: ${inv.createdBy.fullName}` : ''} no={inv.invoiceNo} voided={inv.voided} className="invoice-doc">
        <div className="doc-meta">
          <div><small>Customer</small><b>{inv.customer.name}</b><p>{inv.customer.phone}</p><p>{inv.customer.address}</p></div>
          <div><small>Invoice date</small><b>{fmtD(inv.issueDate)}</b><small>Due date</small><b>{fmtD(inv.dueDate)}</b></div>
          <div><small>Type</small><b>{L.itype[inv.type]}</b><small>Status</small><b>{L.pay[inv.status]}</b></div>
        </div>
        <table className="doc-table">
          <thead><tr><th>Description</th><th>Amount (TZS)</th><th>Paid</th><th>Balance</th></tr></thead>
          <tbody>
            {inv.purchaseOrder && (
              <tr>
                <td>Purchase of goods • {inv.purchaseOrder.orderNo} ({inv.purchaseOrder.supplierName})</td>
                <td>{money(inv.purchaseAmount, '')}</td><td>{money(inv.purchasePaid, '')}</td><td>{money(inv.purchaseBalance, '')}</td>
              </tr>
            )}
            {inv.shipment && (
              <tr>
                <td>Shipping • {inv.shipment.cargoNo} ({L.mode[inv.shipment.mode]}, {inv.shipment.chargeableKg}kg / {inv.shipment.cbm}cbm)</td>
                <td>{money(inv.shippingAmount, '')}</td><td>{money(inv.shippingPaid, '')}</td><td>{money(inv.shippingBalance, '')}</td>
              </tr>
            )}
          </tbody>
          <tfoot><tr><td>TOTAL</td><td>{money(inv.total, '')}</td><td>{money(inv.paid, '')}</td><td>{money(inv.balance, '')}</td></tr></tfoot>
        </table>
        {inv.voided && <p className="muted void-reason">Reason for voiding: {inv.voidReason}</p>}
      </DocSheet>
      <DocActions phone={inv.customer.phone} message={msg} fileName={inv.invoiceNo} />
    </Modal>
  );
}