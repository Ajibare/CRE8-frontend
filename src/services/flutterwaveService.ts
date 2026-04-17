interface FlutterwaveConfig {
  publicKey: string;
  tx_ref: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name?: string;
    phonenumber?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  callback: (response: { status: string; transaction_id?: string; tx_ref?: string }) => void;
  onclose: () => void;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: FlutterwaveConfig) => void;
  }
}

export class FlutterwaveService {
  private static scriptLoaded = false;

  static async loadScript(): Promise<void> {
    if (this.scriptLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Flutterwave script'));
      };

      document.body.appendChild(script);
    });
  }

  static async initializePayment(config: FlutterwaveConfig): Promise<void> {
    await this.loadScript();

    return new Promise((resolve, reject) => {
      const paymentConfig = {
        ...config,
        callback: (response: { status: string; transaction_id?: string; tx_ref?: string }) => {
          if (response.status === 'successful') {
            config.callback(response);
          } else {
            reject(new Error('Payment was not successful'));
          }
        },
        onclose: () => {
          config.onclose();
        },
      };

      window.FlutterwaveCheckout(paymentConfig);
    });
  }

  static async verifyPayment(transactionId: string): Promise<{ success: boolean; message?: string; data?: unknown }> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/payments/callback?transaction_id=${transactionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      throw error;
    }
  }

  static async initiatePayment(email: string, referralCode?: string): Promise<{ success: boolean; paymentReference: string; amount: number; message?: string; data?: { paymentLink: string; reference: string; tx_ref: string } }> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/payments/initiate-flutterwave-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          referralCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      return data;
    } catch (error) {
      console.error('Flutterwave initiation error:', error);
      throw error;
    }
  }
}

export default FlutterwaveService;
