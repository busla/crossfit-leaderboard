"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { SheetData } from "@/types";

const REFRESH_INTERVAL = 60000; // 1 minute in milliseconds

interface LeaderboardAppProps {
  initialData: {
    categories: string[];
    allData: Record<string, SheetData>;
  };
}

function LeaderboardApp({ initialData }: LeaderboardAppProps) {
  const [allData, setAllData] = useState<Record<string, SheetData>>(
    initialData.allData,
  );
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [categories, setCategories] = useState<string[]>(
    initialData.categories,
  );
  const [category, setCategory] = useState<string>(
    initialData.categories[0] || "",
  );
  const [division, setDivision] = useState<string>("Women");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fetchData");
      const data = await response.json();
      setCategories(data.categories);
      setAllData(data.allData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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

      const filteredData = data
        .filter((row) => row["Division"] === division)
        .map((row, index) => ({ ...row, id: index + 1 }));

      setDisplayData(filteredData);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          CrossFit Competition Results
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
        <Tabs value={division} onChange={handleDivisionChange} centered>
          <Tab label="Women" value="Women" />
          <Tab label="Men" value="Men" />
        </Tabs>
        <Paper elevation={3}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
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
              sx={{
                "& .MuiDataGrid-cell:hover": {
                  color: "primary.main",
                },
              }}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default LeaderboardApp;
