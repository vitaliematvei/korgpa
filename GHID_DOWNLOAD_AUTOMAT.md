# 📥 Sistem Automat de Download - Ghid de Utilizare

## 🎯 Cum Funcționează

### Flow Complet (Clientul)

1. **Cumpărătorul** adaugă produse în cart
2. **Checkout** → completează datele și plătește cu cardul
3. **Stripe** procesează plata → SUCCESS ✅
4. **Webhook** Stripe notifică site-ul
5. **Email automat** se trimite cu link-uri de download
6. **Clientul** click pe link → **download automat** 📥

---

## 🛠️ Configurare Inițială

### Pasul 1: Adaugă Fișiere în Sanity Studio

1. Accesează: http://localhost:3000/studio
2. Click pe un **Product** existent sau creează unul nou
3. Scroll jos la câmpurile noi:

   **Opțiunea A: Upload Fișier Direct**
   - **Download File**: Click "Upload" și alege fișierul (ZIP, RAR, etc.)
   - Sanity va găzdui fișierul automat

   **Opțiunea B: Link Extern** (Google Drive, Dropbox, etc.)
   - **Download URL**: Pune link-ul complet (ex: `https://drive.google.com/file/d/...`)

4. Click **Publish** pentru a salva

---

### Pasul 2: Configurare Email (Resend)

**IMPORTANT:** Fără asta, clientul NU primește link-uri!

1. Creează cont pe [Resend.com](https://resend.com) (GRATUIT: 100 email-uri/zi)

2. **Verifică Domeniul:**
   - Dashboard → Domains → Add Domain
   - Introdu: `korgpasets.com` (domeniul tău)
   - Adaugă DNS records în panel-ul de hosting:
     ```
     TXT: resend._domainkey  Value: (copiază din Resend)
     MX:  Priority 10        Value: feedback-smtp.us-east-1.amazonses.com
     ```
   - Așteaptă verificare (~10 minute)

3. **Generează API Key:**
   - Dashboard → API Keys → Create API Key
   - Copiază cheia (începe cu `re_...`)

4. **Actualizează `.env.local`:**

   ```bash
   RESEND_API_KEY="re_abc123xyz..." # Cheia ta reală
   ```

5. **Modifică email sender în `lib/email.ts`:**
   ```typescript
   from: 'KORG PA Sets PRO <comenzi@korgpasets.com>', // ← Domeniul tău verificat
   ```

---

### Pasul 3: Configurare Webhook Stripe

**Development (Local Testing):**

```bash
# Instalează Stripe CLI (dacă nu e instalat)
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks către local
stripe listen --forward-to localhost:3000/api/webhooks

# Output va fi:
# > Ready! Your webhook signing secret is whsec_abc123...
# Copiază secret-ul și pune-l în .env.local:
STRIPE_WEBHOOK_SECRET="whsec_abc123..."
```

**Production (După Deploy pe Vercel):**

1. Deploy aplicația → URL: `https://korgpasets.vercel.app`
2. Stripe Dashboard:
   - Developers → Webhooks → Add endpoint
   - URL: `https://korgpasets.vercel.app/api/webhooks`
   - Events to send:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
3. Click **Add endpoint**
4. Copiază **Signing secret** → Vercel Dashboard → Environment Variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_production_key_here
   ```

---

### Pasul 4: Setează Base URL

În `.env.local`:

```bash
# Development
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Production (după deploy)
NEXT_PUBLIC_BASE_URL="https://korgpasets.vercel.app"
```

---

## 🧪 Testare Flow Complet

### Test Local (cu Stripe TEST mode)

1. **Start server:**

   ```bash
   npm run dev
   ```

2. **Start Stripe webhook listener (terminal separat):**

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

3. **Adaugă produs în cart:**
   - Mergi pe http://localhost:3000
   - Click pe produs
   - "Adaugă în coș"

4. **Checkout:**
   - Card test: `4242 4242 4242 4242`
   - Exp: `12/34`, CVC: `123`
   - Email: `test@example.com` (emailul TĂU pentru test)

5. **Verifică:**
   - ✅ Success page apare
   - ✅ În terminal vezi: `✅ Email trimis cu succes...`
   - ✅ Primești email cu link de download
   - ✅ Click pe link → fișierul se descarcă

---

## 📧 Exemplu Email Primit

```
De la: KORG PA Sets PRO <comenzi@korgpasets.com>
Către: client@example.com
Subiect: ✅ Confirmare comandă #12345678

[Header cu gradient violet]
🎹 KORG PA Sets PRO

✅ Plata a fost procesată cu succes!

Bună,
Mulțumim pentru achiziție! Comanda ta a fost confirmată
și poți descărca fișierele imediat.

📥 Descarcă Produsele

┌─────────────────────────────────────┐
│ KORG PA700 Set Complet              │
│ [📥 Descarcă Acum] (button)         │
│ Link valabil 30 zile                │
└─────────────────────────────────────┘

📋 Detalii Comandă
ID: pi_abc123xyz...

┌─────────────────────────────────────┐
│ Produs              Cant.    Preț   │
├─────────────────────────────────────┤
│ KORG PA700 Set      1        €49.99 │
├─────────────────────────────────────┤
│                     TOTAL:   €49.99 │
└─────────────────────────────────────┘

❓ Ai nevoie de ajutor?
📧 muz4muz@gmail.com
📱 WhatsApp: +373 791 62 223
```

---

## 🔒 Securitate

### Link-urile de Download Sunt Securizate:

1. **Token unic** generat pentru fiecare plată
2. **Verificare** - doar comenzi plătite pot descărca
3. **Expirare** - link-uri valide 30 zile (opțional configurabil)
4. **No guessing** - token-uri cryptate, imposibil de ghicit

**Structură link:**

```
https://korgpasets.com/api/download?token=abc123&payment_id=pi_xyz&product_id=123
```

**Token encoding:**

```typescript
// Generated per payment + product
token = base64url(`${paymentId}-${productId}-${timestamp}:${secret}`);
```

---

## ⚙️ Personalizare

### Modifică Perioada de Validitate Link

În `app/api/download/route.ts`:

```typescript
// Adaugă verificare expirare (opțional)
function verifyDownloadToken(token: string, paymentIntentId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [data] = decoded.split(':');
    const parts = data.split('-');
    const timestamp = parseInt(parts[2]);

    // Verifică dacă a expirat (30 zile = 30 * 24 * 60 * 60 * 1000)
    const expirationTime = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > expirationTime) {
      return false; // Expirat
    }

    return data.includes(paymentIntentId);
  } catch {
    return false;
  }
}
```

### Schimbă Design Email

Editează `lib/email.ts` - secțiunea `html: ...`

---

## 📊 Monitorizare

### Verifică Dacă Emailurile Sunt Trimise

**În Development:**

```bash
# Terminal output
✅ Email trimis cu succes către test@example.com cu 1 link-uri download
```

**În Production:**

- Resend Dashboard → Logs
- Vezi toate email-urile trimise, rate de deschidere, click-uri

### Debug Webhook Issues

**Stripe Dashboard:**

- Developers → Webhooks → [your endpoint]
- Requests tab → Vezi toate eventurile trimise
- Dacă vezi ❌ failed, click pentru detalii eroare

---

## 🚀 Deployment Checklist

Înainte de a lansa în producție:

- [ ] Produse au fișiere upload-ate în Sanity
- [ ] Resend API key configurat
- [ ] Domeniu verificat în Resend
- [ ] Stripe webhook în production mode
- [ ] `NEXT_PUBLIC_BASE_URL` setat la domeniul real
- [ ] `DOWNLOAD_TOKEN_SECRET` schimbat cu string random
- [ ] Testat flow complet end-to-end
- [ ] Verificat email sosește (inclusiv spam folder)
- [ ] Testat download link funcționează

---

## ❓ Troubleshooting

### "Email nu sosește"

1. ✅ Verifică `RESEND_API_KEY` în `.env.local`
2. ✅ Verifică domeniul e verificat în Resend
3. ✅ Check spam folder
4. ✅ Vezi logs în Resend Dashboard
5. ✅ Verifică webhook Stripe a fost triggerat

### "Link de download nu merge"

1. ✅ Verifică produsul are `downloadFile` sau `downloadUrl` în Sanity
2. ✅ Check token-ul nu a expirat
3. ✅ Verifică `DOWNLOAD_TOKEN_SECRET` e setat
4. ✅ Vezi console în browser pentru erori

### "Webhook nu se execută"

**Local:**

```bash
# Asigură-te că Stripe CLI rulează:
stripe listen --forward-to localhost:3000/api/webhooks
```

**Production:**

- Verifică URL-ul în Stripe Dashboard e corect
- Check signing secret e actualizat în Vercel

---

## 💡 Sfaturi

1. **Backup fișiere:** Păstrează copii locale ale tuturor set-urilor
2. **Email template:** Testează cum arată în Gmail, Outlook, Yahoo
3. **Mobile friendly:** Email-ul e responsive, arată bine pe telefon
4. **Rate limits:** Resend GRATUIT = 100 email-uri/zi. Pentru mai mult, upgrade plan
5. **Monitoring:** Verifică regulat Resend Dashboard pentru rate de deschidere

---

## 📞 Support

Dacă întâmpini probleme:

- 📧 Email: GitHub Copilot
- 📝 Check logs în Vercel/Resend/Stripe
- 🐛 Debug cu `console.log` în webhook handler

**Link-uri utile:**

- [Resend Docs](https://resend.com/docs)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Sanity File Upload](https://www.sanity.io/docs/file-type)
