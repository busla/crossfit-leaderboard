import { NextRequest, NextResponse } from "next/server";
import { CACHE_CONTROL } from "@/app/constants";
import { AthleteResult } from "@/app/types";

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RANK_SUFFIX = "R";
const AVG_SUFFIX = "AVG";

const fetchWithNoCache = async (url: string) => {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (!response.ok) {
      throw new Error(`Fetch failed with status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching URL: ", url, error);
    throw error;
  }
};

const pairColumns = (headers: string[]): Record<string, string> => {
  const pairs: Record<string, string> = {};
  headers.forEach((header) => {
    if (header.endsWith(RANK_SUFFIX)) {
      const baseHeader = header.slice(0, -RANK_SUFFIX.length);
      if (headers.includes(baseHeader)) {
        pairs[baseHeader] = header;
      }
    }
  });
  return pairs;
};

const processRowData = (
  headers: string[],
  row: any[],
  columnPairs: Record<string, string>,
  index: number,
): AthleteResult => {
  const rowData: AthleteResult = {
    Rank: 0,
    id: index + 1,
    Division: "",
    Athlete: "",
  };
  const previousOverallRank = { value: null as number | null };

  headers.forEach((header, colIndex) => {
    if (columnPairs[header]) {
      const rankHeader = columnPairs[header];
      const overallRank = Number(row[headers.indexOf(rankHeader)]) || null;
      rowData[header] = {
        value: row[colIndex] || "",
        overallRank: overallRank,
        rankChange:
          previousOverallRank.value !== null && overallRank !== null
            ? previousOverallRank.value - overallRank
            : null,
      };
      previousOverallRank.value = overallRank;
    } else if (!header.endsWith(AVG_SUFFIX) && !header.endsWith(RANK_SUFFIX)) {
      rowData[header] = row[colIndex] || "";
    }
  });

  return rowData;
};

const processSheetData = (headers: string[], values: any[][]) => {
  const columnPairs = pairColumns(headers);
  const processedData = values
    .slice(1)
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row, index) => processRowData(headers, row, columnPairs, index));

  // Reduce processed rows into a structured object by division
  return processedData.reduce((acc: Record<string, any>, row) => {
    const division = row["Division"];
    if (!acc[division]) {
      acc[division] = [];
    }
    acc[division].push(row);
    return acc;
  }, {});
};

export const GET = async (_: NextRequest) => {
  try {
    if (!API_KEY || !SPREADSHEET_ID) {
      throw new Error("Missing API key or Spreadsheet ID");
    }

    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`;
    const sheetData = await fetchWithNoCache(sheetUrl);

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
      (sheet: any) => sheet.properties?.title || "Untitled",
    );

    const fetchPromises = sheetNames.map(async (sheetName: string) => {
      const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A1:Z1000?key=${API_KEY}`;
      try {
        const dataJson = await fetchWithNoCache(dataUrl);
        const values: string[][] = dataJson.values || [];

        if (values.length > 0) {
          const headers: string[] = values[0]; // First row is headers
          const data = processSheetData(headers, values);

          return {
            [sheetName]: data,
          };
        }
      } catch (error) {
        console.error(`Error fetching data for sheet: ${sheetName}`, error);
      }
      return {}; // Return an empty object for failed fetches or empty data
    });

    const allSheetData = Object.assign(
      {},
      ...(await Promise.all(fetchPromises)),
    );

    return NextResponse.json(
      { allData: allSheetData },
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
};
