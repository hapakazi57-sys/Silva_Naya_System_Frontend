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
  const sign = `\n\nThank you for choosing,\n${company}`;
  if (kind === 'IN_TRANSIT') {
    const eta = s.expectedArrival ? `\nTarehe inayotarajiwa kuwasili: ${s.expectedArrival}` : '';
    return `Habari ${name},\n\nMzigo wako ${ref} kwa sasa unaanza safari kuelekea Tanzania.${track}${eta}\n\nTutatakujuilisha mara tu mzigo wako utakapofika.${sign}`;
  }
  if (kind === 'ARRIVED') {
    return `Habari ${name},\n\nHabari njema! Mzigo wako ${ref} umewasili Tanzania na sasa upo tayari kuchukuliwa.${track}\n\nTafadhali fika offisini kwetu.${sign}`;
  }
  if (kind === 'RECEIVED_ORIGIN') {
  const origin = s.origin ? ` in ${s.origin}` : '';
  return `Habari ${name},\n\nMzigo wako ${ref} umpokelewa katika${origin}.${track}\n\nTutatakujuilisha wakati unapotaka kusafiri kwenda Tanzania .${sign}`;
}
  return `Habari ${name},\n\nMzigo wako${ref} umepokelewa katika ${company}.${track}\n\nTutakujuilisha kwa kila hatua za safari ya mzigo wako.${sign}`;
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