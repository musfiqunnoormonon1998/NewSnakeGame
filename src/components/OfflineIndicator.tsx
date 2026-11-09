import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-xl shadow-amber-950/40 backdrop-blur-md border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-100" />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-300 animate-ping" />
      </div>
      <div>
        <span className="block leading-tight">Offline Mode Active</span>
        <span className="block text-[10px] font-normal text-amber-100/90 leading-tight">
          Cached assets active • Canvas & code interpreter fully operational
        </span>
      </div>
    </div>
  );
};
