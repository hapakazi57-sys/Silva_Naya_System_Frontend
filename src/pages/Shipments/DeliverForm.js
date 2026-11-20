import React, { useState } from 'react';
import { api } from '../../utils/api';
import { ok, fail, confirmBox } from '../../utils/alerts';
import Modal from '../../components/Modal/Modal';
import Field from '../../components/Field/Field';
import './DeliverForm.css';

export default function DeliverForm({ s, onClose, onSaved }) {
  const [f, setF] = useState({ receiverName: s.customer.name, receiverPhone: s.customer.phone || '', note: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (!(await confirmBox('Deliver shipment?', `${s.cargoNo} will be handed over to ${f.receiverName}.`, 'Deliver'))) return;
    try { await api.post(`/shipments/${s.id}/deliver`, f); ok('Shipment delivered to customer'); onSaved(); } catch (err) { fail(err); }
  };

  return (
    <Modal title={`Deliver shipment ${s.cargoNo}`} onClose={onClose}>
      <form className="form-grid deliver-form" onSubmit={save}>
        <Field label="Name of person collecting the shipment *" full><input required value={f.receiverName} onChange={set('receiverName')} /></Field>
        <Field label="Receiver's phone number *" full><input required value={f.receiverPhone} onChange={set('receiverPhone')} /></Field>
        <Field label="Verification / notes (e.g. ID card)" full><textarea rows="2" value={f.note} onChange={set('note')} /></Field>
        <div className="form-foot full">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-success">Confirm handover</button>
        </div>
      </form>
    </Modal>
  );
}