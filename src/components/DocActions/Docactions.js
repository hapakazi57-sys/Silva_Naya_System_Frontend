import React, { useState } from 'react';
import { waLink } from '../../utils/format';
import { info, fail } from '../../utils/alerts';
import './Docactions.css';


export default function DocActions({ phone, message, fileName = 'document' }) {
  const [busy, setBusy] = useState(false);
  const href = `${phone ? waLink(phone) : 'https://wa.me/'}?text=${encodeURIComponent(message)}`;

  const share = async () => {
    const el = document.querySelector('.modal .doc') || document.querySelector('.doc');
    if (!el) return;
    setBusy(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: message });
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      await info('Image saved', 'The image was downloaded to your device. WhatsApp will open now: attach the image in the chat and send.', 'Open WhatsApp');
      window.open(href, '_blank', 'noopener');
    } catch (e) {
      if (e?.name !== 'AbortError') fail(e);
    } finally { setBusy(false); }
  };

  return (
    <div className="form-foot no-print doc-actions">
      <button type="button" className="btn btn-primary" disabled={busy} onClick={share}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 9" />
        </svg>
        {busy ? 'Preparing image...' : 'Share image via WhatsApp'}
      </button>
      <button type="button" className="btn btn-primary" onClick={() => window.print()}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M7 8V3h10v5" /><rect x="4" y="8" width="16" height="9" rx="2" /><path d="M7 14h10v7H7z" />
        </svg>
        Print / Save PDF
      </button>
    </div>
  );
}