import { NextRequest, NextResponse } from 'next/server';
import { sendDownloadEmail } from '@/lib/email';
import { generateDownloadLink } from '@/app/api/download/downloadLink';
import { client } from '@/sanity/lib/client';

// API pentru trimitere manuală email cu download links
// Folosit ca workaround când webhook-ul nu funcționează
export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, email, items } = await request.json();

    if (!paymentIntentId || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Generează link-uri de download pentru fiecare produs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const downloadLinks = [];

    for (const item of items) {
      // Obține detalii produs din Sanity pentru a verifica dacă are fișier
      const product = await client.fetch(
        `*[_type == "product" && _id == $productId][0] {
          _id,
          name,
          "hasDownload": defined(downloadFile) || defined(downloadUrl)
        }`,
        { productId: item.id }
      );

      if (product && product.hasDownload) {
        const downloadUrl = generateDownloadLink(
          baseUrl,
          paymentIntentId,
          item.id
        );

        downloadLinks.push({
          productName: item.name,
          url: downloadUrl,
        });
      }
    }

    // Calculează total
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Trimite email cu link-uri de download
    const result = await sendDownloadEmail(email, {
      orderId: paymentIntentId,
      items: items.map(
        (item: { name: string; price: number; quantity: number }) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })
      ),
      total,
      downloadLinks,
    });

    if (result.success) {
      console.log(
        `✅ Email trimis cu succes către ${email} cu ${downloadLinks.length} link-uri download`
      );
      return NextResponse.json({
        success: true,
        downloadLinks: downloadLinks.length,
      });
    } else {
      console.error('❌ Eroare la trimitere email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('💥 Send email error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
