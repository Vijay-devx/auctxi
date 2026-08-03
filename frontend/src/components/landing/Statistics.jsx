import React from 'react';
import { Card, CardContent } from '../ui/Card';

const stats = [
  { label: 'Active Auctions', value: '120+' },
  { label: 'Registered Players', value: '15,000+' },
  { label: 'Managers', value: '850+' },
  { label: 'Clients', value: '300+' },
  { label: 'Successful Auctions', value: '500+' },
];

const Statistics = () => {
  return (
    <div className="bg-gray-50 py-16 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-none bg-transparent">
              <CardContent className="p-4 text-center">
                <div className="text-4xl font-bold text-[#f59e0b] mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
