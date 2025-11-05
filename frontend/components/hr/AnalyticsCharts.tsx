'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { gradients } from '@/lib/theme';

// Sample data for hiring funnel
const funnelData = [
  { stage: 'Applied', count: 245, percentage: 100 },
  { stage: 'Screened', count: 180, percentage: 73 },
  { stage: 'Interview', count: 95, percentage: 39 },
  { stage: 'Offer', count: 32, percentage: 13 },
  { stage: 'Hired', count: 28, percentage: 11 },
];

// Sample data for time-to-hire trend
const timeToHireData = [
  { month: 'Jan', days: 28 },
  { month: 'Feb', days: 32 },
  { month: 'Mar', days: 25 },
  { month: 'Apr', days: 30 },
  { month: 'May', days: 22 },
  { month: 'Jun', days: 24 },
];

// Sample data for candidate sources with theme-consistent colors
const sourceData = [
  { name: 'LinkedIn', value: 45, color: '#3b82f6' },
  { name: 'Indeed', value: 28, color: '#06b6d4' },
  { name: 'Referrals', value: 18, color: '#10b981' },
  { name: 'Company Site', value: 9, color: '#f97316' },
];

// Sample data for applications over time
const applicationsData = [
  { date: 'Week 1', applications: 45 },
  { date: 'Week 2', applications: 52 },
  { date: 'Week 3', applications: 38 },
  { date: 'Week 4', applications: 68 },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function HiringFunnelChart() {
  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Hiring Funnel</CardTitle>
        <p className="text-sm text-gray-400">Conversion rates through hiring stages</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={funnelData} layout="vertical">
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis type="number" stroke="#9ca3af" fontSize={12} />
            <YAxis dataKey="stage" type="category" stroke="#9ca3af" width={80} fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="url(#funnelGradient)" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${220 - index * 15}, 70%, ${65 - index * 3}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {funnelData.map((stage, index) => (
            <div key={stage.stage} className="text-center">
              <p className="text-xs text-gray-400">{stage.stage}</p>
              <p className="text-lg font-bold text-white">{stage.percentage}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TimeToHireChart() {
  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Time to Hire Trend</CardTitle>
        <p className="text-sm text-gray-400">Average days to complete hiring</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={timeToHireData}>
            <defs>
              <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="days"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDays)"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between px-2">
          <div>
            <p className="text-xs text-gray-400">Current Average</p>
            <p className="text-2xl font-bold text-cyan-400">24 days</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">vs Last Month</p>
            <p className="text-lg font-semibold text-green-400">-8 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CandidateSourcesChart() {
  // Custom label render function with proper styling
  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#e5e7eb"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs md:text-sm font-medium"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Candidate Sources</CardTitle>
        <p className="text-sm text-gray-400">Where candidates are coming from</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={sourceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {sourceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {sourceData.map((source) => (
            <div key={source.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">{source.name}</p>
                <p className="text-xs text-gray-500">{source.value}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ApplicationsOverTimeChart() {
  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Applications Over Time</CardTitle>
        <p className="text-sm text-gray-400">Weekly application volume</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={applicationsData}>
            <defs>
              <linearGradient id="applicationsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="applications" fill="url(#applicationsGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
