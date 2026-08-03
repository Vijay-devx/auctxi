import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuctions } from '../../../hooks/useAuctions';

const AuctionCreate = () => {
  const navigate = useNavigate();
  const { createAuction } = useAuctions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'mega',
    date: '',
    time: '',
    location: '',
    purseValue: '',
    bidTimer: '30',
    retries: '3',
    maxTeams: '',
    minPlayers: '',
    maxPlayers: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        rules: {
          initialPurse: formData.purseValue ? parseFloat(formData.purseValue) : 0,
          bidTimerSeconds: formData.bidTimer ? parseInt(formData.bidTimer) : 30,
          maxParticipatingTeams: formData.maxTeams ? parseInt(formData.maxTeams) : 10,
          minSquadSize: formData.minPlayers ? parseInt(formData.minPlayers) : 15,
          maxSquadSize: formData.maxPlayers ? parseInt(formData.maxPlayers) : 25,
          autoSellTimeout: formData.retries ? parseInt(formData.retries) : 3,
          minBidAmount: 50,
          bidIncrement: 10,
          maxOverseasPlayers: 4,
          minBatsmen: 0,
          minBowlers: 0,
          minAllRounders: 0,
          minWicketKeepers: 0,
          nominationMethod: 'MANAGER_SELECTION',
          registrationMode: 'MANAGER_APPROVAL',
          allowLateRegistration: false,
          allowUnsoldReentry: false,
          allowOverseas: true,
          allowUncapped: true,
          allowRetired: true,
          allowManagerCreatedPlayers: true
        }
      };
      
      await createAuction(payload);
      navigate('/admin/auctions');
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to create auction. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbs = [
    { label: 'Auctions', href: '/admin/auctions' },
    { label: 'Create Auction' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Create Auction" 
        breadcrumbs={breadcrumbs}
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Auction Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., IPL 2026 Mega Auction"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Auction Type <span className="text-red-500">*</span></label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white transition-shadow"
                  >
                    <option value="mega">Mega Auction</option>
                    <option value="mini">Mini Auction</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Venue</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Taj Hotel, Mumbai"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Auction Rules */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Auction Rules & Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="purseValue" className="block text-sm font-medium text-gray-700">Default Purse Value (₹) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="purseValue"
                    name="purseValue"
                    required
                    value={formData.purseValue}
                    onChange={handleChange}
                    placeholder="e.g., 1000000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bidTimer" className="block text-sm font-medium text-gray-700">Bid Timer (seconds) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="bidTimer"
                    name="bidTimer"
                    required
                    value={formData.bidTimer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="retries" className="block text-sm font-medium text-gray-700">Unsold Retries <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="retries"
                    name="retries"
                    required
                    value={formData.retries}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700">Max Teams <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="maxTeams"
                    name="maxTeams"
                    required
                    value={formData.maxTeams}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minPlayers" className="block text-sm font-medium text-gray-700">Min Players / Team <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="minPlayers"
                    name="minPlayers"
                    required
                    value={formData.minPlayers}
                    onChange={handleChange}
                    placeholder="e.g., 18"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700">Max Players / Team <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="maxPlayers"
                    name="maxPlayers"
                    required
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/auctions')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Auction'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionCreate;
