import Swal from 'sweetalert2';
import './alerts.css';

/* SweetAlert2 (Swal) with Silva Naya border radius and styling */
export const SW = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  backdrop: 'rgba(11,29,48,.55)',
  customClass: {
    popup: 'sn-popup', title: 'sn-title', htmlContainer: 'sn-swal-html', actions: 'sn-actions',
    confirmButton: 'sn-btn sn-btn-primary', cancelButton: 'sn-btn sn-btn-ghost', denyButton: 'sn-btn sn-btn-danger',
    input: 'sn-swal-input', inputLabel: 'sn-swal-label',
  },
});

export const Toast = SW.mixin({
  toast: true, backdrop: false, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true,
  customClass: { popup: 'sn-popup sn-toast', title: 'sn-toast-title' },
});

export const ok = (title) => Toast.fire({ icon: 'success', title });

export const fail = (e) =>
  SW.fire({
    icon: 'error',
    title: 'Error',
    text: e?.response?.data?.message || (e?.message === 'Network Error' ? 'Server unavailable. Make sure the backend is running.' : 'Something went wrong, please try again'),
    confirmButtonText: 'OK',
  });

export const warn = (title, text) => SW.fire({ icon: 'warning', title, text, confirmButtonText: 'OK' });

export const info = (title, text, btn = 'OK') => SW.fire({ icon: 'info', title, text, confirmButtonText: btn });

export const confirmBox = (title, text, btn = 'Yes, continue') =>
  SW.fire({ icon: 'question', title, text, showCancelButton: true, confirmButtonText: btn, cancelButtonText: 'Cancel' }).then((r) => r.isConfirmed);

export const askText = async (title, label) => {
  const r = await SW.fire({
    title, input: 'textarea', inputLabel: label, inputPlaceholder: 'Type here...', showCancelButton: true,
    confirmButtonText: 'Send', cancelButtonText: 'Cancel',
    inputValidator: (v) => (!v || !v.trim() ? 'A description is required' : undefined),
  });
  return r.isConfirmed ? r.value.trim() : null;
};