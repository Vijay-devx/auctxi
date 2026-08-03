import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { IconCircleCheck, IconCircleDashed, IconClock } from '@tabler/icons-react';

const TimelineTab = () => {
  const steps = [
    { title: 'Auction Created', description: 'The auction rules and base budget were defined.', status: 'completed', time: 'Initial' },
    { title: 'Teams Registered', description: 'Participating teams joined the auction.', status: 'completed', time: 'Pre-Auction' },
    { title: 'Player Pool Finalized', description: 'Players were assigned and verified for the auction.', status: 'completed', time: 'Pre-Auction' },
    { title: 'Auction Started', description: 'The live bidding engine was activated by the manager.', status: 'current', time: 'Now' },
    { title: 'Auction Completed', description: 'All players were auctioned or passed.', status: 'pending', time: 'Upcoming' },
  ];

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Auction Lifecycle</h2>
          <p className="text-sm text-gray-500 mt-1">
            This is a placeholder for the event-sourced timeline feature which is currently under development.
          </p>
        </div>

        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={index} className="flex group">
              {/* Timeline vertical line & icon */}
              <div className="flex flex-col items-center mr-4 md:mr-6">
                <div className="bg-white p-1 z-10 rounded-full">
                  {step.status === 'completed' && <IconCircleCheck className="w-6 h-6 text-emerald-500" />}
                  {step.status === 'current' && <div className="w-6 h-6 rounded-full border-4 border-amber-100 bg-amber-500 animate-pulse"></div>}
                  {step.status === 'pending' && <IconCircleDashed className="w-6 h-6 text-gray-300" />}
                </div>
                {/* Vertical line connecting to next item */}
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 min-h-[40px] my-1"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mt-1">
                  <div>
                    <div className={`text-base font-bold ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {step.title}
                    </div>
                    <p className={`text-sm mt-1 ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md w-fit whitespace-nowrap">
                    <IconClock size={14} />
                    {step.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineTab;
