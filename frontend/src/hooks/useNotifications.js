import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'react-toastify';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/notifications/user/${user.id}`);
      setNotifications(response.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    
    // Background polling fallback (less aggressive since we have WebSockets)
    const interval = setInterval(fetchNotifications, 60000); 

    let client = null;
    if (user?.id) {
       client = new Client({
          webSocketFactory: () => new SockJS('http://localhost:8080/ws-auction'),
          reconnectDelay: 10000,
       });
       
       client.onConnect = () => {
          client.subscribe(`/topic/user-notifications/${user.id}`, (message) => {
             if (message.body) {
                const newNotif = JSON.parse(message.body);
                setNotifications(prev => {
                   if (prev.some(n => n.id === newNotif.id)) return prev;
                   
                   // Show a toast notification for instant visibility
                   toast.info(newNotif.title, {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                   });
                   
                   return [newNotif, ...prev]; // Add to top
                });
             }
          });
       };
       
       client.activate();
    }

    return () => {
       clearInterval(interval);
       if (client) client.deactivate();
    };
  }, [fetchNotifications, user?.id]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
};
