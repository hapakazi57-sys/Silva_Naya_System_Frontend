import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail } from '../../utils/alerts';
import useCompany from '../../hooks/Usecompany';
import PageHead from '../../components/PageHead/PageHead';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import Loader from '../../components/Loader/Loader';
import './Reports.css';

/* ---------- SVG Icons ---------- */
const Svg = ({ size = 16, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>{children}</svg>
);
const PlusIcon = () => (<Svg><path d="M12 5v14" /><path d="M5 12h14" /></Svg>);
const PrevIcon = () => (<Svg><path d="m15 18-6-6 6-6" /></Svg>);
const NextIcon = () => (<Svg><path d="m9 18 6-6-6-6" /></Svg>);
const PrintIcon = () => (<Svg><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 9V3h12v6" /><rect x="6" y="14" width="12" height="8" rx="1" /></Svg>);
const SheetIcon = () => (<Svg><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" /></Svg>);

/* Keys MUST match the backend: overview | revenue | expenses | debts | customers | employees | shipments */
const TYPES = [
  ['overview', 'Overview'], ['revenue', 'Revenue'], ['expenses', 'Expenses'], ['debts', 'Debts'],
  ['customers', 'Customers'], ['employees', 'Employees'], ['shipments', 'Shipments'],
];
const PERIODS = [['week', 'Week'], ['month', 'Month'], ['year', 'Year'], ['custom', 'Custom']];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CATEGORIES = ['Rent', 'Salaries', 'Transport', 'Office', 'Electricity & Water', 'Communication', 'Advertising', 'Other'];

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nice = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(s || '')) return s || '-';
  const [y, m, d] = String(s).slice(0, 10).split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};
const nf = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toNum = (v) => { const n = Number(String(v ?? 0).replace(/,/g, '')); return Number.isNaN(n) ? 0 : n; };
const stamp = (s) => String(s || '').replace('T', ' ').slice(0, 16);

/* Week starts on Monday; month and year are full */
function rangeOf(kind, a) {
  if (kind === 'week') {
    const s = new Date(a.getFullYear(), a.getMonth(), a.getDate() - ((a.getDay() + 6) % 7));
    return [s, new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6)];
  }
  if (kind === 'month') return [new Date(a.getFullYear(), a.getMonth(), 1), new Date(a.getFullYear(), a.getMonth() + 1, 0)];
  return [new Date(a.getFullYear(), 0, 1), new Date(a.getFullYear(), 11, 31)];
}
function shiftBy(kind, a, dir) {
  if (kind === 'week') return new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7 * dir);
  if (kind === 'month') return new Date(a.getFullYear(), a.getMonth() + dir, 1);
  return new Date(a.getFullYear() + dir, 0, 1);
}

/* Rows are arrays: the value for a column is row[columnIndex] */
const isNum = (c) => c.type === 'money' || c.type === 'number';
const cell = (c, v) => {
  if (v === null || v === undefined || v === '') return '-';
  if (c.type === 'money') return nf(v);
  if (c.type === 'number') return toNum(v).toLocaleString('en-US');
  if (c.type === 'date') return nice(v);
  return String(v);
};
const alignOf = (c) => c.align || (isNum(c) ? 'right' : 'left');

function ExpenseForm({ onClose, onSaved }) {
  const [f, setF] = useState({ category: '', description: '', amount: '', expenseDate: ymd(new Date()), paidTo: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/expenses', { ...f, amount: Number(f.amount) });
      ok('Expense saved');
      onSaved();
    } catch (err) { fail(err); } finally { setBusy(false); }
  };
  return (
    <Modal title="Add expense" onClose={onClose}>
      <form className="rp-form" onSubmit={submit}>
        <Field label="Category"><input required list="rp-cats" value={f.category} onChange={set('category')} placeholder="Choose or type" /></Field>
        <datalist id="rp-cats">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
        <Field label="Description"><input required value={f.description} onChange={set('description')} /></Field>
        <div className="rp-form-2">
          <Field label="Amount (TZS)"><input required type="number" min="0.01" step="0.01" value={f.amount} onChange={set('amount')} /></Field>
          <Field label="Date"><input required type="date" value={f.expenseDate} onChange={set('expenseDate')} /></Field>
        </div>
        <Field label="Paid to (optional)"><input value={f.paidTo} onChange={set('paidTo')} /></Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
      </form>
    </Modal>
  );
}

export default function Reports({ me }) {
  const co = useCompany();
  const allowed = me && (me.role === 'ADMIN' || me.role === 'MANAGER');
  const [type, setType] = useState('overview');
  const [kind, setKind] = useState('month');
  const [anchor, setAnchor] = useState(new Date());
  const [custom, setCustom] = useState({ from: ymd(new Date(new Date().getFullYear(), new Date().getMonth(), 1)), to: ymd(new Date()) });
  const [rep, setRep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  const [fromD, toD] = kind === 'custom' ? [null, null] : rangeOf(kind, anchor);
  const from = kind === 'custom' ? custom.from : ymd(fromD);
  const to = kind === 'custom' ? custom.to : ymd(toD);
  const valid = from && to && from <= to;

  useEffect(() => {
    if (!allowed || !valid) return undefined;
    let live = true;
    setLoading(true);
    // period=custom + from/to: the page computes the exact range for week, month and year itself
    api.get(`/reports/${type}`, { params: { period: 'custom', from, to } })
      .then((r) => { if (live) setRep(r.data); })
      .catch((e) => { if (live) { setRep(null); fail(e); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [allowed, type, from, to, valid, tick]);

  const label = kind === 'week' ? `${nice(from)} – ${nice(to)}`
    : kind === 'month' ? `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
      : kind === 'year' ? `Year ${anchor.getFullYear()}` : `${nice(from)} – ${nice(to)}`;

  const toExcel = async () => {
    if (!rep) return;
    try {
      const XLSX = await import('xlsx');
      const aoa = [
        [co?.companyName || ''], [rep.title], [`Period: ${nice(rep.from)} - ${nice(rep.to)}`],
        [`Generated: ${stamp(rep.generatedAt)} by ${rep.generatedBy}`], [],
      ];
      (rep.summary || []).forEach((s) => aoa.push([s.label, s.value]));
      aoa.push([]);
      aoa.push(rep.columns.map((c) => c.label));
      (rep.rows || []).forEach((r) => aoa.push(rep.columns.map((c, i) => (isNum(c) ? toNum(r[i]) : (r[i] ?? '')))));
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws['!cols'] = rep.columns.map((c) => ({ wch: Math.max(14, c.label.length + 4) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `report_${rep.type}_${rep.from}_${rep.to}.xlsx`);
      ok('Excel downloaded');
    } catch (e) { fail(e); }
  };

  if (!allowed) {
    return <div className="reports-page"><PageHead title="Reports" sub="Only managers and administrators can view reports" /></div>;
  }

  return (
    <div className="reports-page">
      <PageHead title="Reports" sub="Generate, view, print or download company reports">
        {type === 'expenses' && <button className="btn btn-primary btn-icon" onClick={() => setAddOpen(true)}><PlusIcon /> Add expense</button>}
      </PageHead>

      <div className="rp-tabs no-print">
        {TYPES.map(([k, t]) => <button key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>{t}</button>)}
      </div>

      <div className="rp-bar no-print">
        <div className="rp-seg">
          {PERIODS.map(([k, t]) => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{t}</button>)}
        </div>
        {kind !== 'custom' ? (
          <div className="rp-nav">
            <button className="icon-btn" aria-label="Previous period" onClick={() => setAnchor(shiftBy(kind, anchor, -1))}><PrevIcon /></button>
            <b>{label}</b>
            <button className="icon-btn" aria-label="Next period" onClick={() => setAnchor(shiftBy(kind, anchor, 1))}><NextIcon /></button>
          </div>
        ) : (
          <div className="rp-nav">
            <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            <span>to</span>
            <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </div>
        )}
        <div className="rp-actions">
          <button className="btn btn-ghost btn-sm btn-icon" disabled={!rep} onClick={() => window.print()} title="In the print window choose 'Save as PDF'"><PrintIcon /> PDF / Print</button>
          <button className="btn btn-success btn-sm btn-icon" disabled={!rep} onClick={toExcel}><SheetIcon /> Excel</button>
        </div>
      </div>
      {!valid && <p className="rp-warn no-print">The start date must be before or equal to the end date.</p>}

      {loading ? <Loader /> : rep && (
        <div className="print-area rp-sheet">
          <div className="rp-head">
            <div className="rp-brand">
              {co?.logoData && <img src={co.logoData} alt="" />}
              <div><h2>{co?.companyName || 'SILVA NAYA COMPANY LTD'}</h2><p>{[co?.address, co?.phone, co?.email].filter(Boolean).join(' • ')}</p></div>
            </div>
            <div className="rp-title"><h1>{rep.title}</h1><b>{nice(rep.from)} – {nice(rep.to)}</b></div>
          </div>
          {rep.type === 'debts' && <p className="rp-note">All outstanding debts up to {nice(rep.to)}.</p>}

          {rep.summary?.length > 0 && (
            <div className="rp-sum">
              {rep.summary.map((s, i) => (<div key={i}><small>{s.label}</small><b>{s.value}</b></div>))}
            </div>
          )}

          <div className="table-wrap">
            <table className="rp-table">
              <thead><tr>
                {rep.columns.map((c) => <th key={c.key} style={{ textAlign: alignOf(c) }}>{c.label}</th>)}
              </tr></thead>
              <tbody>
                {rep.rows?.length ? rep.rows.map((r, i) => (
                  <tr key={i}>
                    {rep.columns.map((c, j) => <td key={c.key} style={{ textAlign: alignOf(c) }}>{cell(c, r[j])}</td>)}
                  </tr>
                )) : <tr><td className="empty" colSpan={rep.columns.length}>No data for this period</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="rp-foot">Generated: {stamp(rep.generatedAt)} • {rep.generatedBy}</p>
        </div>
      )}

      {addOpen && <ExpenseForm onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); setTick((t) => t + 1); }} />}
    </div>
  );
}