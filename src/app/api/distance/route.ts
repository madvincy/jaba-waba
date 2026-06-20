import { NextRequest, NextResponse } from "next/server";

const DELIVERY_ORIGIN = "-1.3348,36.7419";
const MAX_DISTANCE_KM = 60;

export async function POST(request: NextRequest) {
  try {
    const { destination } = await request.json();

    if (!destination?.lat || !destination?.lng) {
      return NextResponse.json({ message: "Missing destination coordinates" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Missing GOOGLE_MAPS_API_KEY");
      return NextResponse.json({ message: "Server is not configured with Google Maps API key" }, { status: 500 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
        DELIVERY_ORIGIN,
      )}&destinations=${encodeURIComponent(`${destination.lat},${destination.lng}`)}&key=${encodeURIComponent(apiKey)}`,
    );

    const data = await response.json();
    if (!response.ok || data.status !== "OK") {
      console.error("Google Maps Distance Matrix error", data);
      return NextResponse.json({ message: "Unable to calculate distance" }, { status: 500 });
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return NextResponse.json({ message: "Destination is not reachable" }, { status: 400 });
    }

    const distanceInKm = element.distance?.value ? Number((element.distance.value / 1000).toFixed(1)) : null;
    const durationInMinutes = element.duration?.value ? Math.round(element.duration.value / 60) : null;

    if (distanceInKm === null) {
      return NextResponse.json({ message: "Distance response invalid" }, { status: 500 });
    }

    if (distanceInKm > MAX_DISTANCE_KM) {
      return NextResponse.json({
        success: false,
        distanceInKm,
        durationInMinutes,
        message: `Delivery location is too far. Maximum allowed distance is ${MAX_DISTANCE_KM} km from Freedom Heights, Langata.`,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      distanceInKm,
      durationInMinutes,
      origin: DELIVERY_ORIGIN,
      destination,
    });
  } catch (error) {
    console.error("Distance calculation error:", error);
    return NextResponse.json({ message: "Distance calculation failed" }, { status: 500 });
  }
}
