import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

// Funcție pentru generare token securizat
function generateDownloadToken(
  paymentIntentId: string,
  productId: string
): string {
  const secret =
    process.env.DOWNLOAD_TOKEN_SECRET || 'your-secret-key-change-this';
  const data = `${paymentIntentId}-${productId}-${Date.now()}`;

  // Simple encoding - în producție folosește crypto.createHmac
  return Buffer.from(`${data}:${secret}`).toString('base64url');
}

// Verifică dacă token-ul este valid
function verifyDownloadToken(token: string, paymentIntentId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [data] = decoded.split(':');
    return data.includes(paymentIntentId);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const paymentIntentId = searchParams.get('payment_id');
  const productId = searchParams.get('product_id');

  // Validare parametri
  if (!token || !paymentIntentId || !productId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  // Verifică token-ul
  if (!verifyDownloadToken(token, paymentIntentId)) {
    return NextResponse.json(
      { error: 'Invalid or expired download link' },
      { status: 403 }
    );
  }

  try {
    // Obține produsul din Sanity
    const product = await client.fetch(
      `*[_type == "product" && _id == $productId][0] {
        _id,
        name,
        "downloadFile": downloadFile.asset->url,
        downloadUrl
      }`,
      { productId }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Determină URL-ul de download
    const downloadUrl = product.downloadFile || product.downloadUrl;

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'No download file available for this product' },
        { status: 404 }
      );
    }

    // Redirect către fișier pentru download
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}
