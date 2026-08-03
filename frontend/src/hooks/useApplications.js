import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplicationsForAuction = useCallback(async (auctionId) => {
    if (!auctionId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/applications/auction/${auctionId}`);
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveApplication = async (applicationId) => {
    try {
      await api.post(`/api/v1/applications/${applicationId}/approve`);
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'APPROVED' } : app
      ));
      return true;
    } catch (err) {
      console.error('Error approving application:', err);
      throw err;
    }
  };

  const rejectApplication = async (applicationId) => {
    try {
      await api.post(`/api/v1/applications/${applicationId}/reject`);
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: 'REJECTED' } : app
      ));
      return true;
    } catch (err) {
      console.error('Error rejecting application:', err);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    fetchApplicationsForAuction,
    approveApplication,
    rejectApplication
  };
};
