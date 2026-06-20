import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { mpesaTransactionId } = await request.json();

    // Validate input
    if (!mpesaTransactionId) {
      return NextResponse.json(
        { message: "Missing transaction ID" },
        { status: 400 }
      );
    }

    // TODO: Implement actual M-Pesa transaction verification
    // This would query the M-Pesa API or webhook data
    // For now, return mock response

    return NextResponse.json({
      success: true,
      verified: true,
      amount: 1000,
      status: "completed",
      message: "Transaction verified",
    });
  } catch (error) {
    console.error("M-Pesa verification error:", error);
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}
