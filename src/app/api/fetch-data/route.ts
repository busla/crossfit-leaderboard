import { NextResponse } from "next/server";
import { fetchGoogleSheetsData } from "@/utils/sheets";

export async function GET() {
  try {
    const data = await fetchGoogleSheetsData();
    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
