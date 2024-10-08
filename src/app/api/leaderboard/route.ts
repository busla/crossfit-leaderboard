import { NextRequest, NextResponse } from "next/server";
import { CACHE_CONTROL } from "@/app/constants";

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchWithNoCache(url: string) {
  return fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
const pairColumns = (headers: string[]): Record<string, string> => {
  const pairs: Record<string, string> = {};
  headers.forEach((header) => {
    if (header.endsWith('PR')) {
      const baseHeader = header.slice(0, -2);
      if (headers.includes(baseHeader)) {
        pairs[baseHeader] = header;
      }
    }
  });
  return pairs;
}

export async function GET(request: NextRequest) {
  try {
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`;
    const sheetResponse = await fetchWithNoCache(sheetUrl);
    const sheetData = await sheetResponse.json();

    // Ensure 'sheets' exists and is an array
    if (!sheetData.sheets || !Array.isArray(sheetData.sheets)) {
      console.error("Sheets data is missing or not an array");
      return NextResponse.json(
        { allData: {}, categories: [] },
        {
          headers: {
            "Cache-Control": CACHE_CONTROL,
          },
          status: 200,
        },
      );
    }

    const sheetNames = sheetData.sheets.map(
      (sheet: any) => sheet.properties?.title || "Untitled"
    );

    const allSheetData: Record<string, any> = {};
    for (const sheetName of sheetNames) {
      const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A1:Z1000?key=${API_KEY}`;
      const dataResponse = await fetchWithNoCache(dataUrl);
      const dataJson = await dataResponse.json();
      const values = dataJson.values || [];

      if (values.length > 0) {
        const headers = values[0];
        const columnPairs = pairColumns(headers);

        const data = values.slice(1)
          .filter((row: any[]) => row.some((cell: any) => cell !== ''))
          .map((row: any[], index: number) => {
            const rowData: Record<string, any> = { id: index + 1 };
            let previousRank: number | null = null;

            headers.forEach((header: string, colIndex: number) => {
              if (columnPairs[header]) {
                // This is a WOD column with a corresponding PR column
                const prIndex = headers.indexOf(columnPairs[header]);
                const currentRank = Number(row[prIndex]) || null;

                rowData[header] = {
                  value: row[colIndex] || '',
                  rank: currentRank,
                  rankChange: previousRank !== null && currentRank !== null
                    ? previousRank - currentRank
                    : null
                };

                previousRank = currentRank;
              } else if (!header.endsWith('PR')) {
                // This is a regular column (not a PR column)
                rowData[header] = row[colIndex] || '';
              }
            });
            return rowData;
          });
        allSheetData[sheetName] = { headers, data };
      }
    }

    return NextResponse.json(
      { allData: allSheetData, categories: sheetNames },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
        },
      },
    );
  } catch (error) {
    console.error("Error fetching data: ", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
