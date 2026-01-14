// Funcție helper pentru generare link (export pentru webhook)
function generateDownloadToken(
  paymentIntentId: string,
  productId: string
): string {
  const secret =
    process.env.DOWNLOAD_TOKEN_SECRET || 'your-secret-key-change-this';
  const data = `${paymentIntentId}-${productId}-${Date.now()}`;
  return Buffer.from(`${data}:${secret}`).toString('base64url');
}

export function generateDownloadLink(
  baseUrl: string,
  paymentIntentId: string,
  productId: string
): string {
  const token = generateDownloadToken(paymentIntentId, productId);
  return `${baseUrl}/api/download?token=${token}&payment_id=${paymentIntentId}&product_id=${productId}`;
}
