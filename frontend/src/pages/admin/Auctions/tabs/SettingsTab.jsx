import React, { useState } from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import { IconDeviceFloppy } from '@tabler/icons-react';

const SettingsTab = ({ auction, setAuction }) => {
  const [formData, setFormData] = useState({
    name: auction.name || '',
    baseBudget: auction.rules?.baseBudget || 0,
    bidIncrement: auction.rules?.bidIncrement || 0,
    playersPerTeam: auction.rules?.playersPerTeam || 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        rules: {
          baseBudget: Number(formData.baseBudget),
          bidIncrement: Number(formData.bidIncrement),
          playersPerTeam: Number(formData.playersPerTeam)
        }
      };
      
      const response = await api.put(`/api/v1/auctions/${auction.id}`, payload);
      setAuction(response.data);
      toast.success('Auction settings updated successfully');
    } catch (err) {
      console.error('Failed to update settings', err);
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-8 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Auction Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update the core configurations for this auction. Changes might be restricted if the auction is already ongoing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auction Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Budget per Team (₹)
              </label>
              <input
                type="number"
                name="baseBudget"
                value={formData.baseBudget}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Bid Increment (₹)
              </label>
              <input
                type="number"
                name="bidIncrement"
                value={formData.bidIncrement}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Players per Team
            </label>
            <input
              type="number"
              name="playersPerTeam"
              value={formData.playersPerTeam}
              onChange={handleChange}
              min="1"
              required
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || auction.status !== 'UPCOMING'}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconDeviceFloppy size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {auction.status !== 'UPCOMING' && (
            <p className="text-xs text-red-500 text-right">
              Settings can only be modified when the auction is in UPCOMING status.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
