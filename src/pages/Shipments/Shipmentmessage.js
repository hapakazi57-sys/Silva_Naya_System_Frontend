import React, { useState } from 'react';
import { waLink } from '../../utils/format';
import useCompany from '../../hooks/Usecompany';
import Modal from '../../components/Modal/Modal';
import './Shipmentmessage.css';

const TITLES = {
  RECEIVED_ORIGIN: 'Received at origin: notify the customer',
  IN_TRANSIT: 'Cargo in transit: notify the customer',
  ARRIVED: 'Arrived in Tanzania: notify the customer',
};

/* Ready-to-send WhatsApp message. The text can be edited before sending. */
function template(kind, s, company) {
  const name = s.customer?.name || 'customer';
  const ref = `${s.cargoNo}${s.description ? ` (${s.description})` : ''}`;
  const track = s.trackingNo ? `\nTracking number: ${s.trackingNo}` : '';
  const sign = `\n\nThank you,\n${company}`;
  if (kind === 'IN_TRANSIT') {
    const eta = s.expectedArrival ? `\nExpected arrival: ${s.expectedArrival}` : '';
    return `Hello ${name},\n\nYour cargo ${ref} is now in transit and on its way to Tanzania.${track}${eta}\n\nWe will let you know as soon as it arrives.${sign}`;
  }
  if (kind === 'ARRIVED') {
    return `Hello ${name},\n\nGood news! Your cargo ${ref} has arrived in Tanzania and is ready for pick-up.${track}\n\nPlease contact us to arrange collection.${sign}`;
  }
  if (kind === 'RECEIVED_ORIGIN') {
  const origin = s.origin ? ` in ${s.origin}` : '';
  return `Hello ${name},\n\nYour cargo ${ref} has been received at our warehouse${origin}.${track}\n\nWe will let you know when it is on its way to Tanzania.${sign}`;
}
  return `Hello ${name},\n\nYour cargo ${ref} has been received at ${company}.${track}\n\nWe will keep you updated on its progress.${sign}`;
}

export default function ShipmentMessage({ s, kind, onClose }) {
  const co = useCompany();
  const company = co?.companyName || 'SILVA NAYA COMPANY LTD';
  const [text, setText] = useState(() => template(kind, s, company));
  const href = `${s.customer?.phone ? waLink(s.customer.phone) : 'https://wa.me/'}?text=${encodeURIComponent(text)}`;

  return (
    <Modal title={TITLES[kind]} onClose={onClose}>
      <div className="ship-msg">
        <div className="ship-msg-to">
          <small>To</small>
          <b>{s.customer?.name}</b>
          <span>{s.customer?.phone || 'No phone number saved'}</span>
        </div>
        <label className="ship-msg-label">Message (you can edit it before sending)</label>
        <textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="form-foot ship-msg-foot">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Skip</button>
          <a className="btn btn-primary" href={href} target="_blank" rel="noreferrer" onClick={() => setTimeout(onClose, 300)}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5A8.5 8.5 0 1 1 21 11.5z" /></svg>
            Send via WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  );
}