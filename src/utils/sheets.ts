import { SheetData } from "@/types";

export async function fetchGoogleSheetsData() {
  console.log("Fetching Google Sheets data...");
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  try {
    // Fetch sheet names
    const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title&key=${apiKey}`;
    const sheetResponse = await fetch(sheetUrl);
    const sheetData = await sheetResponse.json();
    const sheetNames = sheetData.sheets.map(
      (sheet: any) => sheet.properties.title,
    );

    // Fetch data from all sheets
    const allSheetData: Record<string, SheetData> = {};
    for (const sheetName of sheetNames) {
      const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z1000?key=${apiKey}`;
      const dataResponse = await fetch(dataUrl);
      const dataJson = await dataResponse.json();
      const values = dataJson.values || [];

      if (values.length > 0) {
        const headers = values[0];
        const data = values.slice(1).map((row: any[], index: number) => {
          const rowData: Record<string, any> = { id: index + 1 }; // Add unique ID
          headers.forEach((header: string, colIndex: number) => {
            rowData[header] = row[colIndex] || "";
          });
          return rowData;
        });
        allSheetData[sheetName] = { headers, data };
      }
    }

    console.log("Fetched Data:", {
      categories: sheetNames,
      allData: allSheetData,
    });

    return {
      categories: sheetNames,
      allData: allSheetData,
    };
  } catch (error) {
    console.error("Error fetching data: ", error);
    return {
      categories: [],
      allData: {},
    };
  }
}
