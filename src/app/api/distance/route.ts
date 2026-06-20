import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json();

    // Validate input
    if (!origin || !destination) {
      return NextResponse.json(
        { message: "Missing origin or destination" },
        { status: 400 }
      );
    }

    // TODO: Implement actual Google Maps Distance Matrix API call
    // This would use the Google Maps API key from .env
    // For now, return mock response

    // Simulated distance calculation
    const simulatedDistance = Math.random() * 13 + 2;

    return NextResponse.json({
      success: true,
      distanceInKm: Number(simulatedDistance.toFixed(1)),
      durationInMinutes: Math.round(simulatedDistance * 3),
      origin,
      destination,
    });
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json(
      { message: "Distance calculation failed" },
      { status: 500 }
    );
  }
}
