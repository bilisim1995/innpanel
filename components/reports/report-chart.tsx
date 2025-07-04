"use client";

import { Card } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ReportChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string | string[];
  yAxisFormatter?: (value: number) => string;
}

export function ReportChart({ 
  data, 
  xAxisKey, 
  yAxisKey,
  yAxisFormatter = (value) => value.toString()
}: ReportChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey={xAxisKey}
          angle={-45} 
          textAnchor="end" 
          height={70} 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={yAxisFormatter}
          width={80}
        />
        <Tooltip 
          formatter={(value: number) => yAxisFormatter(value)}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        <Bar 
          dataKey={typeof yAxisKey === 'string' ? yAxisKey : yAxisKey[0]} 
          name={typeof yAxisKey === 'string' ? "Değer" : "Rezervasyon"} 
          fill="#dc2626" 
          radius={[4, 4, 0, 0]}
        />
        {Array.isArray(yAxisKey) && yAxisKey.length > 1 && (
          <Bar 
            dataKey={yAxisKey[1]} 
            name="Gelir (₺)" 
            fill="#0ea5e9" 
            radius={[4, 4, 0, 0]}
          />
        )}
        {Array.isArray(yAxisKey) && yAxisKey.length > 1 && (
          <Bar 
            dataKey={yAxisKey[1]} 
            name="Gelir (₺)" 
            fill="#0ea5e9" 
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}