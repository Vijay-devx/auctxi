import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { api } from '../services/api';

export const useLiveAuction = (auctionId, playerId = null, onStateChange = null) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [bids, setBids] = useState([]);

  // Keep a stable ref to the callback to prevent effect dependency issues
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // Fetch initial bid history if a player is on the podium
  useEffect(() => {
    if (auctionId && playerId) {
      api.get(`/api/v1/bidding/${auctionId}/players/${playerId}/history`)
        .then(res => {
          // Map backend BidResponse to UI expected format if needed
          const mappedBids = res.data.map(b => ({
            ...b,
            bidAmount: b.amount,
            teamId: b.team.id,
            teamName: b.team.name
          }));
          setBids(mappedBids);
        })
        .catch(err => console.error("Failed to fetch bid history", err));
    } else {
      setBids([]);
    }
  }, [auctionId, playerId]);

  useEffect(() => {
    if (!auctionId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const serverUrl = `${baseUrl}/ws-auction`;

    const client = new Client({
      webSocketFactory: () => new SockJS(serverUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      // Subscribe to bids for this auction
      client.subscribe(`/topic/auction/${auctionId}/bids`, (message) => {
        if (message.body) {
          const b = JSON.parse(message.body);
          const mappedBid = {
            ...b,
            bidAmount: b.amount,
            teamId: b.team.id,
            teamName: b.team.name
          };
          // Make sure we only append bids for the current player, or just append blindly since UI clears on next player
          setBids((prev) => {
            // Avoid duplicates
            if (prev.some(existing => existing.id === mappedBid.id)) return prev;
            return [mappedBid, ...prev];
          });
          // Tell the UI to fetch the latest auction state (for timer updates)
          if (onStateChangeRef.current) {
            onStateChangeRef.current("BID");
          }
        }
      });

      // Subscribe to state changes (NEXT_PLAYER, SOLD, UNSOLD)
      client.subscribe(`/topic/auction/${auctionId}/state`, (message) => {
        if (message.body && onStateChangeRef.current) {
          onStateChangeRef.current(message.body);
        }
      });
    };

    client.onWebSocketClose = () => setIsConnected(false);
    client.onStompError = (frame) => console.error('STOMP Error:', frame);

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [auctionId]);

  return { isConnected, bids };
};
