import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from "chart.js";

// Register all core Chart.js controllers and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export { ChartJS };

// Helper to get unified Chart.js theme options
export function getChartThemeOptions(isDark: boolean = true): {
  textColor: string;
  gridColor: string;
  tooltipBg: string;
  tooltipBorder: string;
} {
  return {
    textColor: isDark ? "#a1a1aa" : "#64748b",
    gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
    tooltipBg: isDark ? "rgba(18, 18, 22, 0.95)" : "rgba(255, 255, 255, 0.98)",
    tooltipBorder: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.1)",
  };
}
