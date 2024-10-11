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
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  FooterImage,
  Footer,
  FooterText,
  HeaderTypography,
  LastUpdatedTypography,
} from "./styled";
import { IconWithLabel, headerConfig } from "@/app/icons";
import { Remove, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { REFRESH_INTERVAL_SECONDS } from "@/app/constants";

const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_SECONDS * 1000;

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
  return new Date(timestamp).toLocaleString("is-IS", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Atlantic/Reykjavik",
  });
};

const LeaderboardClient = ({
  initialData,
  initialCategories,
  initialTimestamp,
}: LeaderboardClientProps) => {
  const [allData, setAllData] =
    useState<Record<string, SheetData>>(initialData);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [category, setCategory] = useState<string>(initialCategories[0] || "");
  const [division, setDivision] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>(initialTimestamp);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (category && allData[category]) {
      const { data } = allData[category];
      const filteredRows = division
        ? data.filter((row) => row["Division"] === division)
        : [...data];
      return filteredRows.sort((a, b) => a.Rank - b.Rank);
    }
    return [];
  }, [category, division, allData]);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/leaderboard`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { allData: newData, categories: newCategories } = await res.json();

      if (
        newData &&
        Object.keys(newData).length > 0 &&
        newCategories.length > 0
      ) {
        setAllData(newData);
        setCategories(newCategories);
        setLastUpdated(new Date().toISOString());
      } else {
        console.warn("Received empty or invalid data, skipping update.");
      }
    } catch (error) {
      console.error("Error refreshing data: ", error);
      setError(
        `Failed to fetch data: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }, []);

  useEffect(() => {
    refreshData();
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refreshData]);

  const handleCategoryChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setCategory(newValue);
      setDivision("");
    },
    [],
  );

  const handleDivisionChange = useCallback(
    (_event: React.SyntheticEvent, newValue: string) => {
      setDivision(newValue);
    },
    [],
  );

  const columns: GridColDef[] = useMemo(() => {
    if (category && allData[category]) {
      const headers = allData[category].headers;
      const rankIndex = headers.indexOf("Rank");
      if (rankIndex > -1) {
        headers.splice(rankIndex, 1);
        headers.unshift("Rank");
      }
      return headers
        .filter((header) => !header.includes("Division"))
        .map((header) => {
          const config = headerConfig[header] || {
            translation: header,
            showLabel: true,
          };
          return {
            field: header,
            headerName: config.translation,
            flex: 1,
            align: "center",
            headerAlign: "center",
            minWidth: header === "Athlete" ? 250 : 110,
            renderHeader: () =>
              config.icon ? (
                <IconWithLabel
                  icon={config.icon}
                  label={config.showLabel ? config.translation : undefined}
                  iconProps={{ fontSize: "small" }}
                />
              ) : (
                config.translation
              ),
            renderCell: (params) => {
              if (
                params.value &&
                typeof params.value === "object" &&
                "value" in params.value
              ) {
                const { value, overallRank, rankChange } = params.value;
                return (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    <Typography>{value || "-"}</Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ({overallRank})
                      </Typography>
                      {rankChange !== null && (
                        <>
                          {rankChange > 0 ? (
                            <ArrowUpward color="success" fontSize="small" />
                          ) : rankChange < 0 ? (
                            <ArrowDownward color="error" fontSize="small" />
                          ) : (
                            <Remove color="warning" fontSize="small" />
                          )}
                          <Typography
                            variant="caption"
                            color={
                              rankChange > 0
                                ? "success.main"
                                : rankChange < 0
                                  ? "error.main"
                                  : "warning.main"
                            }
                          >
                            {rankChange !== 0 ? Math.abs(rankChange) : ""}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                );
              }
              return <Typography>{params.value || "-"}</Typography>;
            },
          };
        });
    }
    return [];
  }, [category, allData]);

  const uniqueDivisions = useMemo(() => {
    if (category && allData[category]) {
      const divisions = allData[category].data.map((row) => row["Division"]);
      return Array.from(new Set(divisions));
    }
    return [];
  }, [category, allData]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <HeaderTypography variant="h4" component="h1" align="center">
          Íslandsmótið í Crossfit 2024 <span>(undankeppni)</span>
        </HeaderTypography>

        <Box display="flex" justifyContent="center" width="100%" mb={2}>
          <LastUpdatedTypography>
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
          centered={!isMobile}
          variant={isMobile ? "scrollable" : "standard"}
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} value={cat} />
          ))}
        </Tabs>

        {uniqueDivisions.length > 0 && (
          <Tabs
            value={division}
            onChange={handleDivisionChange}
            centered={true}
            variant={"standard"}
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
            <a
              href="https://crossfitreykjavik.is"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FooterImage
                src="/images/cfr420.png"
                alt="Crossfit Reykjavik Logo"
              />
            </a>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <FooterText variant="body1">Með aðstoð</FooterText>
            <a
              href="https://fairgame.is"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FooterImage
                src="/images/fairgame.svg"
                alt="FairGame Sports Logo"
              />
            </a>
          </Box>
        </Footer>
      </Box>
    </Container>
  );
};

export default LeaderboardClient;
