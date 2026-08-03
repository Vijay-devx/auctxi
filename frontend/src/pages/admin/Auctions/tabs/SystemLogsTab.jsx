import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { IconTerminal2 } from '@tabler/icons-react';

const SystemLogsTab = () => {
  // Placeholder logs
  const logs = [
    { time: '2026-07-31 10:05:22', level: 'INFO', message: 'Auction State Machine initialized for ID: 763b075b...', source: 'AuctionService' },
    { time: '2026-07-31 10:05:25', level: 'INFO', message: 'Loaded 54 players into Player Pool.', source: 'PlayerService' },
    { time: '2026-07-31 10:06:11', level: 'WARN', message: 'Team "Knights" joined with missing logo document.', source: 'TeamRegistration' },
    { time: '2026-07-31 10:15:00', level: 'INFO', message: 'Auction transitioned from UPCOMING to ONGOING.', source: 'AuctionController' },
    { time: '2026-07-31 10:15:10', level: 'INFO', message: 'Player [ID: p-001] put under the hammer.', source: 'LiveBiddingEngine' },
  ];

  return (
    <Card className="bg-[#0f172a] border-gray-800 text-gray-300">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 bg-[#1e293b] px-4 py-3 border-b border-gray-800 rounded-t-xl">
          <IconTerminal2 size={18} className="text-gray-400" />
          <span className="text-sm font-mono font-medium text-gray-200">System Logs (Mock Data)</span>
        </div>
        
        <div className="p-4 font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-4 mb-2 hover:bg-[#1e293b]/50 p-1 rounded">
              <span className="text-gray-500 whitespace-nowrap">[{log.time}]</span>
              <span className={`font-bold w-12 ${
                log.level === 'INFO' ? 'text-blue-400' :
                log.level === 'WARN' ? 'text-amber-400' :
                log.level === 'ERROR' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {log.level}
              </span>
              <span className="text-purple-400 w-32 truncate" title={log.source}>
                {log.source}
              </span>
              <span className="text-gray-300">
                {log.message}
              </span>
            </div>
          ))}
          <div className="flex gap-4 mt-4 opacity-50">
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemLogsTab;
