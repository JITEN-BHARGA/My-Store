"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartProps {
  data: { name: string; [key: string]: number | string }[];
  dataKey: string; // Which key to plot
  color?: string; // Line color
  title?: string; // Chart title
  height?: number; // Height of the chart in px
}

export default function Chart({
  data,
  dataKey,
  color = "#2563eb",
  title,
  height = 300,
}: ChartProps) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5">
      {title && <h2 className="font-semibold mb-4 text-gray-900">{title}</h2>}

      <div
        className="w-full h-64 sm:h-72 md:h-80 lg:h-96"
        style={{ minHeight: height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
