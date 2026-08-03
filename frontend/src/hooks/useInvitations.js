import { useState, useEffect, useCallback } from 'react';
import { invitationsApi } from '../services/api';
import { toast } from 'react-toastify';

export const useInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Manager method to fetch invitations for a specific auction
  const fetchInvitationsForAuction = useCallback(async (auctionId) => {
    if (!auctionId) return;
    try {
      setLoading(true);
      const { data } = await invitationsApi.getForAuction(auctionId);
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invitationsApi.getMyInvitations();
      setInvitations(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const acceptInvitation = async (invitationId, requestData) => {
    try {
      await invitationsApi.acceptInvitation(invitationId, requestData);
      toast.success('Invitation accepted! Team registered successfully.');
      await fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
      throw err;
    }
  };

  const declineInvitation = async (invitationId) => {
    try {
      await invitationsApi.declineInvitation(invitationId);
      toast.success('Invitation declined.');
      await fetchInvitations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline invitation');
      throw err;
    }
  };

  // Manager method to invite a client
  const inviteClient = async (auctionId, clientId) => {
    try {
      const data = await invitationsApi.inviteClient(auctionId, clientId);
      toast.success('Client invited successfully!');
      // Update local state if we are currently viewing this auction's invitations
      setInvitations(prev => [...prev, data]);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite client');
      throw err;
    }
  };

  return {
    invitations,
    loading,
    error,
    refreshInvitations: fetchInvitations,
    fetchInvitationsForAuction,
    acceptInvitation,
    declineInvitation,
    inviteClient
  };
};
