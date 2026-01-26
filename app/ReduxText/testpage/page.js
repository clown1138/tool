"use client";
import * as React from "react";
import { useState,useMemo, useEffect } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Box, Paper, CircularProgress, Typography } from '@mui/material';
import { useSelector, useDispatch } from "react-redux";
import { increment, clear, toggleDisabled } from "../../../lib/features/counterSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function App() {

  const count = useSelector((state) => state.counter?.count);
  const isDisabled = useSelector((state) => state.counter?.isDisabled);
  const dispatch = useDispatch();

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://api.apilayer.com/fixer/timeseries?start_date=2025-01-05&end_date=2025-02-10",
          {
            method: "GET",
            headers: {
              apikey: process.env.NEXT_PUBLIC_FIXER_API_KEY, 
            },
          }
        );

        if (!response.ok) throw new Error("API 請求失敗");

        const data = await response.json();
        setApiData(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); 

  const chartData = useMemo(() => {
    if (!apiData || !apiData.rates) return null;

    const dates = Object.keys(apiData.rates).sort();
    return {
      labels: dates,
      datasets: [
        {
          label: "AFN",
          data: dates.map((date) => apiData.rates[date].AFN),
          backgroundColor: "#76c17a",
          stack: "stack1",
        },
        {
          label: "JPY",
          data: dates.map((date) => apiData.rates[date].JPY),
          backgroundColor: "#5a99f2",
          stack: "stack1",
        },
      ],
    };
  }, [apiData]);

  return (
    <Box >
      <ButtonGroup orientation="vertical" aria-label="Vertical button group">
        <Button
          onClick={() => dispatch(increment())}
          disabled={isDisabled}
        >
          CLICK: {count}
        </Button>
        <Button onClick={() => {
            if (!isDisabled) {
              dispatch(clear());
            }
          }}>
          CLEAR
        </Button>
        <Button onClick={() => dispatch(toggleDisabled())}>
          {isDisabled ? "ABLE" : "DISABLE"}
        </Button>
      </ButtonGroup>
      {error?
        <Typography color="error">發生錯誤: {error}</Typography>
      :
      loading?
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
      :
        <Box sx={{ width: '100%', height: 400, mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3, height: 400, borderRadius: "15px" }}>
            {chartData && (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                  },
                }}
              />
            )}
          </Paper>
        </Box>
      }
    </Box>
  );
}