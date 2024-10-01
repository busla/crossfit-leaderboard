"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Image from 'next/image';
import { Footer, FooterText, HeaderTypography, LastUpdatedTypography } from "./styled"

const REFRESH_INTERVAL = 10000; // 10 seconds

interface SheetData {
  headers: string[];
  data: any[];
}

interface LeaderboardClientProps {
  initialData: Record<string, SheetData>;
  initialCategories: string[];
  initialTimestamp: string;
}


const LeaderboardClient = ({
  initialData,
  initialCategories,
  initialTimestamp,
}: LeaderboardClientProps) => {
  const [allData, setAllData] = useState<Record<string, SheetData>>(initialData);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [category, setCategory] = useState<string>(initialCategories[0] || "");
  const [division, setDivision] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>(initialTimestamp);
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatLastUpdated = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('is-IS', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Atlantic/Reykjavik'
    });
  };
  const updateRowsData = useCallback(() => {
    if (category && allData[category]) {
      const { data } = allData[category];
      let filteredRows = division
        ? data.filter((row) => row["Division"] === division)
        : data;

      // Sort rows based on the "Total" field
      filteredRows.sort((a, b) => parseFloat(b["Total"]) - parseFloat(a["Total"]));

      // Assign ranks after sorting
      filteredRows = filteredRows.map((row, index) => ({
        ...row,
        rank: index + 1,
      }));

      setRows(filteredRows);
    }
  }, [category, division, allData]);

  useEffect(() => {
    updateRowsData();
  }, [updateRowsData]);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/leaderboard?timestamp=${timestamp}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const { allData: newData, categories: newCategories } = await res.json();
      setAllData(newData);
      setCategories(newCategories);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Error refreshing data: ", error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  useEffect(() => {
    refreshData(); // Initial data fetch
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [refreshData]);

  const handleCategoryChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCategory(newValue);
    setDivision("");
  }, []);

  const handleDivisionChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setDivision(newValue);
  }, []);

  const columns: GridColDef[] = React.useMemo(() => {
    if (category && allData[category]) {
      return [
        { field: "rank", headerName: "Rank", width: 70 },
        ...allData[category].headers.map((header) => {
          if (header === "Athlete") {
            return {
              field: header,
              headerName: header,
              flex: 1,
              minWidth: 250,
            };
          }
          return {
            field: header,
            headerName: header,
            flex: 1,
            minWidth: 50,
          };
        }),
      ];
    }
    return [];
  }, [category, allData]);

  const uniqueDivisions = React.useMemo(() => {
    if (category && allData[category]) {
      const divisions = allData[category].data.map((row) => row["Division"]);
      return Array.from(new Set(divisions));
    }
    return [];
  }, [category, allData]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <HeaderTypography variant="h4" component="h1" align="center">
          Íslandsmótið í Crossfit 2024 <span>(undankeppni)</span>
        </HeaderTypography>

        <Box display="flex" justifyContent="center" width="100%" mb={2}>
          <LastUpdatedTypography >
            Síðast uppfært: {formatLastUpdated(lastUpdated)}
          </LastUpdatedTypography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>
        {uniqueDivisions.length > 0 && (
          <Tabs value={division} onChange={handleDivisionChange} centered>
            <Tab key="all" label="All" value="" />
            {uniqueDivisions.map((div) => (
              <Tab key={div} label={div} value={div} />
            ))}
          </Tabs>
        )}
        <Paper elevation={3}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            getRowId={(row) => row.id}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
              sorting: { sortModel: [{ field: "Total", sort: "desc" }] },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Paper>
        <Footer>
          <FooterText variant="body1">
            Í boði
          </FooterText>
          <Image
            src="/images/cfr420.png"
            alt="Logo"
            width={420}
            height={420}
            style={{ width: 'auto', height: '80px' }}
          />
        </Footer>
      </Box>
    </Container>
  );
}

export default LeaderboardClient;
