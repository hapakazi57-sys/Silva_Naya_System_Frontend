import React, { useState } from 'react';
import './PasswordInput.css';


export default function PasswordInput({ value, onChange, placeholder, required, minLength, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw">
      <input
        type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
        required={required} minLength={minLength} autoComplete={autoComplete}
      />
      <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Onyesha au ficha nenosiri">{show ? '🙈' : '👁️'}</button>
    </div>
  );
}
