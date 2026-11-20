import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { fail } from '../../utils/alerts';
import { money, fmtD, fmtDT } from '../../utils/format';
import { L } from '../../utils/labels';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import Kv from '../../components/Kv/Kv';
import Loader from '../../components/Loader/Loader';
import './ShipmentView.css';

export default function ShipmentView({ id, onClose }) {
  const [d, setD] = useState(null);
  useEffect(() => { api.get(`/shipments/${id}`).then((r) => setD(r.data)).catch(fail); }, [id]);

  if (!d) return <Modal title="Mzigo" onClose={onClose}><Loader /></Modal>;
  const s = d.shipment;

  return (
    <Modal title={`Mzigo ${s.cargoNo}`} onClose={onClose} wide>
      <div className="print-area">
        <div className="kv-grid">
          <Kv k="Mteja" v={s.customer.name} />
          <Kv k="Tracking" v={s.trackingNo} />
          <Kv k="Hali" v={<Badge s={s.status} map={L.ship} />} />
          <Kv k="Njia" v={`${L.mode[s.mode]} • ${L.country[s.originCountry] || s.originCountry}`} />
          <Kv k="Aina ya mzigo" v={L.category[s.category] || L.category.NORMAL} />
          <Kv k="Kutoka → Kwenda" v={`${s.origin || '-'} → ${s.destination || '-'}`} />
          <Kv k="Maelezo" v={s.description} />
          <Kv k="Uzito" v={`${s.weightKg} kg`} />
          <Kv k="Ujazo" v={`${s.cbm} CBM`} />
          <Kv k="Uzito wa kutoza" v={`${s.chargeableKg} kg`} />
          <Kv k="Gharama" v={`${money(s.chargeAmount, s.chargeCurrency)} (≈ ${money(s.chargeTzs)})`} />
          <Kv k="Kuondoka" v={fmtD(s.departureDate)} />
          <Kv k="Inatarajiwa" v={fmtD(s.expectedArrival)} />
          <Kv k="Imewasili" v={fmtD(s.actualArrival)} />
          {s.status === 'DELIVERED' && (
            <>
              <Kv k="Aliyechukua" v={s.receiverName} />
              <Kv k="Simu ya mpokeaji" v={s.receiverPhone} />
              <Kv k="Alikabidhiwa" v={fmtDT(s.deliveredAt)} />
            </>
          )}
        </div>
        <h4>Historia ya hali</h4>
        <div className="timeline">
          {d.history.map((h) => (
            <div className="tl-item" key={h.id}>
              <i />
              <div><Badge s={h.status} map={L.ship} /><p>{h.note || ''}</p><small>{fmtDT(h.changedAt)} • {h.changedBy}</small></div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-foot no-print"><button className="btn btn-ghost" onClick={() => window.print()}>🖨️ Chapisha</button></div>
    </Modal>
  );
}