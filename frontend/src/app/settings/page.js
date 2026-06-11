'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [copied, setCopied] = useState('');
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const webhooks = [
    { name: 'n8n General Webhook', url: `${backendUrl}/api/webhooks/n8n`, type: 'data_sync' },
    { name: 'Email Parser Webhook', url: `${backendUrl}/api/webhooks/email`, type: 'email_parse' },
    { name: 'CRM Sync Webhook', url: `${backendUrl}/api/webhooks/crm`, type: 'lead_score' }
  ];

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="label mb-2">Configuration</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#E8E8E4]">Settings & Integrations</h1>
      </div>

      <div className="card p-5">
        <span className="label">Webhook Endpoints</span>
        <p className="text-[#6B6B73] text-sm mt-2 mb-6">
          Use these URLs in your n8n workflows (HTTP Request Node) or external services to trigger automations.
        </p>

        <div className="space-y-3">
          {webhooks.map((hook, idx) => (
            <div key={idx} className="bg-[#0C0C0E] border border-[#1E1E22] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[#E8E8E4] font-medium text-sm mb-1.5">{hook.name}</p>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded border text-[#00E599] border-[#00E599]/20">
                  POST
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 md:max-w-md">
                <input 
                  type="text" 
                  readOnly 
                  value={hook.url} 
                  className="bg-[#141416] border border-[#1E1E22] text-[#00E599] font-mono text-xs rounded-md w-full p-2.5 focus:outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(hook.url, idx)}
                  className="p-2.5 border border-[#2A2A30] hover:border-[#6B6B73] rounded-md text-[#9B9BA0] hover:text-[#E8E8E4] transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === idx ? <Check className="w-4 h-4 text-[#00E599]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
