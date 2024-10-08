"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  useMediaQuery,
  useTheme,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { FooterImage, Footer, FooterText, HeaderTypography, LastUpdatedTypography } from "./styled"
import { IconWithLabel, headerConfig } from '@/app/icons'; // Adjust the import path as needed
import { Remove, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { REFRESH_INTERVAL_SECONDS } from '@/app/constants'


const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_SECONDS * 1000

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
      filteredRows.sort((a, b) => {
        const totalA = parseFloat(a["Total"]?.value || a["Total"] || '0');
        const totalB = parseFloat(b["Total"]?.value || b["Total"] || '0');
        return totalA - totalB;
      });

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
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refreshData]);

  const handleCategoryChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setCategory(newValue);
    setDivision("");
  }, []);

  const handleDivisionChange = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setDivision(newValue);
  }, []);


  const columns: GridColDef[] = useMemo(() => {
    if (category && allData[category]) {
      return [
        {
          field: "rank",
          headerName: headerConfig["Rank"].translation,
          width: 70,
          renderHeader: () => (
            <IconWithLabel
              icon={headerConfig["Rank"].icon!}
              iconProps={{ fontSize: 'small' }}
            />
          ),
        },
        ...allData[category].headers
          .filter(header => !header.endsWith('PR'))
          .map((header) => {
            const config = headerConfig[header] || { translation: header, showLabel: true };
            const baseColumn: GridColDef = {
              field: header,
              headerName: config.translation,
              flex: 1,
              minWidth: header === "Athlete" ? 250 : 110,
              renderHeader: () => (
                config.icon ? (
                  <IconWithLabel
                    icon={config.icon}
                    label={config.showLabel ? config.translation : undefined}
                    iconProps={{ fontSize: 'small' }}
                  />
                ) : (
                  config.translation
                )
              ),
              renderCell: (params) => {
                if (params.value && typeof params.value === 'object' && 'value' in params.value) {
                  const { value, rank, rankChange } = params.value;
                  return (
                    <Box display="flex" alignItems="center">
                      <Typography>{value || '-'}</Typography>
                      <Box ml={1} display="flex" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          ({rank})
                        </Typography>
                        {params.field !== 'W1A' && rankChange !== null && rankChange !== 0 && (
                          <>
                            {rankChange > 0 ? (
                              <ArrowUpward color="success" fontSize="small" />
                            ) : (
                              <ArrowDownward color="error" fontSize="small" />
                            )}
                            <Typography variant="caption" color={rankChange > 0 ? "success.main" : "error.main"}>
                              {Math.abs(rankChange)}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  );
                }
                return params.value || '-';
              },
            };
            return baseColumn;
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
        <Box sx={{ mt: 3 }}>
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
        </Box>
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
