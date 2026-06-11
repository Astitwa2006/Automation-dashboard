'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/components/SocketProvider';
import { Star, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function Leads() {
  const { socket } = useSocket();
  const [leads, setLeads] = useState([]);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/leads`);
      setLeads(res.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!socket) return;
    socket.on('lead:new', ({ lead }) => {
      if (lead) setLeads(prev => [lead, ...prev]);
    });
    return () => socket.off('lead:new');
  }, [socket]);

  const scoreBuckets = [
    { label: '0-25', count: leads.filter(l => l.score <= 25).length },
    { label: '26-50', count: leads.filter(l => l.score > 25 && l.score <= 50).length },
    { label: '51-75', count: leads.filter(l => l.score > 50 && l.score <= 75).length },
    { label: '76-100', count: leads.filter(l => l.score > 75).length },
  ];

  const scoreColor = (score) => {
    if (score >= 80) return 'text-[#00E599]';
    if (score >= 50) return 'text-[#FFB224]';
    return 'text-[#6B6B73]';
  };

  const statusBadge = (status) => {
    const map = {
      new: 'text-[#9B9BA0] border-[#2A2A30]',
      contacted: 'text-[#FFB224] border-[#FFB224]/20',
      qualified: 'text-[#00E599] border-[#00E599]/20',
      converted: 'text-[#00E599] border-[#00E599]/30 bg-[#00E599]/5',
    };
    return map[status] || 'text-[#6B6B73] border-[#2A2A30]';
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">Intelligence</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8E8E4]">Scored Leads</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#6B6B73]" strokeWidth={1.5} />
            <span className="label">Score Distribution</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E22" vertical={false} />
                <XAxis dataKey="label" stroke="#2A2A30" tick={{ fill: '#6B6B73', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#2A2A30" tick={{ fill: '#6B6B73', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#1E1E22', borderRadius: '6px', color: '#E8E8E4', fontFamily: 'IBM Plex Mono', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" fill="#FFB224" radius={[3,3,0,0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-3 text-center">
              <p className="data-value text-xl font-bold text-[#E8E8E4]">{leads.length}</p>
              <p className="label mt-1">Total</p>
            </div>
            <div className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-3 text-center">
              <p className="data-value text-xl font-bold text-[#00E599]">
                {leads.length ? Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length) : 0}
              </p>
              <p className="label mt-1">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#1E1E22] sticky top-0 bg-[#141416]">
                <tr>
                  <th className="px-5 py-3 label">Lead</th>
                  <th className="px-5 py-3 label">Company</th>
                  <th className="px-5 py-3 label">Status</th>
                  <th className="px-5 py-3 label text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-12 text-center text-[#3A3A42] font-mono text-xs">
                      No leads yet — trigger the Lead Scoring workflow.
                    </td>
                  </tr>
                ) : leads.map(lead => (
                  <tr key={lead._id} className="border-b border-[#1E1E22]/50 hover:bg-[#1A1A1E] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#E8E8E4] text-sm">{lead.name || 'Anonymous'}</p>
                      <p className="font-mono text-[10px] text-[#6B6B73] mt-0.5">{lead.email}</p>
                    </td>
                    <td className="px-5 py-3 text-[#9B9BA0] text-sm">{lead.company || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-1 rounded border ${statusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${lead.score >= 75 ? 'fill-[#FFB224] text-[#FFB224]' : 'text-[#2A2A30]'}`} strokeWidth={1.5} />
                        <span className={`data-value font-bold text-base ${scoreColor(lead.score)}`}>{lead.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
