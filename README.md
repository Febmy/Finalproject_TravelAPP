# TravelApp – Final Project Frontend Web Development

TravelApp adalah aplikasi pemesanan aktivitas wisata yang dibangun dengan **React + Vite** dan terhubung ke **Travel Journal API**.  
Aplikasi memiliki dua sisi utama:

- **User** – untuk melihat aktivitas, mengelola cart, checkout, dan melihat transaksi.
- **Admin** – untuk mengelola aktivitas, promo & banner, user, dan transaksi.

---

## ✨ Fitur Utama – Sisi User

### 1. Autentikasi & Proteksi Halaman

- Register & Login menggunakan endpoint Auth Travel Journal.
- Token JWT disimpan (mis. di `localStorage`) dan dikirim di header:
  `Authorization: Bearer <token>`.
- Navbar menampilkan:
  - Sapaan: `Hi, <nama>`
  - Tombol **Profile**, **Cart**, **My Transactions**, dan **Logout**.
- Tombol **Logout**:
  - Menghapus token & profil user.
  - Redirect ke halaman **Login**.
- Routing:
  - **Public routes**: `/login`, `/register`.
  - **Protected user routes**: `/`, `/activity`, `/activity/:id`, `/cart`, `/checkout`, `/transactions`, `/profile`.
- Protected route akan mengecek token:
  - Jika tidak ada / invalid → redirect ke `/login`.

---

### 2. Homepage (`/`)

- Menampilkan **hero image / banner** utama.
- Bagian konten:
  - **Section I – Semua Aktivitas**
  - **Section II – Rekomendasi**
  - **Section III – Transaksi Saya**
- Card rekomendasi diambil dari endpoint **activities** (bukan data statis).
- Terdapat **footer** dengan teks hak cipta dan link Terms & Privacy.

---

### 3. Activity List (`/activity`)

- Menampilkan daftar semua aktivitas dari API.
- (Opsional) Filter/tab:
  - **All**, **Budget**, **Premium** (bisa difilter berdasarkan harga).
- Card aktivitas berisi:
  - Gambar aktivitas.
  - Judul & deskripsi singkat.
  - Harga (format Rupiah).
- Klik card akan membuka halaman **Activity Detail**.

---

### 4. Activity Detail (`/activity/:id`)

- Menampilkan detail satu aktivitas:
  - Gambar, judul, harga, deskripsi lengkap.
- Section **Booking**:
  - Input **tanggal** (`<input type="date" />`).
  - (Opsional) jumlah orang — quantity di-handle di cart / backend.
  - Tombol **Add to Cart**:
    - Memanggil endpoint **Add Cart**.
    - Menampilkan toast sukses / error sesuai respons API.

---

### 5. Cart (`/cart`)

- Mengambil data cart user dari endpoint `/carts`.
- Untuk setiap item:
  - Gambar aktivitas.
  - Judul.
  - Harga.
  - Info jumlah (mis. `x1`, dll).
  - Tombol **Remove** untuk menghapus item (Delete Cart).
- Di bagian bawah:
  - Informasi ringkas:  
    `Ada X aktivitas dengan total Y orang di keranjangmu.`
  - Total harga: `Total: RpX`.
  - Tombol aksi:
    - **Clear** – mengosongkan cart.
    - **Activity** – kembali ke halaman activity.
    - **Checkout** – menuju halaman checkout.

---

### 6. Checkout (`/checkout`)

- Mengambil:
  - Data **payment methods** dari endpoint `/payment-methods`.
  - Data cart untuk mendapatkan `cartIds`.
- **Form Checkout**:
  - Data dasar: nama lengkap, email, phone (disimpan di state).
  - Pilihan **metode pembayaran** (radio / select).
- Tombol **Confirm Checkout**:

  - Validasi form dan pemilihan metode pembayaran.
  - Mengirim request ke endpoint **Create Transaction** dengan payload:

    ```json
    {
      "cartIds": ["id-cart-1", "id-cart-2"],
      "paymentMethodId": "id-payment-method"
    }
    ```

  - Jika sukses → redirect ke halaman **My Transactions**.
  - Error (validasi / network) ditampilkan melalui **toast**.

---

### 7. My Transactions (`/transactions`)

- Menampilkan riwayat transaksi user dari endpoint `/my-transactions`.
- Filter/tab status:
  - **All**, **Success**, **Pending**, **Failed**, **Cancelled**.
- Card transaksi menampilkan:
  - Gambar aktivitas.
  - Judul aktivitas.
  - `Total: RpX` (format Rupiah) dan jumlah item (jika tersedia dari API).
  - Metode pembayaran.
  - Tanggal & waktu transaksi (format Indonesia).
  - Badge status: `success | pending | failed | cancelled`.
- Tombol **Cancel**:
  - Hanya muncul jika status transaksi = `pending`.
  - Memanggil endpoint **Cancel Transaction**.
  - Jika berhasil:
    - Status berubah menjadi `cancelled`.
    - Menampilkan toast sukses.

---

### 8. Profile (`/profile`)

- Menampilkan informasi user yang sedang login:
  - Nama.
  - Email.
  - Field lain yang tersedia dari endpoint `/profile`.
- Layout konsisten dengan halaman lain (menggunakan container & card).

---

### 9. Toast Notification

- Menggunakan **Toast component** custom melalui `ToastContext`.
- Dipanggil pada momen penting:
  - Login/register sukses atau gagal.
  - Add to cart.
  - Checkout / create transaction.
  - Cancel / update transaksi.
  - Aksi CRUD di admin panel.
- Posisi di pojok atas dan hilang otomatis setelah beberapa detik.

---

## 🛠️ Fitur Utama – Admin Panel (`/admin`)

> Hanya dapat diakses ketika user login dengan role **`admin`**  
> (role disimpan di profil user / `localStorage`).

Admin panel memiliki beberapa menu:

### 1. Dashboard

- Menampilkan ringkasan angka penting:
  - Total **Activities**.
  - Total **Promos**.
  - Total **Transactions**.
  - Total **Users**.
- Data diambil langsung dari API yang sama dengan halaman lain.

---

### 2. Users Management

- Mengambil seluruh user dari endpoint admin (mis. `/all-user`).
- Menampilkan:
  - Nama.
  - Email.
  - Role saat ini (`user` atau `admin`).
- Admin dapat mengubah **role user** via dropdown:
  - Role `user` ⇄ `admin`.
  - Memanggil endpoint `update-user-role/{id}`.
- Perubahan role akan langsung tercermin di UI.

---

### 3. Activities Management

- Melihat semua aktivitas dari endpoint activities (admin).
- **Create / Update Activity**:
  - Mengambil daftar **categories** dari endpoint `categories`.
  - Admin bisa memilih kategori dari dropdown, tidak perlu memasukkan `categoryId` manual.
  - Field yang diset:
    - `title`
    - `description`
    - `price`
    - `imageUrls` (array URL gambar)
    - `category` / `categoryId`
- **Delete Activity**:
  - Menghapus activity melalui endpoint delete.
- Perubahan akan langsung mempengaruhi sisi user:
  - `/activity` (list).
  - `/activity/:id` (detail).

---

### 4. Promos & Banner Management

- **Promo CRUD**:
  - Create / Update / Delete promo.
  - Field:
    - `title`
    - `promo_code`
    - `minimum_claim_price`
    - `promo_discount_price`
    - Tanggal berlaku (sesuai struktur API).
- **Banner CRUD**:
  - Mengelola banner yang tampil di homepage user.
- Halaman promo & banner di user membaca data dari endpoint yang sama.

---

### 5. Transactions Management

- Mengambil semua transaksi dari endpoint admin (mis. `/all-transactions`).
- Filter berdasarkan status:
  - **All**, **Pending**, **Success**, **Failed**, **Cancelled**.
- Menampilkan:
  - ID transaksi.
  - Nama & email user.
  - `totalAmount` (format Rupiah).
  - Metode pembayaran.
  - Status transaksi.
  - Waktu dibuat.
- Untuk transaksi `pending`, admin dapat:
  - **Approve (Success)** → update status ke `success`.
  - **Reject (Failed)** → update status ke `failed`.
- Perubahan status juga terlihat di halaman **My Transactions** user.

---

## 📁 Struktur Folder (ringkas)

```bash
src/
  components/
    activity/
      ActivityCard.jsx
    cart/
      CartItem.jsx
    layout/
      Navbar.jsx
      Footer.jsx
      PageContainer.jsx
      ScrollToTop.jsx
      AdminLayout.jsx
    ui/
      EmptyState.jsx
      Spinner.jsx
  context/
    ToastContext.jsx
  lib/
    api.js        # konfigurasi axios (baseURL, apiKey, interceptor)
    format.js     # helper format tanggal & currency
  pages/
    admin/
      AdminActivities.jsx
      AdminDashboard.jsx
      AdminPromos.jsx
      AdminTransactions.jsx
      AdminUsers.jsx
    auth/
      Login.jsx
      Register.jsx
    user/
      Home.jsx
      ActivityList.jsx
      ActivityDetail.jsx
      Cart.jsx
      Checkout.jsx
      Transactions.jsx
      Profile.jsx
      NotFound.jsx
      Promos.jsx
  App.jsx         # routing & proteksi route user/admin
  main.jsx        # React root
```
