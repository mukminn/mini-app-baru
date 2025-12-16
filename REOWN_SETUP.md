# Reown AppKit Setup

## Mendapatkan Project ID

1. Buka: https://dashboard.reown.com
2. Buat akun atau login
3. Buat project baru (pilih "AppKit")
4. Copy **Project ID** yang diberikan

## Setup Environment Variable

1. Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` dan tambahkan Project ID:
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=fa10325c22836e4627c2321df96159fd
```

**Note:** Project ID sudah dikonfigurasi di `lib/appkit-config.tsx` sebagai fallback, jadi AppKit akan tetap berfungsi meskipun environment variable tidak di-set.

3. Untuk Vercel deployment, tambahkan environment variable di Vercel Dashboard:
   - Settings > Environment Variables
   - Key: `NEXT_PUBLIC_REOWN_PROJECT_ID`
   - Value: `your_project_id_here`

## Fitur Reown AppKit

- ✅ Popup connect wallet yang modern
- ✅ Support semua wallet (240+ wallets)
- ✅ QR code untuk mobile wallets
- ✅ Email & Google login
- ✅ Farcaster integration
- ✅ Search wallet functionality
- ✅ Auto-add chain Base/Base Sepolia
- ✅ Seamless connection experience

## Catatan

- Reown AppKit memerlukan Project ID untuk berfungsi
- Tanpa Project ID, fitur connect wallet tidak akan bekerja
- AppKit menangani semua wallet connection secara otomatis
