import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { 
  IconGavel, 
  IconUsers, 
  IconShieldCheck, 
  IconDashboard, 
  IconLock, 
  IconSettings, 
  IconTrophy, 
  IconChartBar 
} from '@tabler/icons-react';

const features = [
  {
    title: 'Real-time Bidding',
    description: 'Lightning-fast socket connections ensure every bid is registered instantly without delay.',
    icon: <IconGavel className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Player Management',
    description: 'Comprehensive profiles, stats tracking, and automated categorisation for thousands of players.',
    icon: <IconUsers className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Team Management',
    description: 'Budget tracking, squad composition rules, and automated purse deductions.',
    icon: <IconShieldCheck className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Role-based Dashboards',
    description: 'Dedicated views for Admins, Managers, and Clients with specific permissions and tools.',
    icon: <IconDashboard className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Invite-only Auctions',
    description: 'Keep your local leagues private with secure access codes and manual approvals.',
    icon: <IconLock className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Custom Rule Engine',
    description: 'Set custom base prices, squad limits, purse amounts, and bidding increments.',
    icon: <IconSettings className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Live Leaderboards',
    description: 'Track highest bids, remaining budgets, and team formations in real-time.',
    icon: <IconTrophy className="w-6 h-6 text-[#f59e0b]" />
  },
  {
    title: 'Analytics & Export',
    description: 'Download detailed auction reports, player sold lists, and financial summaries.',
    icon: <IconChartBar className="w-6 h-6 text-[#f59e0b]" />
  }
];

const Features = () => {
  return (
    <div id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to run a successful auction</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From local community leagues to professional tournaments, AuctXI provides enterprise-grade tools tailored for cricket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
