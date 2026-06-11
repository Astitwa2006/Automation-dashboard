'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Workflow, ScrollText, Users, Settings } from 'lucide-react';
import { useSocket } from './SocketProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useSocket();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflows', path: '/workflows', icon: Workflow },
    { name: 'Live Logs', path: '/logs', icon: ScrollText },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-60 bg-[#0C0C0E] border-r border-[#1E1E22] flex flex-col select-none">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1E1E22]">
        <div className="flex items-center gap-2.5">
          <span className="text-[#00E599] font-mono text-lg font-bold leading-none">▸</span>
          <div>
            <h1 className="font-mono text-xs font-bold tracking-[0.2em] text-[#E8E8E4] uppercase">
              Automation
            </h1>
            <p className="font-mono text-[10px] tracking-[0.15em] text-[#6B6B73] uppercase mt-0.5">
              Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors relative ${
                isActive
                  ? 'text-[#E8E8E4] bg-[#141416]'
                  : 'text-[#6B6B73] hover:text-[#9B9BA0] hover:bg-[#141416]/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#00E599] rounded-r-full" />
              )}
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#00E599]' : ''}`} strokeWidth={1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-4 py-4 border-t border-[#1E1E22]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center h-2 w-2">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E599] opacity-60" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-[#00E599]' : 'bg-[#FF4D4D]'}`} />
          </div>
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#6B6B73]">
            {isConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
