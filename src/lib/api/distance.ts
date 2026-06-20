export async function calculateDistance(origin: string, destination: string) {
  try {
    const response = await fetch("/api/distance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin,
        destination,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Distance calculation failed");
    }
    return data;
  } catch (error) {
    console.error("Distance calculation error:", error);
    throw error;
  }
}
