'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceData {
  date: string;
  accuracy: number;
  questionsAnswered: number;
}

interface TopicData {
  name: string;
  accuracy: number | null;
  attempts: number;
}

interface PerformanceChartProps {
  weeklyData: PerformanceData[];
  topicData: TopicData[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function PerformanceChart({ weeklyData, topicData }: PerformanceChartProps) {


  return (
    <Tabs defaultValue="trend">
      <TabsList className="mb-4">
        <TabsTrigger value="trend">Trend</TabsTrigger>
        <TabsTrigger value="topics">Topics</TabsTrigger>
      </TabsList>

      <TabsContent value="trend" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAccuracy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </TabsContent>

      <TabsContent value="topics" className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicData.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              type="number"
              stroke="var(--muted-foreground)"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="var(--muted-foreground)"
              fontSize={11}
              width={120}
              tickFormatter={(value) =>
                value.length > 15 ? value.slice(0, 15) + '...' : value
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
              {topicData.slice(0, 10).map((entry, index) => {
                const accuracy = entry.accuracy ?? 0;
                let color = '#374151'; // Default Gray for N/A

                if (entry.accuracy !== null) {
                  if (accuracy >= 70) color = '#10b981'; // Emerald 500
                  else if (accuracy >= 50) color = '#f59e0b'; // Amber 500
                  else color = '#ef4444'; // Red 500
                }

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>


    </Tabs>
  );
}


