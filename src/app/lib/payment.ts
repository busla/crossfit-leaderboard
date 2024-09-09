interface PaymentData {
  msisdn: string;
  amount: number;
  description: string;
  orderid: string;
  hmac: string;
  callbackUrl?: string;
  timeout?: number;
  image?: string;
}

interface PaymentResponse {
  code: number;
  message: string;
  token?: string;
  expires?: string;
  deepLink?: string;
}

const API_BASE_URL = process.env.AUR_BASE_URL;

export const createPayment = async (
  paymentData: PaymentData,
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "figo-web-token": process.env.AUR_WEB_TOKEN!,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error creating payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};
