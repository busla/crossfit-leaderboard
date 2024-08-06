"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID;
const REFRESH_INTERVAL = 60000; // 60 seconds, adjust as needed

interface SheetData {
  headers: string[];
  data: any[];
}

function LeaderboardApp() {
  const [allData, setAllData] = useState<Record<string, SheetData>>({});
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [divisions, setDivisions] = useState<string[]>([]);
  const [division, setDivision] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const prevDataRef = useRef<any[]>([]);

  const fetchAllData = useCallback(async () => {
    try {
      const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`;
      const sheetResponse = await fetch(sheetUrl);
      const sheetData = await sheetResponse.json();
      const sheetNames = sheetData.sheets.map(
        (sheet: any) => sheet.properties.title,
      );

      const allSheetData: Record<string, SheetData> = {};
      for (const sheetName of sheetNames) {
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A1:Z1000?key=${API_KEY}`;
        const dataResponse = await fetch(dataUrl);
        const dataJson = await dataResponse.json();
        const values = dataJson.values || [];

        if (values.length > 0) {
          const headers = values[0];
          const data = values.slice(1).map((row: any[], index: number) => {
            const rowData: Record<string, any> = { id: index + 1 };
            headers.forEach((header: string, colIndex: number) => {
              rowData[header] = row[colIndex] || "";
            });
            return rowData;
          });
          allSheetData[sheetName] = { headers, data };
        }
      }

      setCategories(sheetNames);
      setAllData(allSheetData);
      if (!category && sheetNames.length > 0) {
        setCategory(sheetNames[0]);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(fetchAllData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchAllData]);

  useEffect(() => {
    if (category && allData[category]) {
      const { headers, data } = allData[category];
      setColumns([
        { field: "id", headerName: "Rank", width: 70 },
        ...headers.slice(1).map((header: string) => ({
          field: header,
          headerName: header,
          flex: 1,
          minWidth: 150,
        })),
      ]);

      const uniqueDivisions = Array.from(
        new Set(data.map((row: any) => row["Division"])),
      );
      setDivisions(uniqueDivisions);

      if (!division || !uniqueDivisions.includes(division)) {
        setDivision(uniqueDivisions[0] || "");
      }
    }
  }, [category, allData, division]);

  useEffect(() => {
    if (category && allData[category] && division) {
      const { data } = allData[category];
      const newFilteredData = data
        .filter((row) => row["Division"] === division)
        .map((row, index) => ({ ...row, id: index + 1 }));

      // Compare new data with previous data
      if (
        JSON.stringify(newFilteredData) !== JSON.stringify(prevDataRef.current)
      ) {
        setDisplayData(newFilteredData);
        prevDataRef.current = newFilteredData;
      }
    }
  }, [category, division, allData]);

  const handleCategoryChange = (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setCategory(newValue);
  };

  const handleDivisionChange = (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setDivision(newValue);
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          color="secondary"
        >
          CrossFit Competition Results
        </Typography>
        <Typography variant="body2">
          Last updated: {lastUpdated.toLocaleString()}
        </Typography>
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          centered
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
        {divisions.length > 0 && (
          <Tabs value={division} onChange={handleDivisionChange} centered>
            {divisions.map((div) => (
              <Tab key={div} label={div} value={div} />
            ))}
          </Tabs>
        )}
        <Paper elevation={3}>
          {loading && displayData.length === 0 ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <DataGrid
              rows={displayData}
              columns={columns}
              autoHeight
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default LeaderboardApp;
