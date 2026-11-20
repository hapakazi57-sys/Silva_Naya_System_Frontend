import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail, warn, confirmBox } from '../../utils/alerts';
import { refreshCompany } from '../../hooks/Usecompany';
import PageHead from '../../components/PageHead/PageHead';
import Field from '../../components/Field/Field';
import Loader from '../../components/Loader/Loader';
import ModuleLockSettings from './ModuleLockSettings';
import './Settings.css';

const TABS = [
  ['company', 'Company'],
  ['currency', 'Currency & Time'],
  ['invoice', 'Invoice Layout'],
  ['receipt', 'Receipt Layout'],
  ['numbers', 'Numbering'],
  ['security', 'Security'],
];

const ZONES = ['Africa/Dar_es_Salaam', 'Africa/Nairobi', 'Africa/Kampala', 'Africa/Kigali', 'Africa/Lusaka', 'Africa/Johannesburg',
  'Africa/Cairo', 'Asia/Dubai', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Kolkata', 'Europe/London', 'UTC'];

/* Logo images are scaled down to 256px to keep them light (SVG is kept as is) */
function readLogo(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Choose an image file (PNG, JPG, WEBP or SVG)'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error('Image is too large (max 2MB)'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image'));
    reader.onload = () => {
      if (file.type === 'image/svg+xml') {
        return reader.result.length > 300000 ? reject(new Error('SVG is too large')) : resolve(reader.result);
      }
      const img = new Image();
      img.onerror = () => reject(new Error('The image cannot be read'));
      img.onload = () => {
        const k = Math.min(1, 256 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/png'));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* Live preview of an invoice or receipt */
function Preview({ f, kind }) {
  const inv = kind === 'invoice';
  const show = inv ? f.invoiceShowLogo : f.receiptShowLogo;
  const footer = inv ? f.invoiceFooter : f.receiptFooter;
  return (
    <div className="st-doc">
      <div className="st-doc-head" style={{ borderBottomColor: f.accentColor || undefined }}>
        <div className="st-doc-brand">
          {show && (f.logoData ? <img src={f.logoData} alt="" /> : <span className="st-doc-sn">{(f.companyName || 'SN').slice(0, 2).toUpperCase()}</span>)}
          <div><b>{f.companyName || '—'}</b><small>{[f.address, f.phone, f.email].filter(Boolean).join(' • ')}</small></div>
        </div>
        <div className="st-doc-title"><b style={{ color: f.accentColor || undefined }}>{(inv ? f.invoiceTitle : f.receiptTitle) || (inv ? 'INVOICE' : 'RECEIPT')}</b><small>{(inv ? f.invoicePrefix : f.receiptPrefix)}-…</small></div>
      </div>
      <div className="st-doc-lines"><i /><i /><i className="short" /></div>
      {inv && f.invoiceTerms && <div className="st-doc-terms"><b>Terms</b>{f.invoiceTerms}</div>}
      {footer && <div className="st-doc-foot">{footer}</div>}
    </div>
  );
}

export default function Settings({ me }) {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState('');
  const [tab, setTab] = useState('company');
  const [busy, setBusy] = useState(false);
  const [cur, setCur] = useState('');
  const [now, setNow] = useState(new Date());
  const fileRef = useRef(null);
  const admin = me.role === 'ADMIN';

  useEffect(() => {
    if (!admin) return;
    api.get('/settings').then((r) => { setForm(r.data); setSaved(JSON.stringify(r.data)); }).catch(fail);
  }, [admin]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dirty = useMemo(() => form && JSON.stringify(form) !== saved, [form, saved]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (!admin) return <div className="settings-page"><PageHead title="Company Settings" sub="Only the System Administrator is allowed" /></div>;
  if (!form) return <Loader />;

  const currencies = (form.currencies || '').split(',').filter(Boolean);
  const zones = ZONES.includes(form.timezone) ? ZONES : [form.timezone, ...ZONES];
  let clock = '-';
  try { clock = now.toLocaleString('en-GB', { timeZone: form.timezone, dateStyle: 'full', timeStyle: 'medium' }); } catch (e) { clock = 'Invalid time zone'; }
  const year = new Date().getFullYear();
  const digits = Math.min(10, Math.max(3, Number(form.numberPadding) || 5));
  const sep = form.numberSeparator || '';
  const example = (p) => `${p || '…'}${sep}${form.numberIncludeYear ? `${year}${sep}` : ''}${'1'.padStart(digits, '0')}`;

  const pickLogo = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try { const data = await readLogo(file); setForm((f) => ({ ...f, logoData: data })); } catch (err) { warn('Logo not accepted', err.message); }
  };

  const addCurrency = () => {
    const c = cur.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) return warn('Invalid currency', 'Use 3 letters, e.g. USD, CNY, AED');
    if (currencies.includes(c)) return warn('This currency is already in the list');
    setForm((f) => ({ ...f, currencies: [...currencies, c].join(',') }));
    setCur('');
  };
  const dropCurrency = (c) => setForm((f) => ({ ...f, currencies: currencies.filter((x) => x !== c).join(',') }));
  const setBase = (e) => {
    const base = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setForm((f) => ({ ...f, baseCurrency: base, currencies: base.length === 3 && !currencies.includes(base) ? [base, ...currencies].join(',') : f.currencies }));
  };

  const save = async () => {
    if (!form.companyName.trim()) { setTab('company'); return warn('Company name is required'); }
    const go = await confirmBox('Save settings?', 'The changes will appear on all invoices and receipts printed from now on.', 'Yes, save');
    if (!go) return;
    setBusy(true);
    try {
      const r = await api.put('/settings', form);
      setForm(r.data); setSaved(JSON.stringify(r.data));
      await refreshCompany();
      ok('Settings saved');
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const prefix = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }));

  return (
    <div className="settings-page">
      <PageHead title="Company Settings" sub="Company details, currency, time, invoice/receipt layout, numbering and security" />

      <div className="st-tabs">
        {TABS.map(([k, label]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
      </div>

      {tab === 'company' && (
        <div className="st-card">
          <div className="st-logo">
            <div className="st-logo-box">{form.logoData ? <img src={form.logoData} alt="Logo" /> : <span>{(form.companyName || 'SN').slice(0, 2).toUpperCase()}</span>}</div>
            <div>
              <b>Company logo</b>
              <p>PNG, JPG, WEBP or SVG. Shown on invoices and receipts.</p>
              <div className="st-row">
                <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>Choose image</button>
                {form.logoData && <button className="btn btn-danger btn-sm" onClick={() => setForm((f) => ({ ...f, logoData: '' }))}>Remove</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickLogo} />
            </div>
          </div>
          <div className="st-grid">
            <Field label="Company name" full><input value={form.companyName || ''} onChange={set('companyName')} /></Field>
            <Field label="Address" full><input value={form.address || ''} onChange={set('address')} placeholder="e.g. Kariakoo, Dar es Salaam" /></Field>
            <Field label="Phone number"><input value={form.phone || ''} onChange={set('phone')} placeholder="+255 ..." /></Field>
            <Field label="Email"><input type="email" value={form.email || ''} onChange={set('email')} placeholder="info@company.co.tz" /></Field>
          </div>
        </div>
      )}

      {tab === 'currency' && (
        <div className="st-card">
          <div className="st-grid">
            <Field label="Base currency (3 letters)"><input value={form.baseCurrency || ''} onChange={setBase} maxLength={3} /></Field>
            <Field label="Official system time zone">
              <select value={form.timezone} onChange={set('timezone')}>{zones.map((z) => <option key={z} value={z}>{z}</option>)}</select>
            </Field>
          </div>
          <div className="st-clock"><small>Current time in this zone</small><b>{clock}</b></div>
          <p className="st-hint">Reports and default dates follow this time zone. Invoice and payment calculations are still done in TZS; exchange rates are set on the Rates & Currencies page.</p>

          <b className="st-sub">Currencies in use</b>
          <div className="st-chips">
            {currencies.map((c) => (
              <span key={c} className={`st-chip ${c === form.baseCurrency ? 'base' : ''}`}>
                {c}{c === form.baseCurrency ? ' • base' : <button title="Remove" onClick={() => dropCurrency(c)}>×</button>}
              </span>
            ))}
          </div>
          <div className="st-row">
            <input className="st-cur-in" value={cur} maxLength={3} placeholder="USD" onChange={(e) => setCur(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') addCurrency(); }} />
            <button className="btn btn-ghost" onClick={addCurrency}>Add currency</button>
          </div>
        </div>
      )}

      {(tab === 'invoice' || tab === 'receipt') && (
        <div className="st-split">
          <div className="st-card">
            {tab === 'invoice' ? (
              <div className="st-grid">
                <Field label="Document title"><input value={form.invoiceTitle || ''} onChange={set('invoiceTitle')} /></Field>
                <Field label="Accent color"><input type="color" value={form.accentColor || '#0b5fff'} onChange={set('accentColor')} /></Field>
                <label className="st-check"><input type="checkbox" checked={!!form.invoiceShowLogo} onChange={set('invoiceShowLogo')} /> Show logo</label>
                <Field label="Footer text" full><textarea rows={2} maxLength={600} value={form.invoiceFooter || ''} onChange={set('invoiceFooter')} /></Field>
                <Field label="Payment terms / bank details" full><textarea rows={4} maxLength={1200} value={form.invoiceTerms || ''} onChange={set('invoiceTerms')} placeholder="e.g. Pay within 7 days. Bank: ..." /></Field>
              </div>
            ) : (
              <div className="st-grid">
                <Field label="Document title"><input value={form.receiptTitle || ''} onChange={set('receiptTitle')} /></Field>
                <Field label="Accent color"><input type="color" value={form.accentColor || '#0b5fff'} onChange={set('accentColor')} /></Field>
                <label className="st-check"><input type="checkbox" checked={!!form.receiptShowLogo} onChange={set('receiptShowLogo')} /> Show logo</label>
                <Field label="Footer text" full><textarea rows={3} maxLength={600} value={form.receiptFooter || ''} onChange={set('receiptFooter')} /></Field>
              </div>
            )}
          </div>
          <div><small className="st-prev-label">Preview</small><Preview f={form} kind={tab} /></div>
        </div>
      )}

      {tab === 'numbers' && (
        <div className="st-card">
          <div className="st-grid four">
            <Field label="Invoice prefix"><input value={form.invoicePrefix || ''} maxLength={6} onChange={prefix('invoicePrefix')} /></Field>
            <Field label="Receipt prefix"><input value={form.receiptPrefix || ''} maxLength={6} onChange={prefix('receiptPrefix')} /></Field>
            <Field label="Transaction prefix"><input value={form.transactionPrefix || ''} maxLength={6} onChange={prefix('transactionPrefix')} /></Field>
            <Field label="Separator">
              <select value={form.numberSeparator ?? '-'} onChange={set('numberSeparator')}><option value="-">Dash ( - )</option><option value="/">Slash ( / )</option><option value="_">Underscore ( _ )</option><option value="">None</option></select>
            </Field>
            <Field label="Number of digits (3-10)"><input type="number" min={3} max={10} value={form.numberPadding} onChange={set('numberPadding')} /></Field>
            <label className="st-check"><input type="checkbox" checked={!!form.numberIncludeYear} onChange={set('numberIncludeYear')} /> Include the year in numbers</label>
          </div>
          <b className="st-sub">Examples of the next numbers</b>
          <div className="st-examples">
            <div><small>Invoice</small><b>{example((form.invoicePrefix || '').toUpperCase())}</b></div>
            <div><small>Receipt</small><b>{example((form.receiptPrefix || '').toUpperCase())}</b></div>
            <div><small>Transaction</small><b>{example((form.transactionPrefix || '').toUpperCase())}</b></div>
          </div>
          <p className="st-hint">Numbers already issued are not changed. Changes only affect new numbers.</p>
        </div>
      )}

      {tab === 'security' && (
        <div className="st-card">
          <b className="st-sub" style={{ marginTop: 0 }}>Menu passwords</b>
          <ModuleLockSettings />
        </div>
      )}

      {tab !== 'security' && (
        <div className={`st-save ${dirty ? 'show' : ''}`}>
          <span>You have unsaved changes</span>
          <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setForm(JSON.parse(saved))}>Discard</button>
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save changes'}</button>
        </div>
      )}
    </div>
  );
}