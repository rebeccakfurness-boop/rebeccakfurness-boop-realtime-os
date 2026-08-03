"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export interface MonthlyCashflow {
  month: string;
  income: number;
  expenses: number;
}

export default function CashflowChart({ data }: { data: MonthlyCashflow[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6F7A8A" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#6F7A8A" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => `$${Number(value ?? 0).toLocaleString()} NZD`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#4C5BD4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#7A8BFF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
