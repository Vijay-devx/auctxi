import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useAuctions } from '../../../hooks/useAuctions';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { IconWallet } from '@tabler/icons-react';

export default function ClientCreateTeamTab({ auctionId, myTeam, myApplication }) {
  const { applyForAuction, fetchAuctions } = useAuctions();
  
  const [formData, setFormData] = useState({
    proposedTeamName: '',
    proposedShortName: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (myTeam) {
      setFormData({
        proposedTeamName: myTeam.name || '',
        proposedShortName: myTeam.shortName || '',
        logoUrl: myTeam.logoUrl || ''
      });
    }
  }, [myTeam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (myTeam) {
        // Update existing team
        await api.put(`/api/v1/teams/${myTeam.id}`, formData);
        setSuccess(true);
      } else {
        // Submit application
        await applyForAuction(auctionId, formData);
        setSuccess(true);
      }
    } catch (err) {
      console.error("Failed to submit team application", err);
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="animate-in fade-in">
      <CardHeader>
        <CardTitle>{myTeam ? 'Team Profile' : 'Create & Join Team'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative text-sm">
            Team updated successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Team Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="proposedTeamName" 
              required 
              value={formData.proposedTeamName} 
              onChange={handleChange} 
              placeholder="e.g. Mumbai Indians"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Short Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="proposedShortName" 
              required 
              value={formData.proposedShortName} 
              onChange={handleChange} 
              placeholder="e.g. MI"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Team Logo (Optional)</label>
            <div className="flex items-center gap-4">
              {formData.logoUrl && (
                <img src={formData.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await api.post('/api/v1/media/upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    setFormData(prev => ({ ...prev, logoUrl: response.data.url }));
                  } catch (err) {
                    console.error('Failed to upload image', err);
                    setError('Failed to upload image. Please try again.');
                  }
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Saving...' : (myTeam ? 'Update Team' : 'Submit Application')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
