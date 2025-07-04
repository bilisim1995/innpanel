"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// Sample data for the pie chart
const sampleData = [
  { name: "Bölge Turları", value: 35, color: "#8884d8" },
  { name: "Motorlu Turlar", value: 25, color: "#82ca9d" },
  { name: "Sıcak Balon", value: 20, color: "#ffc658" },
  { name: "Transfer", value: 15, color: "#ff7c7c" },
  { name: "Diğer", value: 5, color: "#8dd1e1" },
];

interface ReportPieChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  description?: string;
}

export function ReportPieChart({ 
  data = sampleData, 
  title = "Hizmet Kategorileri Dağılımı",
  description = "Toplam hizmetlerin kategorilere göre dağılımı"
}: ReportPieChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Değer: {data.value}
          </p>
          <p className="text-sm text-muted-foreground">
            Yüzde: {((data.value / data.payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total for percentage calculations
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithTotal.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}