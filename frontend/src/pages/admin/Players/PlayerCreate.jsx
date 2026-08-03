import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { usePlayers } from '../../../hooks/usePlayers';
import { uploadMedia } from '../../../services/api';

export default function PlayerCreate() {
  const navigate = useNavigate();
  const { createPlayer } = usePlayers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Batter',
    category: 'Capped', // Backend expects category object or ID in a real app, might need adjustment
    basePrice: '',
    country: '',
    matches: '',
    runs: '',
    wickets: '',
    ownerType: 'GLOBAL' // Default to global for admin creation
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadRes = await uploadMedia(imageFile);
        imageUrl = uploadRes.url;
      }

      const payload = {
        name: formData.name,
        role: formData.role.toUpperCase(),
        basePrice: parseFloat(formData.basePrice) || 0,
        country: formData.country,
        ownerType: formData.ownerType,
        imageUrl: imageUrl,
      };

      await createPlayer(payload);
      navigate('/admin/players');
    } catch (err) {
      console.error('Failed to create player:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create player. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Player"
        description="Register a new player for the auction pool."
        backUrl="/admin/players"
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Player Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="e.g., Virat Kohli"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="e.g., India"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                >
                  <option value="BATTER">Batter</option>
                  <option value="BOWLER">Bowler</option>
                  <option value="ALL_ROUNDER">All-rounder</option>
                  <option value="WICKET_KEEPER">Wicketkeeper</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="ownerType" className="block text-sm font-medium text-gray-700">Ownership *</label>
                <select
                  id="ownerType"
                  name="ownerType"
                  value={formData.ownerType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
                >
                  <option value="GLOBAL">Global (Auction Pool)</option>
                  <option value="PRIVATE">Private (Team Specific)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">Base Price (₹) *</label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  required
                  value={formData.basePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="e.g., 20000000"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="playerImage" className="block text-sm font-medium text-gray-700">Player Image (Optional)</label>
                <div className="border border-gray-300 rounded-lg p-2 bg-white flex items-center">
                  <input
                    type="file"
                    id="playerImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>
                {imageFile && <span className="text-xs text-green-600 font-medium">Selected: {imageFile.name}</span>}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="matches" className="block text-sm font-medium text-gray-700">Matches</label>
                <input
                  type="number"
                  id="matches"
                  name="matches"
                  value={formData.matches}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="runs" className="block text-sm font-medium text-gray-700">Runs</label>
                <input
                  type="number"
                  id="runs"
                  name="runs"
                  value={formData.runs}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="wickets" className="block text-sm font-medium text-gray-700">Wickets</label>
                <input
                  type="number"
                  id="wickets"
                  name="wickets"
                  value={formData.wickets}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/players')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Player'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
