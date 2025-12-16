# Deploy ke Vercel

## Cara 1: Via Vercel CLI (Recommended)

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login ke Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Atau untuk production:

```bash
vercel --prod
```

### 4. Setup Environment Variables

Setelah deploy pertama, setup environment variables di Vercel Dashboard:

1. Buka project di Vercel Dashboard
2. Go to Settings > Environment Variables
3. Tambahkan:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0xYourContractAddressHere`

## Cara 2: Via GitHub Integration (Paling Mudah)

### 1. Push ke GitHub

Pastikan code sudah di-push ke: https://github.com/mukminn/mini-app-baru

### 2. Import ke Vercel

1. Buka: https://vercel.com/new
2. Klik "Import Git Repository"
3. Pilih repository: `mukminn/mini-app-baru`
4. Klik "Import"

### 3. Configure Project

- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./` (default)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)

### 4. Environment Variables

Tambahkan environment variable:
- Key: `NEXT_PUBLIC_CONTRACT_ADDRESS`
- Value: `0xYourContractAddressHere`

### 5. Deploy

Klik "Deploy" dan tunggu proses selesai.

## Setelah Deploy

- URL production akan diberikan oleh Vercel
- Setiap push ke `main` branch akan auto-deploy
- Preview deployments untuk setiap PR

## Notes

- Pastikan contract address sudah di-deploy di Base network
- Environment variables bisa diubah kapan saja di Vercel Dashboard
- Vercel akan auto-detect Next.js dan configure dengan benar
