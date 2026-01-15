import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const event = await request.json();

  // Stripe Checkout: prefer 'checkout.session.completed' pentru email, produse și client
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Exemplu: extrage emailul și produsele din session
    const email = session.customer_details?.email || session.customer_email;
    const paymentIntentId = session.payment_intent;
    // Dacă ai salvat produsele în metadata, extrage-le aici
    const items = session.metadata?.items
      ? JSON.parse(session.metadata.items)
      : [];

    // Apelează endpointul de trimitere email cu link download
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        email,
        items,
      }),
    });
  }

  // Stripe PaymentIntent: fallback pentru 'payment_intent.succeeded'
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const email = paymentIntent.receipt_email;
    const paymentIntentId = paymentIntent.id;
    const items = paymentIntent.metadata?.items
      ? JSON.parse(paymentIntent.metadata.items)
      : [];

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        email,
        items,
      }),
    });
  }

  return NextResponse.json({ received: true });
}
