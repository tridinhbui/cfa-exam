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
  PieChart,
  Pie,
  Legend,
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
  accuracy: number;
  attempts: number;
}

interface PerformanceChartProps {
  weeklyData: PerformanceData[];
  topicData: TopicData[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

export function PerformanceChart({ weeklyData, topicData }: PerformanceChartProps) {
  const pieData = useMemo(() => {
    const sorted = [...topicData].sort((a, b) => b.attempts - a.attempts);
    return sorted.slice(0, 6).map((item) => ({
      name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
      value: item.attempts,
    }));
  }, [topicData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList className="mb-4">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
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
              <BarChart data={topicData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  fontSize={11}
                  width={120}
                  tickFormatter={(value) =>
                    value.length > 15 ? value.slice(0, 15) + '...' : value
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                  {topicData.slice(0, 8).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.accuracy >= 70
                          ? '#10b981'
                          : entry.accuracy >= 50
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="distribution" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value, 'Questions']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


