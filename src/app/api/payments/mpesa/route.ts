import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, orderId } = await request.json();

    // Validate input
    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Implement actual M-Pesa STK Push integration
    // This would use the Daraja API with your credentials from .env
    // For now, return mock response

    return NextResponse.json({
      success: true,
      message: "M-Pesa payment initiated",
      transactionId: `MPESA_${orderId}_${Date.now()}`,
      checkout_request_id: `MOCK_CHECKOUT_${Date.now()}`,
    });
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    return NextResponse.json(
      { message: "Payment initiation failed" },
      { status: 500 }
    );
  }
}
