"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import { DataGrid, GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import { styled } from "@mui/material/styles";
import LoadingSpinner from "./spinner";

const REFRESH_INTERVAL = 10000; // 10 seconds

const AnimatedDataGrid = styled(DataGrid)`
  .MuiDataGrid-row {
    transition: background-color 2s ease-in-out;
  }
  .row-updated {
    background-color: rgba(255, 215, 0, 0.5);
  }
`;

interface SheetData {
  headers: string[];
  data: any[];
}

interface RowData extends GridValidRowModel {
  id: string;
  [key: string]: any;
}

interface LeaderboardClientProps {
  initialData: Record<string, SheetData>;
  initialCategories: string[];
  initialTimestamp: string;
}

function LeaderboardClient({
  initialData,
  initialCategories,
  initialTimestamp,
}: LeaderboardClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] =
    useState<Record<string, SheetData>>(initialData);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [category, setCategory] = useState<string>(initialCategories[0] || "");
  const [divisions, setDivisions] = useState<string[]>([]);
  const [division, setDivision] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>(initialTimestamp);
  const [rows, setRows] = useState<RowData[]>([]);
  const [updatedRows, setUpdatedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (allData && categories.length > 0) {
      setIsLoading(false);
    }
  }, [allData, categories]);

  const columns = useMemo(() => {
    if (category && allData[category]) {
      const { headers } = allData[category];
      return [
        { field: "rank", headerName: "Rank", width: 70 },
        ...headers.map((header: string) => ({
          field: header,
          headerName: header,
          flex: 1,
          minWidth: 150,
        })),
      ];
    }
    return [];
  }, [category, allData]);

  useEffect(() => {
    if (category && allData[category] && division) {
      const { data, headers } = allData[category];
      const lastColumnName = headers[headers.length - 1];

      let newRows = data
        .filter((row) => row["Division"] === division)
        .map((row) => ({
          ...row,
          id: row["Athlete"],
          [lastColumnName]: Number(row[lastColumnName]),
        }));

      const updatedIds = new Set<string>();

      newRows = newRows.map((newRow) => {
        const oldRow = rows.find((r) => r.id === newRow.id);
        if (oldRow && oldRow[lastColumnName] !== newRow[lastColumnName]) {
          updatedIds.add(newRow.id);
          return { ...newRow };
        }
        return newRow;
      });

      newRows.sort((a, b) => b[lastColumnName] - a[lastColumnName]);

      newRows = newRows.map((row, index) => ({
        ...row,
        rank: index + 1,
      }));

      if (JSON.stringify(newRows) !== JSON.stringify(rows)) {
        setRows(newRows);
        setUpdatedRows(updatedIds);

        // Clear the updated row set after 5 seconds to allow retriggering
        setTimeout(() => {
          setUpdatedRows(new Set());
        }, 5000);
      }
    }
  }, [category, division, allData, rows]);

  useEffect(() => {
    if (category && allData[category]) {
      const { data } = allData[category];
      const uniqueDivisions = Array.from(
        new Set(data.map((row: any) => row["Division"])),
      );
      setDivisions(uniqueDivisions);
      if (!division || !uniqueDivisions.includes(division)) {
        setDivision(uniqueDivisions[0] || "");
      }
    }
  }, [category, allData, division]);

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

  const refreshData = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/leaderboard?timestamp=${timestamp}`);
      const { allData: newData, categories: newCategories } = await res.json();
      setAllData(newData);
      setCategories(newCategories);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error("Error refreshing data: ", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  const getRowClassName = (params: GridValidRowModel) => {
    return updatedRows.has(params.id as string) ? "row-updated" : "";
  };

  const getRowId = (row: GridValidRowModel): string => {
    return row.id as string;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

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
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </Typography>
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
        {divisions.length > 0 && (
          <Tabs value={division} onChange={handleDivisionChange} centered>
            {divisions.map((div) => (
              <Tab key={div} label={div} value={div} />
            ))}
          </Tabs>
        )}
        <Paper elevation={3}>
          <AnimatedDataGrid
            rows={rows}
            columns={columns}
            autoHeight
            getRowId={getRowId}
            getRowClassName={getRowClassName}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
              sorting: {
                sortModel: [
                  {
                    field: columns[columns.length - 1]?.field || "",
                    sort: "desc",
                  },
                ],
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>
    </Container>
  );
}

export default LeaderboardClient;
