# Korg PA Sets Pro - AI Agent Instructions

## Project Overview

E-commerce platform for selling digital Korg PA keyboard sound sets. Built with Next.js 14 (App Router), Sanity CMS, Stripe payments, and automated email delivery.

## Architecture & Key Flows

### Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript, Tailwind CSS 4
- **CMS**: Sanity v3 (embedded Studio at `/studio`)
- **Payments**: Stripe with Payment Intents
- **Email**: Resend API (not Stripe webhooks in development)
- **Storage**: Vercel Blob for digital downloads (public URLs, no expiration)
- **State**: React Context (`CartContext`) + localStorage persistence

### Critical Data Flow: Purchase to Download

```
1. User adds product to cart → CartContext + localStorage (key: 'korgpa_cart')
2. Checkout form → /api/create-payment-intent → Stripe PaymentIntent
3. Stripe payment → redirect to /checkout/success?payment_intent=pi_xxx
4. Success page:
   - Reads payment_intent from URL
   - Retrieves email/items from localStorage
   - Calls /api/send-order-email directly (NOT via webhook)
   - Sends email with secure download links
   - Clears cart and localStorage
```

**IMPORTANT**: Email delivery does NOT rely on Stripe webhooks in development. The `/checkout/success` page triggers email sending directly via `/api/send-order-email`. This workaround is documented in [WORKAROUND_EMAIL_DIRECT.md](WORKAROUND_EMAIL_DIRECT.md).

### Download Security Pattern

Downloads use tokenized URLs generated in [app/api/download/route.ts](app/api/download/route.ts):

- Token format: `base64url(paymentIntentId-productId-timestamp:secret)`
- Verification: Token must contain matching `paymentIntentId`
- No expiration (Vercel Blob limitation documented in [lib/blob-service.ts](lib/blob-service.ts))
- Products can have `downloadFile` (Sanity asset) OR `downloadUrl` (external link)

## Project-Specific Conventions

### Path Aliases

Use `@/` for all imports: `import { client } from '@/sanity/lib/client'`

### Sanity Client Configuration

Always use server-side client from [sanity/lib/client.ts](sanity/lib/client.ts) with `useCdn: false` and auth token. Product schema at [sanity/schemaTypes/product.ts](sanity/schemaTypes/product.ts) includes:

- Required: `name`, `slug`, `price`, `image`
- Optional: `downloadFile` (Sanity asset), `downloadUrl` (external), `gallery`, `youtube`

### Cart Implementation

[app/context/CartContext.tsx](app/context/CartContext.tsx) provides:

- Persistent state (localStorage key: `korgpa_cart`)
- Server-safe hydration with `isLoaded` flag
- Methods: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Auto-calculated `total`

### API Route Patterns

- **Payment Intent**: [app/api/create-payment-intent/route.ts](app/api/create-payment-intent/route.ts) - Creates Stripe PaymentIntent with metadata (items, email)
- **Email Sending**: [app/api/send-order-email/route.ts](app/api/send-order-email/route.ts) - Direct email trigger (bypasses webhooks)
- **Downloads**: [app/api/download/route.ts](app/api/download/route.ts) - Token-verified file delivery
- **Webhooks**: [app/api/webhooks/route.ts](app/api/webhooks/route.ts) - Stripe signature verification (production only)

## Environment Variables

Required `.env.local` variables (see [DEBUG_EMAIL.md](DEBUG_EMAIL.md) and [WORKAROUND_EMAIL_DIRECT.md](WORKAROUND_EMAIL_DIRECT.md)):

```bash
# Stripe (both public/secret keys required)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Only for production webhooks

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_AUTH_TOKEN=...  # Required for private datasets

# Email (Resend)
RESEND_API_KEY=re_...  # NOT placeholder - must be real API key
RESEND_FROM_EMAIL=onboarding@resend.dev  # or verified domain

# Base URL for download links
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or production URL

# Download security
DOWNLOAD_TOKEN_SECRET=...  # Change from default in production

# Optional: Contact form (EmailJS)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

## Development Workflows

### Running the Project

```bash
npm run dev          # Start Next.js dev server (port 3000)
# Sanity Studio available at http://localhost:3000/studio
```

### Email Testing Workarounds

Known issue: Mail.ru and similar providers block Resend emails. For testing:

1. Use Gmail/Outlook instead of Mail.ru ([DEBUG_EMAIL.md](DEBUG_EMAIL.md))
2. Check Resend dashboard (https://resend.com/emails) for delivery status
3. Email sends from `/checkout/success`, NOT from Stripe webhooks in dev
4. Verify `RESEND_API_KEY` is real (not placeholder)

### Stripe Webhook Local Testing (Production Flow)

```bash
stripe listen --forward-to localhost:3000/api/webhooks
# Copy webhook signing secret to STRIPE_WEBHOOK_SECRET
# Webhook triggers email via /api/webhooks/route.ts
```

### Common Debugging Patterns

- Cart not persisting? Check localStorage key `korgpa_cart` in DevTools
- Email not sending? Verify `RESEND_API_KEY` is real, check Resend dashboard
- Download links broken? Token must match `paymentIntentId` from URL
- Sanity data missing? Ensure `SANITY_AUTH_TOKEN` is set for private datasets

## File Organization Patterns

- **API routes**: `app/api/[feature]/route.ts` (Next.js App Router convention)
- **Components**: `app/components/` (shared) or `app/[route]/` (page-specific)
- **Context**: `app/context/` (React Context providers)
- **Sanity config**: `sanity/` directory with `schemaTypes/`, `lib/`, `env.ts`
- **Utilities**: `lib/` (email, blob service, etc.)
- **Documentation**: Root-level `.md` files for debugging/workflow guides

## Known Limitations & Workarounds

1. **Vercel Blob URLs**: No expiration support - returns public URLs directly ([lib/blob-service.ts](lib/blob-service.ts))
2. **Email in Development**: Bypasses Stripe webhooks - success page triggers email directly ([WORKAROUND_EMAIL_DIRECT.md](WORKAROUND_EMAIL_DIRECT.md))
3. **Mail.ru Compatibility**: Use Gmail/Outlook for testing - Mail.ru blocks Resend ([DEBUG_EMAIL.md](DEBUG_EMAIL.md))
4. **Download Token Security**: Simple base64 encoding - upgrade to HMAC for production ([app/api/download/route.ts](app/api/download/route.ts#L5-L15))

## When Making Changes

- **Adding products**: Use Sanity Studio at `/studio` - schema requires name, slug, price, image
- **Modifying checkout**: Update both `/checkout/page.tsx` AND `/checkout/success/page.tsx` for email flow
- **Changing email templates**: Edit [lib/email.ts](lib/email.ts) - uses HTML template strings
- **New API routes**: Follow existing patterns - verify Stripe signature for webhooks, check tokens for downloads
- **Environment changes**: Update both this doc and relevant `.md` files in root

## External Dependencies

- **Stripe API version**: `2025-12-15.clover` (configured in webhook/payment routes)
- **Next.js**: App Router only (no Pages Router)
- **Sanity**: Embedded Studio (not separate deployment)
- **Tailwind**: v4 with PostCSS plugin
