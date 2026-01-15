// @/lib/email.ts
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface DownloadLink {
  productName: string;
  url: string;
}

export async function sendDownloadEmail(
  email: string,
  orderDetails: {
    orderId: string;
    items: OrderItem[];
    total: number;
    downloadLinks: DownloadLink[];
  }
) {
  if (!resend) {
    console.warn('Resend API key not set, skipping email send');
    return { success: false, error: 'API key missing' };
  }

  // Generează HTML pentru produse
  const productsHtml = orderDetails.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  // Generează HTML pentru link-uri download
  const downloadLinksHtml = orderDetails.downloadLinks
    .map(
      (link) => `
    <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #0066cc; border-radius: 4px;">
      <strong style="color: #333;">${link.productName}</strong><br/>
      <a href="${link.url}" 
         style="display: inline-block; margin-top: 10px; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        📥 Descarcă Acum
      </a>
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        Link-ul este valid timp de 30 de zile. Poți descărca fișierul de mai multe ori.
      </p>
    </div>
  `
    )
    .join('');

  try {
    const data = await resend.emails.send({
      from: 'KORG PA Sets PRO <comenzi@korgpasets.com>',
      to: [email],
      subject: `✅ Confirmare comandă #${orderDetails.orderId.slice(-8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎹 KORG PA Sets PRO</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #eee; border-top: none;">
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin-bottom: 25px;">
              <h2 style="color: #155724; margin: 0; font-size: 20px;">✅ Plata a fost procesată cu succes!</h2>
            </div>

            <p style="font-size: 16px; color: #555;">Bună,</p>
            <p style="font-size: 16px; color: #555;">
              Mulțumim pentru achiziție! Comanda ta a fost confirmată și poți descărca fișierele imediat.
            </p>

            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">📥 Descarcă Produsele</h3>
            ${downloadLinksHtml}

            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-top: 30px;">📋 Detalii Comandă</h3>
            <p style="color: #666; font-size: 14px;"><strong>ID Comandă:</strong> ${orderDetails.orderId}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Produs</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Cant.</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Preț</th>
                </tr>
              </thead>
              <tbody>
                ${productsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">TOTAL:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #0066cc;">€${orderDetails.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>💡 Sfat:</strong> Salvează acest email pentru acces viitor la fișiere. Link-urile rămân active 30 de zile.
              </p>
            </div>

            <h3 style="color: #333; margin-top: 30px;">❓ Ai nevoie de ajutor?</h3>
            <p style="color: #555;">
              Dacă întâmpini probleme cu descărcarea sau ai întrebări, contactează-ne:
            </p>
            <ul style="color: #555;">
              <li>📧 Email: <a href="mailto:muz4muz@gmail.com" style="color: #0066cc;">muz4muz@gmail.com</a></li>
              <li>📱 WhatsApp: <a href="https://wa.me/37379162223" style="color: #0066cc;">+37379162223</a></li>
            </ul>

          </div>

          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} KORG PA Sets PRO. Toate drepturile rezervate.
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
              Ialoveni, Moldova | <a href="https://korgpasets.com" style="color: #0066cc;">korgpasets.com</a>
            </p>
          </div>

        </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Eroare Resend:', error);
    throw new Error('Nu am putut trimite emailul.');
  }
}
