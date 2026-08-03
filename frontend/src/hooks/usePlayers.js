import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing Player data.
 */
export function usePlayers() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPlayers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/v1/players');
            setPlayers(response.data?.content || []);
        } catch (err) {
            console.error("Failed to fetch players:", err);
            setError(err.response?.data?.message || 'Failed to fetch players');
        } finally {
            setLoading(false);
        }
    }, []);

    const createPlayer = async (playerData) => {
        const response = await api.post('/api/v1/players', playerData);
        await fetchPlayers(); 
        return response.data;
    };

    const updatePlayer = async (id, playerData) => {
        const response = await api.put(`/api/v1/players/${id}`, playerData);
        await fetchPlayers();
        return response.data;
    };

    const deletePlayer = async (id) => {
        const response = await api.delete(`/api/v1/players/${id}`);
        await fetchPlayers();
        return response.data;
    };

    const getPlayer = async (id) => {
        const response = await api.get(`/api/v1/players/${id}`);
        return response.data;
    };

    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    return {
        players,
        loading,
        error,
        fetchPlayers,
        createPlayer,
        updatePlayer,
        deletePlayer,
        getPlayer
    };
}
