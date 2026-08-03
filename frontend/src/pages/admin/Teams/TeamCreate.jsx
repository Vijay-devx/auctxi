import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useTeams } from '../../../hooks/useTeams';
import { uploadMedia } from '../../../services/api';

export default function TeamCreate() {
  const navigate = useNavigate();
  const { createTeam } = useTeams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    owner: '',
    status: 'Active',
    budget: '',
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
      let logoUrl = null;
      if (imageFile) {
        const uploadRes = await uploadMedia(imageFile);
        logoUrl = uploadRes.url;
      }

      const payload = {
        name: formData.name,
        abbreviation: formData.abbreviation,
        // Using totalPurse as budget based on typical team DTOs
        totalPurse: parseFloat(formData.budget) || 0, 
        logoUrl: logoUrl,
      };

      await createTeam(payload);
      navigate('/admin/teams');
    } catch (err) {
      console.error('Failed to create team:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to create team. Check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Team"
        description="Create a new team for the auction."
        backUrl="/admin/teams"
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Team Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                placeholder="e.g., Chennai Super Kings"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700">Abbreviation *</label>
              <input
                type="text"
                id="abbreviation"
                name="abbreviation"
                required
                value={formData.abbreviation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                placeholder="e.g., CSK"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner/Representative</label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                placeholder="Name of owner"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Total Budget *</label>
              <input
                type="number"
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                placeholder="e.g., 100000000"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="teamLogo" className="block text-sm font-medium text-gray-700">Team Logo (Optional)</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white flex items-center">
                <input
                  type="file"
                  id="teamLogo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
              {imageFile && <span className="text-xs text-green-600 font-medium">Selected: {imageFile.name}</span>}
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/teams')} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
