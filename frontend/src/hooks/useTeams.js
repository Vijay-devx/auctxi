import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Custom hook for managing Team data.
 */
export function useTeams() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/v1/teams');
            const data = response.data;
            setTeams(Array.isArray(data) ? data : (data?.content || []));
        } catch (err) {
            console.error("Failed to fetch teams:", err);
            setError(err.response?.data?.message || 'Failed to fetch teams');
        } finally {
            setLoading(false);
        }
    }, []);

    const createTeam = async (teamData) => {
        const response = await api.post('/api/v1/teams', teamData);
        await fetchTeams(); 
        return response.data;
    };

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    return {
        teams,
        loading,
        error,
        fetchTeams,
        createTeam
    };
}
