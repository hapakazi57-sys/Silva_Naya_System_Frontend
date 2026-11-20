import React, { useState } from 'react';
import useCompany from '../../hooks/Usecompany';
import './DocSheet.css';

/* Karatasi ya kuchapisha (ankara / risiti). Kichwa, nembo, kichwa cha hati, maelezo ya chini,
   masharti na saini vinatoka kwenye Mipangilio ya Kampuni (Msimamizi). kind = 'invoice' | 'receipt' */
export default function DocSheet({ kind, title, no, voided, note, className = '', children }) {
  const co = useCompany();
  const [broken, setBroken] = useState(false);
  const inv = kind === 'invoice';
  const name = co?.companyName || 'SILVA NAYA COMPANY LTD';
  const heading = (inv ? co?.invoiceTitle : co?.receiptTitle) || title;
  const showLogo = co ? (inv ? co.invoiceShowLogo : co.receiptShowLogo) : true;
  const footer = co ? (inv ? co.invoiceFooter : co.receiptFooter) : '';
  const contact = [co?.address, co?.phone, co?.email].filter(Boolean).join(' • ');

  return (
    <div className={`print-area doc ${className}`}>
      <div className="doc-head" style={co?.accentColor ? { borderBottomColor: co.accentColor } : undefined}>
        <div className="doc-brand">
          {showLogo && (!broken
            ? <img className="doc-logo" src={co?.logoData || `${process.env.PUBLIC_URL}/assets/logo.jpg`} alt="" onError={() => setBroken(true)} />
            : <div className="logo">{name.slice(0, 2).toUpperCase()}</div>)}
          <div>
            <h2>{name}</h2>
            {contact && <p>{contact}</p>}
          </div>
        </div>
        <div className="doc-title"><h1 style={co?.accentColor ? { color: co.accentColor } : undefined}>{heading}</h1><b>{no}</b></div>
      </div>
      {voided && <div className="stamp">VOIDED</div>}
      {children}
      {inv && co?.invoiceTerms && <div className="doc-terms"><b>Terms</b><p>{co.invoiceTerms}</p></div>}
      {(note || footer) && <p className="doc-foot">{[note, footer].filter(Boolean).join(' • ')}</p>}
    </div>
  );
}