"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FooterImage, Footer, FooterText, HeaderTypography, LastUpdatedTypography } from "./styled"
const REFRESH_INTERVALSECONDS = 15000;

interface SheetData {
  headers: string[];
  data: any[];
}

interface LeaderboardClientProps {
  initialData: Record<string, SheetData>;
  initialCategories: string[];
  initialTimestamp: string;
}

const formatLastUpdated = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('is-IS', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Atlantic/Reykjavik'
  });
};

const headerTranslations: { [key: string]: string } = {
  "Division": "Undirflokkur",
  "Athlete": "Keppandi",
  "Total": "Heildarstig",
  "Rank": "Sæti",
  "All": "Allir",
  "Men": "Karlar",
  "Women": "Konur",
};

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

  const updateRowsData = useCallback(() => {
    if (category && allData[category]) {
      const { data } = allData[category];
      let filteredRows = division
        ? data.filter((row) => row["Division"] === division)
        : data;

      // Sort rows based on the "Total" field, lower scores first
      filteredRows.sort((a, b) => parseFloat(a["Total"]) - parseFloat(b["Total"]));

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
      const res = await fetch(`/api/leaderboard`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { allData: newData, categories: newCategories } = await res.json();

      // Ensure data is valid before setting state
      if (newData && Object.keys(newData).length > 0 && newCategories.length > 0) {
        setAllData(newData);
        setCategories(newCategories);
        setLastUpdated(new Date().toISOString());
      } else {
        console.warn("Received empty or invalid data, skipping update.");
      }
    } catch (error) {
      console.error("Error refreshing data: ", error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  useEffect(() => {
    refreshData(); // Initial data fetch
    const intervalId = setInterval(refreshData, REFRESH_INTERVALSECONDS);
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
        {
          field: "rank",
          headerName: headerTranslations["Rank"] || "Rank",
          width: 70,
          minWidth: 70,  // Set a minimum width to avoid truncation
        },
        ...allData[category].headers.map((header) => {
          if (header === "Athlete") {
            return {
              field: header,
              headerName: headerTranslations[header] || header,
              flex: 1, // Allow it to grow and shrink dynamically
              minWidth: 250, // Larger minimum width for important content
            };
          }
          return {
            field: header,
            headerName: headerTranslations[header] || header,
            flex: 1, // Enable flexibility for columns
            minWidth: 110, // Ensure enough space for content to avoid truncation
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screen size
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
          centered={!isMobile} // Centered only on desktop
          variant={isMobile ? "scrollable" : "standard"} // Scrollable on mobile, standard on desktop
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>

        {uniqueDivisions.length > 0 && (
          <Tabs
            value={division}
            onChange={handleDivisionChange}
            centered={true} // Centered only on desktop
            variant={"standard"} // Scrollable on mobile, standard on desktop
          >
            <Tab key="all" label="Allir" value="" />
            {uniqueDivisions.map((div) => (
              <Tab key={div} label={div} value={div} />
            ))}
          </Tabs>
        )}
        {rows.length > 0 ? (
          <Paper elevation={3}>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              getRowId={(row) => row.id}
              initialState={{
                pagination: { paginationModel: { pageSize: 100, page: 0 } },
                sorting: { sortModel: [{ field: "rank", sort: "asc" }] },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
            />
          </Paper>
        ) : (
          <Alert severity="info">Sæki stigatöflu ...</Alert>
        )}
        <Footer>
          <Box display="flex" alignItems="center" gap={2}>
            <FooterText variant="body1">Í boði</FooterText>
            <a href="https://crossfitreykjavik.is" target="_blank" rel="noopener noreferrer">
              <FooterImage
                src="/images/cfr420.png"
                alt="Crossfit Reykjavik Logo"
              />
            </a>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <FooterText variant="body1">Með aðstoð</FooterText>
            <a href="https://fairgame.is" target="_blank" rel="noopener noreferrer">
              <FooterImage
                src="/images/fairgame.svg"
                alt="FairGame Sports Logo"
              />
            </a>
          </Box>
        </Footer>
      </Box>
    </Container >
  );
}

export default LeaderboardClient;
