import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Custom hook for managing Auction data.
 * Adheres to Phase 1 Data Integration goals.
 */
export function useAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAuctions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [auctionsRes, appsRes] = await Promise.all([
                api.get('/api/v1/auctions'),
                api.get('/api/v1/applications/my-applications').catch(() => ({ data: [] }))
            ]);
            
            const data = auctionsRes.data;
            const parsedData = Array.isArray(data) ? data : (data?.content || []);
            
            // Sort auctions to move COMPLETED to the bottom, and sort by newest first
            parsedData.sort((a, b) => {
                if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
                if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            
            setAuctions(parsedData);
            setMyApplications(appsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch auctions:", err);
            setError(err.response?.data?.message || 'Failed to fetch auctions');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAuctionById = useCallback(async (id) => {
        try {
            const response = await api.get(`/api/v1/auctions/${id}`);
            return response.data;
        } catch (err) {
            console.error(`Failed to fetch auction ${id}:`, err);
            throw err;
        }
    }, []);

    const createAuction = async (auctionData) => {
        const response = await api.post('/api/v1/auctions', auctionData);
        // Note: the newly created auction will be broadcast via websocket,
        // but we can still fetch to be safe, or just return.
        await fetchAuctions(); 
        return response.data;
    };

    const applyForAuction = async (auctionId, applicationData) => {
        const response = await api.post(`/api/v1/applications/auction/${auctionId}`, applicationData);
        await fetchAuctions(); // Refresh applications list
        return response.data;
    };

    const updateAuction = async (id, updateData) => {
        const response = await api.put(`/api/v1/auctions/${id}`, updateData);
        await fetchAuctions();
        return response.data;
    };

    // Initial fetch
    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    // WebSocket connection for real-time new auctions
    useEffect(() => {
        const serverUrl = '/ws-auction';
        const client = new Client({
            webSocketFactory: () => new SockJS(serverUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            client.subscribe('/topic/auctions', (message) => {
                if (message.body) {
                    const newAuction = JSON.parse(message.body);
                    setAuctions(prev => {
                        // Prevent duplicates
                        if (prev.some(a => a.id === newAuction.id)) return prev;
                        // Add new auction at the top
                        return [newAuction, ...prev];
                    });
                }
            });
        };

        client.onStompError = (frame) => console.error('STOMP Error:', frame);
        
        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    return {
        auctions,
        myApplications,
        loading,
        error,
        fetchAuctions,
        fetchAuctionById,
        createAuction,
        updateAuction,
        applyForAuction
    };
}
