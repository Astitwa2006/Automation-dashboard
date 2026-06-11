'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/components/SocketProvider';
import { Play, CheckCircle2, Activity, Zap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function Dashboard() {
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeRuns: 0,
    successRate: 0,
    leadsScored: 0,
    totalExecutions: 0,
    avgDuration: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentExecutions, setRecentExecutions] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const [workflowsRes, leadsRes, execStatsRes, recentExecsRes] = await Promise.all([
        axios.get(`${API}/api/workflows`),
        axios.get(`${API}/api/leads`),
        axios.get(`${API}/api/executions/stats`),
        axios.get(`${API}/api/executions?limit=5`),
      ]);

      const execStats = execStatsRes.data || {};
      const running = workflowsRes.data.filter(w => w.status === 'running').length;

      setStats({
        totalWorkflows: workflowsRes.data.length,
        activeRuns: running,
        successRate: Math.round(execStats.successRate || 0),
        leadsScored: leadsRes.data.length,
        totalExecutions: execStats.totalExecutions || 0,
        avgDuration: Math.round((execStats.avgDuration || 0) / 1000),
      });

      setRecentExecutions(recentExecsRes.data);

      const wfData = workflowsRes.data.map(w => ({
        name: w.name.split(' ').slice(0, 2).join(' '),
        runs: w.runCount || 0,
        success: w.successCount || 0,
        errors: w.errorCount || 0,
      }));
      setChartData(wfData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!socket) return;
    socket.on('metrics:update', fetchStats);
    socket.on('execution:completed', fetchStats);
    return () => {
      socket.off('metrics:update', fetchStats);
      socket.off('execution:completed', fetchStats);
    };
  }, [socket, fetchStats]);

  const kpis = [
    { label: 'Total Workflows', value: stats.totalWorkflows, icon: Play, accent: '#00E599' },
    { label: 'Active Runs', value: stats.activeRuns, icon: Activity, accent: '#FFB224' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, accent: '#00E599' },
    { label: 'Leads Scored', value: stats.leadsScored, icon: Zap, accent: '#FFB224' },
  ];

  const statusColor = (status) => {
    if (status === 'success') return 'text-[#00E599]';
    if (status === 'error') return 'text-[#FF4D4D]';
    if (status === 'running') return 'text-[#FFB224]';
    return 'text-[#6B6B73]';
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">Overview</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8E8E4]">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="card p-5 transition-colors hover:border-[#2A2A30]"
            style={{ borderLeft: `3px solid ${kpi.accent}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <kpi.icon className="w-4 h-4" style={{ color: kpi.accent }} strokeWidth={1.5} />
              <span className="label">{kpi.label}</span>
            </div>
            <p className="data-value text-3xl font-bold text-[#E8E8E4]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#6B6B73]" strokeWidth={1.5} />
            <span className="label">Execution Stats</span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" vertical={false} />
                <XAxis dataKey="name" stroke="#2A2A30" tick={{ fill: '#6B6B73', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#2A2A30" tick={{ fill: '#6B6B73', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141416', borderColor: '#1E1E22', borderRadius: '6px', color: '#E8E8E4', fontFamily: 'IBM Plex Mono', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="runs" fill="#6B6B73" radius={[3,3,0,0]} name="Total Runs" />
                <Bar dataKey="success" fill="#00E599" radius={[3,3,0,0]} name="Success" />
                <Bar dataKey="errors" fill="#FF4D4D" radius={[3,3,0,0]} name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="card p-5 flex flex-col">
          <span className="label mb-4">Recent Executions</span>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {recentExecutions.length === 0 ? (
              <p className="text-[#3A3A42] text-sm font-mono">No executions yet.</p>
            ) : recentExecutions.map(exec => (
              <div key={exec._id} className="flex items-center justify-between bg-[#0C0C0E] rounded-md px-3 py-2.5 border border-[#1E1E22]">
                <div>
                  <p className="text-sm text-[#E8E8E4] font-medium">
                    {exec.workflowId?.name || 'Workflow'}
                  </p>
                  <p className="font-mono text-[10px] text-[#6B6B73] uppercase tracking-wider mt-0.5">
                    {exec.triggerType} · {exec.steps?.length || 0} steps
                  </p>
                </div>
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${statusColor(exec.status)}`}>
                  {exec.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
