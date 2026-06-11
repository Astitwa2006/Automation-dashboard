'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '@/components/SocketProvider';
import { Play, Pause, Clock, CheckCircle, XCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const typeLabel = { email_parse: 'Email Parser', lead_score: 'Lead Scoring', data_sync: 'Data Sync' };
const typeAccent = { email_parse: '#FFB224', lead_score: '#00E599', data_sync: '#9B9BA0' };

export default function Workflows() {
  const { socket } = useSocket();
  const [workflows, setWorkflows] = useState([]);
  const [activeExecutions, setActiveExecutions] = useState({});
  const [loadingIds, setLoadingIds] = useState(new Set());

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/workflows`);
      setWorkflows(res.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  useEffect(() => {
    if (!socket) return;

    socket.on('workflow:status', (data) => {
      setWorkflows(prev =>
        prev.map(w => w._id === data.workflowId ? { ...w, ...data } : w)
      );
    });

    socket.on('execution:started', ({ executionId, workflowId }) => {
      setActiveExecutions(prev => ({
        ...prev,
        [workflowId]: { executionId, steps: [], progress: 0 }
      }));
    });

    socket.on('execution:progress', ({ workflowId, step, progress }) => {
      setActiveExecutions(prev => {
        const current = prev[workflowId] || { steps: [], progress: 0 };
        let updatedSteps = [...current.steps];
        if (step) {
          const idx = updatedSteps.findIndex(s => s.name === step.name);
          if (idx >= 0) updatedSteps[idx] = step;
          else updatedSteps.push(step);
        }
        return { ...prev, [workflowId]: { ...current, steps: updatedSteps, progress: progress ?? current.progress } };
      });
    });

    socket.on('execution:completed', ({ workflowId, status }) => {
      setLoadingIds(prev => { const n = new Set(prev); n.delete(workflowId); return n; });
      setActiveExecutions(prev => {
        const updated = { ...prev };
        if (updated[workflowId]) {
          updated[workflowId] = { ...updated[workflowId], status };
          setTimeout(() => setActiveExecutions(p => { const n = { ...p }; delete n[workflowId]; return n; }), 5000);
        }
        return updated;
      });
      fetchWorkflows();
    });

    return () => {
      socket.off('workflow:status');
      socket.off('execution:started');
      socket.off('execution:progress');
      socket.off('execution:completed');
    };
  }, [socket, fetchWorkflows]);

  const triggerWorkflow = async (id) => {
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      await axios.post(`${API}/api/workflows/${id}/trigger`);
    } catch (error) {
      console.error('Trigger error:', error.response?.data || error.message);
      setLoadingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const toggleStatus = async (workflow) => {
    const newStatus = workflow.status === 'paused' ? 'active' : 'paused';
    try {
      await axios.patch(`${API}/api/workflows/${workflow._id}/status`, { status: newStatus });
      setWorkflows(prev => prev.map(w => w._id === workflow._id ? { ...w, status: newStatus } : w));
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const stepStatusIcon = (status) => {
    if (status === 'success') return <CheckCircle className="w-3.5 h-3.5 text-[#00E599]" strokeWidth={1.5} />;
    if (status === 'error') return <XCircle className="w-3.5 h-3.5 text-[#FF4D4D]" strokeWidth={1.5} />;
    if (status === 'running') return <div className="w-3.5 h-3.5 border-[1.5px] border-[#FFB224] border-t-transparent rounded-full animate-spin" />;
    return <div className="w-3.5 h-3.5 rounded-full border border-[#2A2A30]" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">Processes</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8E8E4]">Workflows</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {workflows.map(workflow => {
          const isRunning = loadingIds.has(workflow._id);
          const execData = activeExecutions[workflow._id];
          const accent = typeAccent[workflow.type] || '#6B6B73';

          return (
            <div
              key={workflow._id}
              className="card p-5 flex flex-col gap-4 transition-colors hover:border-[#2A2A30]"
              style={{ borderLeft: `3px solid ${accent}` }}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-[#E8E8E4] flex items-center gap-2">
                    {workflow.name}
                    {isRunning && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: accent }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: accent }} />
                      </span>
                    )}
                  </h3>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] mt-1" style={{ color: accent }}>
                    {typeLabel[workflow.type]}
                  </p>
                </div>
                <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded border ${
                  workflow.status === 'active'
                    ? 'text-[#00E599] border-[#00E599]/20 bg-[#00E599]/5'
                    : workflow.status === 'paused'
                    ? 'text-[#FFB224] border-[#FFB224]/20 bg-[#FFB224]/5'
                    : 'text-[#6B6B73] border-[#2A2A30]'
                }`}>
                  {workflow.status}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-3 text-center">
                  <p className="data-value text-lg font-bold text-[#E8E8E4]">{workflow.runCount || 0}</p>
                  <p className="label mt-1">Runs</p>
                </div>
                <div className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-3 text-center">
                  <p className="data-value text-lg font-bold text-[#00E599]">{workflow.successCount || 0}</p>
                  <p className="label mt-1">Success</p>
                </div>
                <div className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-3 text-center">
                  <p className="data-value text-lg font-bold text-[#FF4D4D]">{workflow.errorCount || 0}</p>
                  <p className="label mt-1">Errors</p>
                </div>
              </div>

              {/* Live Execution Panel */}
              {execData && (
                <div className="bg-[#09090B] border border-[#1E1E22] rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="label">Live Execution</span>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                      execData.status === 'success' ? 'text-[#00E599]' : execData.status === 'error' ? 'text-[#FF4D4D]' : 'text-[#FFB224]'
                    }`}>
                      {execData.status ? execData.status : `${execData.progress || 0}%`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#1E1E22] rounded-full h-1 mb-3">
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{
                        width: `${execData.progress || (execData.status === 'success' ? 100 : 0)}%`,
                        backgroundColor: execData.status === 'error' ? '#FF4D4D' : '#00E599'
                      }}
                    />
                  </div>
                  {/* Steps */}
                  <div className="space-y-1.5">
                    {execData.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {stepStatusIcon(step.status)}
                        <span className={`text-xs font-mono ${step.status === 'running' ? 'text-[#E8E8E4]' : 'text-[#6B6B73]'}`}>
                          {step.name}
                        </span>
                        {step.duration && (
                          <span className="text-[10px] font-mono text-[#3A3A42] ml-auto">{step.duration}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#1E1E22]">
                <button
                  onClick={() => triggerWorkflow(workflow._id)}
                  disabled={isRunning || workflow.status === 'paused'}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center"
                >
                  {isRunning ? (
                    <><div className="w-3.5 h-3.5 border-[1.5px] border-[#0C0C0E]/30 border-t-[#0C0C0E] rounded-full animate-spin" />Running...</>
                  ) : (
                    <><Play className="w-3.5 h-3.5 fill-current" />Trigger</>
                  )}
                </button>
                <button
                  onClick={() => toggleStatus(workflow)}
                  disabled={isRunning}
                  className="btn-secondary flex items-center gap-2"
                  title={workflow.status === 'paused' ? 'Resume workflow' : 'Pause workflow'}
                >
                  {workflow.status === 'paused' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  {workflow.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
