"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  ChartTooltip,
  Legend
);

export const CHART_COLORS = {
  green: "#10B981",
  blue: "#2563EB",
  amber: "#F59E0B",
  red: "#EF4444",
  gray: "#444441",
  greenBg: "rgba(16,185,129,0.08)",
  blueBg: "rgba(37,99,235,0.08)",
};

export const DARK_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#555", font: { size: 10 } },
      border: { display: false },
    },
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#555", font: { size: 10 } },
      border: { display: false },
    },
  },
} as const;

export { Line, Bar, Doughnut } from "react-chartjs-2";
