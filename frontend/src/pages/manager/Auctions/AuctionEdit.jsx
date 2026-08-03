import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import Card, { CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

const AuctionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
  });

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await api.get(`/api/v1/auctions/${id}`);
        const auction = response.data;
        // Format date/time if needed
        let d = '', t = '';
        if (auction.scheduledTime) {
           const dateObj = new Date(auction.scheduledTime);
           d = dateObj.toISOString().split('T')[0];
           t = dateObj.toTimeString().split(' ')[0].substring(0,5);
        }
        
        setFormData({
          name: auction.name || '',
          date: d,
          time: t,
          location: auction.location || '',
        });
      } catch (err) {
        console.error("Failed to fetch auction:", err);
        setErrorMsg("Failed to load auction data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

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
        name: formData.name
      };
      
      await api.put(`/api/v1/auctions/${id}`, payload);
      toast.success("Auction updated successfully!");
      navigate(`/manager/auctions/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to update auction. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading auction details...</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Edit Auction" 
        breadcrumbs={[
          { label: 'Auctions', href: '/manager/auctions' },
          { label: 'Edit Auction' }
        ]}
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Auction Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Time <span className="text-red-500">*</span></label>
                <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Location / Venue</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-8 gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(`/manager/auctions/${id}`)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionEdit;
