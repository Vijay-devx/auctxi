import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';

const upcomingAuctions = [
  {
    id: 1,
    name: "Premier Cricket League 2026",
    organizer: "PCL Management",
    date: "Aug 15, 2026",
    location: "Mumbai, India",
    status: "Registration Open",
    slots: 2,
    totalSlots: 10
  },
  {
    id: 2,
    name: "Corporate Bash Season 5",
    organizer: "TechSports Inc.",
    date: "Sep 02, 2026",
    location: "Bangalore, India",
    status: "Registration Open",
    slots: 4,
    totalSlots: 8
  },
  {
    id: 3,
    name: "Winter Cup 2026",
    organizer: "Delhi Cricket Assoc",
    date: "Dec 10, 2026",
    location: "Delhi, India",
    status: "Coming Soon",
    slots: 6,
    totalSlots: 6
  }
];

const UpcomingAuctions = () => {
  return (
    <div id="auctions" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upcoming Auctions</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Register your team or join as a player in these upcoming prestigious cricket leagues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingAuctions.map((auction) => (
            <Card key={auction.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={auction.status === "Registration Open" ? "success" : "neutral"}>
                    {auction.status}
                  </Badge>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {auction.slots} slots left
                  </span>
                </div>
                <CardTitle className="text-xl mt-2">{auction.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">by {auction.organizer}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <IconCalendar className="w-4 h-4 mr-2 text-gray-400" />
                    {auction.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <IconMapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {auction.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <IconUsers className="w-4 h-4 mr-2 text-gray-400" />
                    {auction.totalSlots - auction.slots}/{auction.totalSlots} Teams Registered
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingAuctions;
