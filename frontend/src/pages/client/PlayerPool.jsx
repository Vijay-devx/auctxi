import React, { useState } from 'react';
import { IconSearch, IconFilter, IconLayoutGrid, IconList, IconHeart, IconShieldChevron } from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const PlayerPool = () => {
  const [viewMode, setViewMode] = useState('grid');
  
  // Mock Data
  const players = [
    { id: 1, name: 'Virat Kohli', role: 'Batsman', country: 'India', basePrice: 20000000, currentBid: null, available: true, image: null },
    { id: 2, name: 'Pat Cummins', role: 'Bowler', country: 'Australia', basePrice: 20000000, currentBid: null, available: true, image: null },
    { id: 3, name: 'Ben Stokes', role: 'All-Rounder', country: 'England', basePrice: 20000000, currentBid: null, available: true, image: null },
    { id: 4, name: 'Rashid Khan', role: 'Bowler', country: 'Afghanistan', basePrice: 15000000, currentBid: null, available: true, image: null },
    { id: 5, name: 'Quinton de Kock', role: 'Wicket-Keeper', country: 'South Africa', basePrice: 10000000, currentBid: null, available: true, image: null },
    { id: 6, name: 'Jasprit Bumrah', role: 'Bowler', country: 'India', basePrice: 20000000, currentBid: null, available: true, image: null },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(amount);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Batsman': return 'primary';
      case 'Bowler': return 'success';
      case 'All-Rounder': return 'warning';
      case 'Wicket-Keeper': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="w-full pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Player Pool</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and filter players available in the auction.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search players..." 
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#f59e0b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]"
            />
          </div>

          <Card>
            <CardContent className="p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><IconFilter size={18}/> Filters</h3>
                <button className="text-xs font-medium text-[#f59e0b]">Clear All</button>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Role</h4>
                <div className="space-y-2">
                  {['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#f59e0b] focus:ring-[#f59e0b] border-gray-300" />
                      <span className="text-sm text-gray-600">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Base Price</h4>
                <div className="space-y-2">
                  {['₹2 Cr', '₹1.5 Cr', '₹1 Cr', '₹50 Lakh', '< ₹50 Lakh'].map(price => (
                    <label key={price} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-[#f59e0b] focus:ring-[#f59e0b] border-gray-300" />
                      <span className="text-sm text-gray-600">{price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-sm font-medium text-gray-600 px-3">Showing {players.length} players</span>
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <IconLayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <IconList size={20} />
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {players.map(player => (
                <Card key={player.id} className="overflow-hidden hover:shadow-md transition-all">
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                    <IconShieldChevron size={48} className="text-gray-300" />
                    <button className="absolute top-3 right-3 p-1.5 bg-white/50 backdrop-blur-sm rounded-full text-gray-500 hover:text-red-500">
                      <IconHeart size={18} />
                    </button>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{player.name}</h3>
                      <Badge variant={getRoleColor(player.role)}>{player.role}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{player.country}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Base Price</p>
                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(player.basePrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold">Status</p>
                        <p className="font-bold text-green-600 text-sm">Available</p>
                      </div>
                    </div>
                    
                    <Button variant="black" className="w-full">Place Bid</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Player</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Base Price</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {players.map(player => (
                      <tr key={player.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <IconShieldChevron size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{player.name}</p>
                              <p className="text-xs text-gray-500">{player.country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getRoleColor(player.role)}>{player.role}</Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatCurrency(player.basePrice)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span> Available
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="black" size="sm">Place Bid</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default PlayerPool;
