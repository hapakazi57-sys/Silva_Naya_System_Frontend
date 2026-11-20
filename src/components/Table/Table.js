import React, { useEffect, useMemo, useState } from 'react';
import './Table.css';


const collator = new Intl.Collator('sw', { numeric: true, sensitivity: 'base' });
const cx = (...a) => a.filter(Boolean).join(' ');
const sortValue = (c, row) => (typeof c.s === 'function' ? c.s(row) : row[c.s]);
const flatText = (row) =>
  Object.values(row)
    .filter((v) => v != null && typeof v !== 'object')
    .join(' ');

function pageList(cur, pages) {
  const nums = [...new Set([1, pages, cur - 1, cur, cur + 1])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

export default function Table({
  cols,
  rows = [],
  empty = 'Hakuna taarifa bado',
  loading = false,
  search = false,
  searchBy,
  searchPlaceholder = 'Tafuta...',
  pageSize = 0,
  onRowClick,
  rowClass,
  toolbar,
  striped = false,
  dense = false,
  stack = false,
  maxHeight,
  caption,
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ i: null, dir: 1 });
  const [page, setPage] = useState(1);

  /* ---------- Tafuta ---------- */
  const filtered = useMemo(() => {
    const term = q.trim().toLocaleLowerCase();
    if (!search || !term) return rows;
    return rows.filter((row) => {
      const text = searchBy
        ? searchBy(row)
        : [flatText(row), ...cols.filter((c) => c.s).map((c) => sortValue(c, row))].join(' ');
      return String(text).toLocaleLowerCase().includes(term);
    });
  }, [rows, q, search, searchBy, cols]);

  /* ---------- Panga ---------- */
  const sorted = useMemo(() => {
    const col = sort.i != null ? cols[sort.i] : null;
    if (!col || !col.s) return filtered;
    return [...filtered].sort((x, y) => {
      const a = sortValue(col, x);
      const b = sortValue(col, y);
      if (a == null || b == null) return (a == null) - (b == null); // tupu zikae mwisho
      const r =
        typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(String(a), String(b));
      return r * sort.dir;
    });
  }, [filtered, cols, sort]);

  /* ---------- Kurasa ---------- */
  useEffect(() => {
    setPage(1);
  }, [q, sort, pageSize]);

  const total = sorted.length;
  const pages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const cur = Math.min(page, pages);
  const from = pageSize ? (cur - 1) * pageSize : 0;
  const visible = pageSize ? sorted.slice(from, from + pageSize) : sorted;

  const toggleSort = (i) =>
    setSort((s) => (s.i !== i ? { i, dir: 1 } : s.dir === 1 ? { i, dir: -1 } : { i: null, dir: 1 }));

  const rowClick = (e, row) => {
    if (e.target.closest('button, a, input, select, textarea, label')) return;
    onRowClick(row);
  };

  const showFooter = !loading && total > 0 && (pageSize || search);
  const colCount = cols.length;

  return (
    <div className="table-wrap" aria-busy={loading}>
      {(search || toolbar) && (
        <div className="tbl-toolbar">
          {search && (
            <label className="tbl-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                value={q}
                placeholder={searchPlaceholder}
                aria-label="Search table"
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button type="button" className="tbl-clear" aria-label="Futa utafutaji" onClick={() => setQ('')}>
                  ×
                </button>
              )}
            </label>
          )}
          {toolbar && <div className="tbl-tools">{toolbar}</div>}
        </div>
      )}

      <div className="table-scroll" style={maxHeight ? { maxHeight } : undefined}>
        <table className={cx('tbl', striped && 'is-striped', dense && 'is-dense', stack && 'tbl-stack')}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {cols.map((c, i) => {
                const active = sort.i === i;
                return (
                  <th
                    key={i}
                    className={cx(c.a && `a-${c.a}`, c.cls)}
                    style={c.w ? { width: c.w } : undefined}
                    aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                  >
                    {c.s ? (
                      <button type="button" className={cx('th-sort', active && 'on')} onClick={() => toggleSort(i)}>
                        {c.h}
                        <span
                          className={cx('th-arrows', active && (sort.dir === 1 ? 'asc' : 'desc'))}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      c.h
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`sk-${i}`} className="tbl-skel">
                  {cols.map((c, j) => (
                    <td key={j}>
                      <span className={`sk w${(i + j) % 3}`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : visible.length ? (
              visible.map((r, i) => (
                <tr
                  key={r.id ?? from + i}
                  className={cx(onRowClick && 'is-click', rowClass && rowClass(r))}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? (e) => rowClick(e, r) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(r);
                        }
                      : undefined
                  }
                >
                  {cols.map((c, j) => (
                    <td
                      key={j}
                      className={cx(c.a && `a-${c.a}`, c.cls)}
                      data-label={typeof c.h === 'string' ? c.h : undefined}
                    >
                      {c.r(r)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="tbl-empty-row">
                <td colSpan={colCount} className="empty">
                  <svg className="empty-ico" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                    <path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.2a2 2 0 0 0-1.7 1.1z" />
                  </svg>
                  <span>{q.trim() ? `Hakuna matokeo ya “${q.trim()}”` : empty}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="tbl-foot">
          <span className="tbl-info">
            {pageSize
              ? `Inaonyesha ${from + 1}–${Math.min(from + pageSize, total)} ya ${total}`
              : `Jumla: ${total}`}
            {search && q.trim() && rows.length !== total ? ` (kati ya ${rows.length})` : ''}
          </span>

          {pages > 1 && (
            <nav className="tbl-pager" aria-label="Kurasa">
              <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Last page">
                ‹
              </button>
              {pageList(cur, pages).map((n) =>
                typeof n === 'number' ? (
                  <button
                    key={n}
                    type="button"
                    className={n === cur ? 'on' : ''}
                    aria-current={n === cur ? 'page' : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ) : (
                  <span key={n} className="gap">
                    …
                  </span>
                )
              )}
              <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page">
                ›
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}