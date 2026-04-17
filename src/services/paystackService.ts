// Paystack payment service
declare global {
  interface Window {
    Paystack?: any;
  }
}

export interface PaystackPaymentData {
  email: string;
  amount: number;
  reference: string;
  callback?: (response: any) => void;
  onClose?: () => void;
}

export class PaystackService {
  private static instance: PaystackService;

  static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  // Load Paystack script dynamically
  loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Paystack) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.body.appendChild(script);
    });
  }

  // Initialize payment with Paystack popup
  async initializePayment(paymentData: PaystackPaymentData): Promise<any> {
    try {
      await this.loadPaystackScript();

      return new Promise((resolve, reject) => {
        const handler = (window as any).PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_demo', // Use demo key for testing
          email: paymentData.email,
          amount: paymentData.amount * 100, // Paystack expects amount in kobo (multiply by 100)
          ref: paymentData.reference,
          callback: (response: any) => {
            console.log('Payment successful:', response);
            if (paymentData.callback) {
              paymentData.callback(response);
            }
            resolve(response);
          },
          onClose: () => {
            console.log('Payment popup closed');
            if (paymentData.onClose) {
              paymentData.onClose();
            }
            reject(new Error('Payment cancelled'));
          },
        });

        handler.openIframe();
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Verify payment with backend
  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await fetch(`/api/payments/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }
}

export default PaystackService.getInstance();
