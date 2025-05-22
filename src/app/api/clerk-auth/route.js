import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, email, firstName, lastName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Call your backend API to create/update user in MongoDB
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
      }/api/clerk_sync`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          clerkId: userId,
          firstName,
          lastName,
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = "Failed to sync user with database";
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          // If not JSON, just get the text
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from server" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error syncing user with database:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
