'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/components/SocketProvider';
import { Trash2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const levelColors = {
  info: 'text-[#00E599]',
  warn: 'text-[#FFB224]',
  error: 'text-[#FF4D4D]',
  debug: 'text-[#3A3A42]',
};

export default function Logs() {
  const { socket } = useSocket();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/logs?limit=100`);
      setLogs(res.data.reverse());
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!socket) return;
    socket.on('log:new', ({ log }) => {
      if (log) {
        setLogs(prev => [...prev, log].slice(-500));
      }
    });
    return () => socket.off('log:new');
  }, [socket]);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <p className="label mb-2">Monitor</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8E8E4]">Live Logs</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-0.5 bg-[#141416] border border-[#1E1E22] rounded-md p-0.5">
          {['all', 'info', 'warn', 'error', 'debug'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                filter === level
                  ? 'bg-[#1E1E22] text-[#E8E8E4]'
                  : 'text-[#6B6B73] hover:text-[#9B9BA0]'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[#6B6B73] cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={e => setAutoScroll(e.target.checked)}
            className="accent-[#00E599] w-3 h-3"
          />
          Auto-scroll
        </label>
        <button
          onClick={() => setLogs([])}
          className="btn-secondary flex items-center gap-1.5 text-[10px] py-1.5 px-3"
        >
          <Trash2 className="w-3 h-3" />Clear
        </button>
      </div>

      {/* Terminal */}
      <div className="flex-1 terminal-surface overflow-hidden flex flex-col min-h-[400px]">
        {/* Terminal header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1E1E22] relative z-10">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6B6B73]">
            workflow-engine.log
          </span>
          <span className="font-mono text-[10px] text-[#3A3A42]">
            — {filteredLogs.length} entries
          </span>
          <span className="ml-auto text-[#00E599] animate-cursor font-mono text-xs">▊</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-px relative z-10">
          {filteredLogs.length === 0 ? (
            <div className="text-[#3A3A42] font-mono text-xs py-4">
              {filter === 'all'
                ? '$ waiting for log events — trigger a workflow to see live output...'
                : `$ no ${filter} logs found.`}
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <div
                key={log._id || i}
                className="flex gap-3 px-2 py-1 rounded hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[#3A3A42] whitespace-nowrap text-[11px] pt-px w-16 shrink-0 font-mono">
                  {new Date(log.createdAt || Date.now()).toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className={`text-[10px] font-bold uppercase w-10 shrink-0 pt-px font-mono tracking-wider ${levelColors[log.level] || 'text-[#6B6B73]'}`}>
                  {log.level}
                </span>
                <span className="text-[#9B9BA0] break-all leading-relaxed text-xs font-mono">
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
