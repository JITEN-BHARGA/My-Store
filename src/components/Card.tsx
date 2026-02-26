"use client";

interface CardProps {
  title: string;
  value: string | number;
  color?: "blue" | "green" | "amber" | "red" | "indigo"; // optional color
  icon?: React.ReactNode; // optional icon
}

const colorClasses: Record<string, string> = {
  blue: "text-blue-600",
  green: "text-green-600",
  amber: "text-amber-500",
  red: "text-red-600",
  indigo: "text-indigo-600",
};

export default function Card({
  title,
  value,
  color = "blue",
  icon,
}: CardProps) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</h2>
      </div>

      {icon && <div className="text-3xl">{icon}</div>}
    </div>
  );
}
