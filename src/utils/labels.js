import React from 'react';

/* English labels for statuses, roles and various types */

export const COMPANY_WA = '255000000000'; // CHANGE: the company's official WhatsApp number

export const L = {
  role: { EMPLOYEE: 'Employee', MANAGER: 'Manager', ADMIN: 'System Administrator' },
  mode: { AIR: 'Air', SEA: 'Sea' },
  category: { NORMAL: 'Normal Goods', HK: 'HK (Hongkong Goods)' },
  country: { CHINA: 'China', DUBAI: 'Dubai', ALL: 'All' },
  order: { DRAFT: 'Draft', SUBMITTED: 'Awaiting approval', APPROVED: 'Approved', REJECTED: 'Rejected', REVISION: 'Needs revision' },
  ship: {
    RECEIVED_ORIGIN: 'Received at origin', IN_TRANSIT: 'In transit', ARRIVED: 'Arrived in Tanzania',
    READY_FOR_PICKUP: 'Ready for pickup', DELIVERED: 'Delivered', ON_HOLD: 'Temporarily on hold',
  },
  pay: { UNPAID: 'Unpaid', PARTIAL: 'Partially paid', PURCHASE_PAID: 'Purchase paid', SHIPPING_PAID: 'Shipping paid', PAID: 'Fully paid' },
  part: { PURCHASE: 'Purchase', SHIPPING: 'Shipping' },
  itype: { PURCHASE: 'Purchase', SHIPPING: 'Shipping', COMBINED: 'Purchase + Shipping' },
};

/* Badge color for each status */
export const TONE = {
  DRAFT: 'gray', SUBMITTED: 'amber', APPROVED: 'green', REJECTED: 'red', REVISION: 'blue',
  RECEIVED_ORIGIN: 'gray', IN_TRANSIT: 'blue', ARRIVED: 'green', READY_FOR_PICKUP: 'teal', DELIVERED: 'dark', ON_HOLD: 'red',
  UNPAID: 'red', PARTIAL: 'amber', PURCHASE_PAID: 'blue', SHIPPING_PAID: 'blue', PAID: 'green',
};

/* SVG icon wrapper for the sidebar (inherits the text color via currentColor) */
const icon = (children) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const ICONS = {
  // Home
  home: icon(
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  // Users
  users: icon(
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
      <path d="M18 14.3c2 .8 3.5 2.6 3.5 5.7" />
    </>
  ),
  // Shopping cart
  cart: icon(
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L21 7H6" />
    </>
  ),
  // Package
  box: icon(
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  // Receipt
  receipt: icon(
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </>
  ),
  // Credit card
  card: icon(
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  // Balance scale
  scale: icon(
    <>
      <path d="M12 3v18" />
      <path d="M6 21h12" />
      <path d="M5 7h14" />
      <path d="M5 7l-3 7a3 3 0 0 0 6 0L5 7z" />
      <path d="M19 7l-3 7a3 3 0 0 0 6 0l-3-7z" />
    </>
  ),
  // Lock
  lock: icon(
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  // Document / logs
  log: icon(
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
};

/* Sidebar menu: [key, icon, label, allowed roles (optional)] */
export const NAV = [
  ['dashboard', ICONS.home, 'Dashboard'], ['customers', ICONS.users, 'Customers'], ['orders', ICONS.cart, 'Purchases'], ['shipments', ICONS.box, 'Shipping'],
  ['invoices', ICONS.receipt, 'Invoices'], ['payments', ICONS.card, 'Payments & Receipts'], ['rates', ICONS.scale, 'Rates & Currencies'],
  ['users', ICONS.lock, 'Users', ['ADMIN']], ['logs', ICONS.log, 'Logs'],
];