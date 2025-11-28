"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendChartProps {
  data: Array<{
    date: string
    totalFeedbacks: number
    avgRating: number
  }>
}

export function TrendChart({ data }: TrendChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    avgRating: Number(item.avgRating?.toFixed(2) || 0),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendances des 7 derniers jours</CardTitle>
        <CardDescription>Volume de feedbacks et note moyenne</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalFeedbacks"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Feedbacks"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgRating"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                name="Note moyenne"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
