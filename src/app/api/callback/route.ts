import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const callbackData = await req.json();
    console.log("Received callback:", callbackData);

    return NextResponse.json(
      { message: "Callback received successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing callback:", error);
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 },
    );
  }
}
