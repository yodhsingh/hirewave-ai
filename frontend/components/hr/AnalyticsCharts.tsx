'use client';

import { useMemo } from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import { JobStats, Candidate } from '@/types';

// Props interfaces
interface HiringFunnelChartProps {
  stats?: JobStats;
}

interface ApplicationsOverTimeChartProps {
  candidates: Candidate[];
}

interface TimeToHireChartProps {
  candidates: Candidate[];
}

interface CandidateSourcesChartProps {
  candidates: Candidate[];
}

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

export function HiringFunnelChart({ stats }: HiringFunnelChartProps) {
  const funnelData = useMemo(() => {
    if (!stats || stats.total === 0) {
      return [
        { stage: 'Invited', count: 0, percentage: 0 },
        { stage: 'Started', count: 0, percentage: 0 },
        { stage: 'Submitted', count: 0, percentage: 0 },
        { stage: 'Scored', count: 0, percentage: 0 },
        { stage: 'Shortlisted', count: 0, percentage: 0 },
      ];
    }

    const total = stats.total;
    const invited = stats.invited + stats.started + stats.inProgress + stats.submitted + stats.scored + stats.shortlisted + stats.rejected;
    const started = stats.started + stats.inProgress + stats.submitted + stats.scored + stats.shortlisted;
    const submitted = stats.submitted + stats.scored + stats.shortlisted;
    const scored = stats.scored + stats.shortlisted;
    const shortlisted = stats.shortlisted;

    return [
      { stage: 'Invited', count: total, percentage: 100 },
      { stage: 'Started', count: started, percentage: total > 0 ? Math.round((started / total) * 100) : 0 },
      { stage: 'Submitted', count: submitted, percentage: total > 0 ? Math.round((submitted / total) * 100) : 0 },
      { stage: 'Scored', count: scored, percentage: total > 0 ? Math.round((scored / total) * 100) : 0 },
      { stage: 'Shortlisted', count: shortlisted, percentage: total > 0 ? Math.round((shortlisted / total) * 100) : 0 },
    ];
  }, [stats]);

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
          {funnelData.map((stage) => (
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

export function TimeToHireChart({ candidates }: TimeToHireChartProps) {
  // Calculate average time from invitation to submission
  const { timeToHireData, avgDays, trend } = useMemo(() => {
    const completedCandidates = candidates.filter(c => c.submittedAt && c.invitedAt);

    if (completedCandidates.length === 0) {
      return {
        timeToHireData: [],
        avgDays: 0,
        trend: 0
      };
    }

    // Group by month and calculate average days to complete
    const monthlyData: Record<string, { totalDays: number; count: number }> = {};

    completedCandidates.forEach(candidate => {
      const invitedDate = new Date(candidate.invitedAt);
      const submittedDate = new Date(candidate.submittedAt!);
      const daysToComplete = Math.ceil((submittedDate.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));

      const monthKey = invitedDate.toLocaleDateString('en-US', { month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { totalDays: 0, count: 0 };
      }
      monthlyData[monthKey].totalDays += daysToComplete;
      monthlyData[monthKey].count += 1;
    });

    const chartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      days: Math.round(data.totalDays / data.count)
    }));

    // Calculate overall average
    const totalDays = completedCandidates.reduce((sum, c) => {
      const invited = new Date(c.invitedAt);
      const submitted = new Date(c.submittedAt!);
      return sum + Math.ceil((submitted.getTime() - invited.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const average = Math.round(totalDays / completedCandidates.length);

    // Calculate trend (compare recent vs older)
    const sortedByDate = [...completedCandidates].sort((a, b) =>
      new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()
    );

    let trendDiff = 0;
    if (sortedByDate.length >= 2) {
      const recentHalf = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
      const olderHalf = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));

      const recentAvg = recentHalf.reduce((sum, c) => {
        const invited = new Date(c.invitedAt);
        const submitted = new Date(c.submittedAt!);
        return sum + Math.ceil((submitted.getTime() - invited.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / recentHalf.length;

      const olderAvg = olderHalf.reduce((sum, c) => {
        const invited = new Date(c.invitedAt);
        const submitted = new Date(c.submittedAt!);
        return sum + Math.ceil((submitted.getTime() - invited.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / olderHalf.length;

      trendDiff = Math.round(recentAvg - olderAvg);
    }

    return {
      timeToHireData: chartData,
      avgDays: average,
      trend: trendDiff
    };
  }, [candidates]);

  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Time to Complete Trend</CardTitle>
        <p className="text-sm text-gray-400">Average days to complete interview</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {timeToHireData.length > 0 ? (
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
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">
            No completed interviews yet
          </div>
        )}
        <div className="mt-4 flex items-center justify-between px-2">
          <div>
            <p className="text-xs text-gray-400">Current Average</p>
            <p className="text-2xl font-bold text-cyan-400">{avgDays} days</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">vs Previous</p>
            <p className={`text-lg font-semibold ${trend <= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend === 0 ? '-' : `${trend > 0 ? '+' : ''}${trend} days`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CandidateSourcesChart({ candidates }: CandidateSourcesChartProps) {
  // Since source tracking isn't implemented in the backend, show status distribution instead
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      'Invited': 0,
      'In Progress': 0,
      'Submitted': 0,
      'Scored': 0,
      'Shortlisted': 0,
      'Rejected': 0,
    };

    candidates.forEach(candidate => {
      const statusUpper = candidate.status?.toUpperCase() || '';
      switch (statusUpper) {
        case 'INVITED':
          statusCounts['Invited']++;
          break;
        case 'STARTED':
        case 'IN_PROGRESS':
          statusCounts['In Progress']++;
          break;
        case 'SUBMITTED':
        case 'UNDER_REVIEW':
          statusCounts['Submitted']++;
          break;
        case 'SCORED':
          statusCounts['Scored']++;
          break;
        case 'SHORTLISTED':
        case 'HIRED':
          statusCounts['Shortlisted']++;
          break;
        case 'REJECTED':
          statusCounts['Rejected']++;
          break;
      }
    });

    const total = candidates.length || 1;
    const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#22c55e', '#ef4444'];

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value], index) => ({
        name,
        value: Math.round((value / total) * 100),
        count: value,
        color: colors[index % colors.length]
      }));
  }, [candidates]);

  // Custom label render function
  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for small slices

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
        <CardTitle className="text-white">Candidate Status Distribution</CardTitle>
        <p className="text-sm text-gray-400">Current pipeline breakdown</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {statusData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {statusData.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.count} candidates ({source.value}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">
            No candidates yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ApplicationsOverTimeChart({ candidates }: ApplicationsOverTimeChartProps) {
  const applicationsData = useMemo(() => {
    if (candidates.length === 0) return [];

    // Group candidates by week based on invitedAt
    const weeklyData: Record<string, number> = {};

    candidates.forEach(candidate => {
      const invitedDate = new Date(candidate.invitedAt);
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(invitedDate);
      startOfWeek.setDate(invitedDate.getDate() - invitedDate.getDay());
      const weekKey = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    // Convert to array and sort by date
    const sortedWeeks = Object.entries(weeklyData)
      .map(([date, applications]) => ({ date, applications }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8); // Show last 8 weeks max

    return sortedWeeks;
  }, [candidates]);

  return (
    <Card className="bg-white/[0.04] backdrop-blur-md border-white/10">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-white">Invitations Over Time</CardTitle>
        <p className="text-sm text-gray-400">Weekly candidate invitation volume</p>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {applicationsData.length > 0 ? (
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
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-400">
            No invitations yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
