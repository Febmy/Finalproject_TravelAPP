// src/lib/transactionTotals.js

export const TX_TOTALS_STORAGE_KEY = "travelapp_transaction_totals";

/**
 * Ambil map total transaksi dari localStorage
 * Bentuk: { [transactionId]: { subtotal, discount, total } }
 */
export function loadTransactionTotalsMap() {
  try {
    const raw = localStorage.getItem(TX_TOTALS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("Failed to load transaction totals:", err);
    return {};
  }
}

/**
 * Simpan ringkasan total transaksi ke localStorage
 * Dipanggil setelah create-transaction sukses di Checkout
 */
export function saveTransactionTotals(transactionId, totals) {
  try {
    if (!transactionId || !totals) return;

    const current = loadTransactionTotalsMap();

    current[transactionId] = {
      subtotal: Number(totals.subtotal) || 0,
      discount: Number(totals.discount) || 0,
      total: Number(totals.total) || 0, // <- ini yang dipakai My Transactions
    };

    localStorage.setItem(TX_TOTALS_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save transaction totals:", err);
  }
}
