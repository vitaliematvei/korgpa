import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { sendDownloadEmail } from '@/lib/email';
import { generateDownloadLink } from '@/app/api/download/downloadLink';
import { client } from '@/sanity/lib/client';

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripeClient();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      return NextResponse.json(
        { error: 'Missing STRIPE_WEBHOOK_SECRET' },
        { status: 500 },
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature' },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: unknown) {
      console.error(
        `❌ Webhook signature verification failed.`,
        err instanceof Error ? err.message : err,
      );
      return NextResponse.json(
        { error: 'Webhook signature error' },
        { status: 400 },
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerEmail = paymentIntent.metadata?.email;
        const items = paymentIntent.metadata?.items
          ? JSON.parse(paymentIntent.metadata.items)
          : [];

        if (customerEmail && items.length > 0) {
          try {
            // Generează link-uri de download pentru fiecare produs
            const baseUrl =
              process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const downloadLinks = [];

            for (const item of items) {
              // Obține detalii produs din Sanity pentru a verifica dacă are fișier
              const product = await client.fetch(
                `*[_type == "product" && _id == $productId][0] {
                  _id,
                  name,
                  "hasDownload": defined(downloadFile) || defined(downloadUrl)
                }`,
                { productId: item.id },
              );

              if (product && product.hasDownload) {
                const downloadUrl = generateDownloadLink(
                  baseUrl,
                  paymentIntent.id,
                  item.id,
                );

                downloadLinks.push({
                  productName: item.name,
                  url: downloadUrl,
                });
              }
            }

            // Trimite email cu link-uri de download
            await sendDownloadEmail(customerEmail, {
              orderId: paymentIntent.id,
              items: items.map(
                (item: { name: string; price: number; quantity: number }) => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                }),
              ),
              total: paymentIntent.amount / 100, // Convert from cents
              downloadLinks,
            });

            console.log(
              `✅ Email trimis cu succes către ${customerEmail} cu ${downloadLinks.length} link-uri download`,
            );
          } catch (emailError) {
            console.error(`📧 Eroare la trimiterea emailului:`, emailError);
          }
        } else {
          console.warn('⚠️ Email client sau items lipsă în metadate');
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', failedPayment.id);
        break;

      default:
        // Unhandled event type - no action needed
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('💥 Webhook handler global error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
