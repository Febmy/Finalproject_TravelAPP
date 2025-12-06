// src/lib/errors.js
// Helper umum untuk mengambil pesan error yang paling "manusiawi"

export function getFriendlyErrorMessage(
  err,
  fallback = "Terjadi kesalahan. Silakan coba lagi."
) {
  const res = err?.response;
  const status = res?.status;
  const data = res?.data;

  // Kalau benar-benar network error (server tidak bisa dihubungi)
  if (!res && err?.message === "Network Error") {
    return "Tidak bisa terhubung ke server. Periksa koneksi internet kamu.";
  }

  // Ambil pesan utama dari body API (kalau ada)
  const primary =
    (typeof data === "string" && data) ||
    (typeof data?.message === "string" && data.message) ||
    (Array.isArray(data?.errors) && data.errors[0]) ||
    (typeof data?.errors === "string" && data.errors) ||
    null;

  // Beberapa kasus status yang sering muncul
  if (status === 401) {
    return "Sesi kamu sudah berakhir. Silakan login ulang.";
  }

  if (status === 403) {
    return "Akses ditolak. Akun kamu tidak memiliki hak akses.";
  }

  if (status === 404) {
    return primary || "Data tidak ditemukan.";
  }

  // Kalau API sudah kasih pesan jelas, pakai itu
  if (primary) return primary;

  // Fallback default yang kita kirim dari pemanggil
  return fallback;
}
