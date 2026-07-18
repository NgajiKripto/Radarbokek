# Bug Report — Radar Bokek

## Summary
Ditemukan **5 vulnerabilities** (2 Critical, 2 High, 1 Medium) melalui code review dan testing dengan mock server.

---

## 🔴 CRITICAL

### 1. JWT Secret Hardcoded — Token Forgery
**File:** `server/mock-server.js:46`, `server/config/env.js:7`
**Impact:** Attacker bisa forge JWT token untuk impersonate user mana pun.

**Evidence:**
```bash
# Forge token dengan known secret
node -e "const jwt=require('jsonwebtoken');console.log(jwt.sign({id:'attacker',role:'merchant'},'mock-dev-secret-change-me',{algorithm:'HS256'}))"
# Result: valid token yang diterima server
```

**Root Cause:**
- `MOCK_JWT_SECRET = process.env.JWT_SECRET || 'mock-dev-secret-change-me'` (mock-server.js:46)
- `jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production'` (config/env.js:7)
- `.env` masih pakai default: `JWT_SECRET=change-me-to-random-secret-min-32-chars`

**Fix:** Generate random secret minimal 32 char, jangan commit ke repo.

---

### 2. Webhook Tanpa Signature Verification — Free Coins
**File:** `server/routes/webhook.js:7-8`
**Impact:** Attacker bisa credit coin tanpa pembayaran.

**Evidence:**
```bash
# 1. Buat topup request → dapat transaction_id
curl -X POST /api/v1/merchant/wallet/topup -d '{"amount_rupiah":50000}'
# → TX-62b58127

# 2. Kirim webhook palsu tanpa bayar
curl -X POST /api/v1/webhooks/payment/qris-callback \
  -d '{"transaction_id":"TX-62b58127","status":"success"}'
# → {"success":true}

# 3. Coin balance bertambah 50 koin (dari 50000 → 50050)
```

**Root Cause:**
```javascript
// webhook.js:7-8 — Comment saja, tidak ada implementasi
// In production: verify signature from payment gateway
// const isValid = verifySignature(req.body, req.headers['x-signature']);
```

**Fix:** Implement signature verification dari payment gateway sebelum proses webhook.

---

## 🟠 HIGH

### 3. Free Quota Tidak Berkurang — Unlimited Radar
**File:** `server/routes/merchant.js` (radar/ping endpoint)
**Impact:** Free tier merchant bisa pakai radar selamanya tanpa batas.

**Root Cause:**
Di `radar/ping`, kode cek sisa kuota tapi tidak pernah update `remaining_free_quota` di DB:
```javascript
// Hanya membaca, tidak mengurangi
let remainingQuota = row.remaining_free_quota || '03:00:00';
// ... hitung elapsed, tapi tidak UPDATE DB
```

**Fix:** Setelah hitung elapsed, update DB:
```sql
UPDATE merchant_radar_signals 
SET remaining_free_quota = $newRemaining 
WHERE merchant_id = $1
```

---

## 🟡 MEDIUM

### 4. .env Ter-expose di Repository
**File:** `.env`
**Impact:** Database credentials dan JWT secret tersimpan di plaintext, bisa ter-commit ke git.

**Evidence:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/radarbokek
JWT_SECRET=change-me-to-random-secret-min-32-chars
```

**Fix:** 
- Tambah `.env` ke `.gitignore`
- Rotate semua credentials
- Gunakan environment variables di production

---

## ✅ POSITIVE (Sudah Bagus)

- SQL Injection: Semua query pakai parameterized (`$1`, `$2`)
- XSS Prevention: Sanitize middleware escape HTML
- Rate Limiting: Throttle middleware untuk auth endpoints
- CSRF Protection: Origin validation
- File Upload: Magic bytes validation
- Input Validation: Lat/lon range check
- Helmet: Security headers configured

---

## Reproduction Steps

```bash
# 1. Jalankan mock server
cd /root/radarbokek && node server/mock-server.js

# 2. Test JWT forgery
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@radarbokek.id","password":"demo1234"}'

# 3. Test webhook tanpa auth
curl -X POST http://localhost:3000/api/v1/webhooks/payment/qris-callback \
  -H "Content-Type: application/json" \
  -d '{"transaction_id":"[ANY_ID]","status":"success"}'
```

---

## Priority Fix Order

1. **JWT Secret** — Immediate (production block)
2. **Webhook Signature** — Immediate (financial impact)
3. **Free Quota** — High (business logic bypass)
4. **.env Exposure** — Medium (credential hygiene)
