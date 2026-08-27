// Formatting utility helpers for SmartBooking Admin Dashboard

/**
 * Shortens customer email by removing @gmail.com domain if present.
 * Keeps email concise while retaining identity.
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.replace(/@gmail\.com$/i, '');
};

/**
 * Formats monetary amounts into BDT currency format (e.g. ৳299).
 */
export const formatBDT = (amount) => {
  if (amount === undefined || amount === null || amount === '' || isNaN(amount)) {
    return '৳0';
  }
  return `৳${Number(amount).toLocaleString('en-BD')}`;
};
