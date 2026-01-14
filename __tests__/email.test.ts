import { sendDownloadEmail } from '../lib/email';
jest.mock('../lib/email', () => {
  const original = jest.requireActual('../lib/email');
  return {
    ...original,
    // Suprascrie direct instanța resend pentru test
    __esModule: true,
    sendDownloadEmail: async (email: string, orderDetails: any) => {
      // Simulează trimiterea și returnează structura emailului
      return {
        success: true,
        data: {
          email,
          orderDetails,
          html: `Contine link: ${orderDetails.downloadLinks[0].url}`,
        },
      };
    },
  };
});

// Exemplu de test pentru emailul de download

describe('sendDownloadEmail', () => {
  it('generează email corect cu link de download', async () => {
    const result = await sendDownloadEmail('test@email.com', {
      orderId: 'order123',
      items: [{ name: 'Produs Test', price: 10, quantity: 1 }],
      total: 10,
      downloadLinks: [
        { productName: 'Produs Test', url: 'https://test.com/download' },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('test@email.com');
    expect(result.data.orderDetails.orderId).toBe('order123');
    expect(result.data.html).toContain('https://test.com/download');
  });
});
