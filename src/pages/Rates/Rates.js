import React, { useState } from 'react';
import useData from '../../hooks/useData';
import { fmtD } from '../../utils/format';
import { L } from '../../utils/labels';
import PageHead from '../../components/PageHead/PageHead';
import Table from '../../components/Table/Table';
import Loader from '../../components/Loader/Loader';
import ShippingRateForm from './ShippingRateForm';
import ExchangeRateForm from './ExchangeRateForm';
import './Rates.css';

/* Four rate sections: Air and Sea, each with Normal Goods and HK (Hong Kong Goods) */
const GROUPS = [
  ['AIR', 'NORMAL'], ['AIR', 'HK'],
  ['SEA', 'NORMAL'], ['SEA', 'HK'],
];

export default function Rates({ me }) {
  const ship = useData('/rates/shipping');
  const fx = useData('/rates/exchange');
  const [tab, setTab] = useState('ship');
  const [modal, setModal] = useState(null); // 'fx' | { mode, category } | null
  const canEdit = me.role === 'ADMIN' || me.role === 'MANAGER';
  const catOf = (r) => r.category || 'NORMAL';

  const cols = [
    { h: 'Country', r: (r) => L.country[r.originCountry] || r.originCountry },
    { h: 'Per kg', r: (r) => r.ratePerKg },
    { h: 'Per CBM', r: (r) => r.ratePerCbm },
    { h: 'Minimum charge', r: (r) => r.minCharge },
    { h: 'Volumetric divisor', r: (r) => r.volumetricDivisor },
    { h: 'Currency', r: (r) => r.currency },
    { h: 'Effective from', r: (r) => fmtD(r.effectiveFrom) },
    { h: 'Set by', r: (r) => r.createdBy },
  ];

  return (
    <div className="rates-page">
      <PageHead title="Shipping Rates & Currency" sub="New rates do not change past transactions">
        <div className="tabs">
          <button className={tab === 'ship' ? 'on' : ''} onClick={() => setTab('ship')}>Shipping rates</button>
          <button className={tab === 'fx' ? 'on' : ''} onClick={() => setTab('fx')}>Exchange rates</button>
        </div>
        {canEdit && tab === 'fx' && <button className="btn btn-primary" onClick={() => setModal('fx')}>＋ New exchange rate</button>}
      </PageHead>

      {tab === 'ship' ? (ship.loading ? <Loader /> : (
        <div className="rate-groups">
          {GROUPS.map(([mode, category]) => (
            <section key={mode + category} className={`rate-group ${category === 'HK' ? 'hk' : ''}`}>
              <div className="rate-group-head">
                <h3>{L.mode[mode]} <span>{L.category[category]}</span></h3>
                {canEdit && <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode, category })}>＋ New rate</button>}
              </div>
              <Table
                rows={ship.data.filter((r) => r.mode === mode && catOf(r) === category)}
                empty="No rate has been set for this section yet"
                cols={cols}
              />
            </section>
          ))}
        </div>
      )) : (fx.loading ? <Loader /> : (
        <Table
          rows={fx.data}
          cols={[
            { h: 'Currency', r: (r) => r.currency },
            { h: '1 = TZS', r: (r) => r.rateToTzs },
            { h: 'Effective from', r: (r) => fmtD(r.effectiveFrom) },
            { h: 'Set by', r: (r) => r.createdBy },
          ]}
        />
      ))}

      {modal && modal !== 'fx' && <ShippingRateForm preset={modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); ship.reload(); }} />}
      {modal === 'fx' && <ExchangeRateForm onClose={() => setModal(null)} onSaved={() => { setModal(null); fx.reload(); }} />}
    </div>
  );
}