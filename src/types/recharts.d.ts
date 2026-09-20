// Stub TypeScript declarations for recharts
// Utilisé quand le package recharts n'est pas installé localement

declare module 'recharts' {
  import * as React from 'react';

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const ResponsiveContainer: React.FC<ResponsiveContainerProps>;

  export interface LineChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const LineChart: React.FC<LineChartProps>;

  export interface BarChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const BarChart: React.FC<BarChartProps>;

  export interface AreaChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const AreaChart: React.FC<AreaChartProps>;

  export interface PieChartProps {
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const PieChart: React.FC<PieChartProps>;

  export interface RadarChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const RadarChart: React.FC<RadarChartProps>;

  export interface ComposedChartProps {
    data?: any[];
    children?: React.ReactNode;
    [key: string]: any;
  }
  export const ComposedChart: React.FC<ComposedChartProps>;

  export const Line: React.FC<any>;
  export const Bar: React.FC<any>;
  export const Area: React.FC<any>;
  export const Pie: React.FC<any>;
  export const Radar: React.FC<any>;
  export const XAxis: React.FC<any>;
  export const YAxis: React.FC<any>;
  export const CartesianGrid: React.FC<any>;
  export const Tooltip: React.FC<any>;
  export const Legend: React.FC<any>;
  export const Cell: React.FC<any>;
  export const PolarGrid: React.FC<any>;
  export const PolarAngleAxis: React.FC<any>;
  export const PolarRadiusAxis: React.FC<any>;
  export const ReferenceLine: React.FC<any>;
  export const Scatter: React.FC<any>;
  export const ScatterChart: React.FC<any>;
  export const Brush: React.FC<any>;
  export const LabelList: React.FC<any>;
}
