export async function initiateMpesaPayment(phoneNumber: string, amount: number, orderId: string) {
  try {
    const response = await fetch("/api/payments/mpesa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        amount,
        orderId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "M-Pesa payment initiation failed");
    }
    return data;
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    throw error;
  }
}

export async function initiateStripePayment(amount: number, orderId: string) {
  try {
    const response = await fetch("/api/payments/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        orderId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Stripe payment initiation failed");
    }
    return data;
  } catch (error) {
    console.error("Stripe payment error:", error);
    throw error;
  }
}

export async function verifyMpesaPayment(mpesaTransactionId: string) {
  try {
    const response = await fetch("/api/payments/verify-mpesa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mpesaTransactionId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("M-Pesa verification error:", error);
    throw error;
  }
}
