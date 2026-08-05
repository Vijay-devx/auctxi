import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  // Node.js API Gateway is the single public entry point
  baseURL: import.meta.env.VITE_API_BASE_URL || '', 
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

/**
 * Axios Interceptor for JWT Authentication
 * 
 * EXECUTION FLOW:
 * 1. Every time a component makes an API request (e.g., api.get('/users')), this interceptor catches it.
 * 2. It looks in the browser's localStorage for a JWT token (saved during the Login phase).
 * 3. If found, it automatically attaches `Authorization: Bearer <token>` to the request headers.
 * 4. This guarantees that the Spring Boot backend (`JwtAuthenticationFilter`) will recognize the user.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    toast.error(message);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only force redirect if it wasn't the login endpoint that caused the 401
      if (error.config && !error.config.url.includes('/api/v1/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// paymentApi routes through the Gateway as well
const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

paymentApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

paymentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Payment Service Error';
    toast.error(message);
    return Promise.reject(error);
  }
);

/**
 * Utility function to upload media files (images, logos)
 */
export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/v1/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Bidding API Endpoints
 */
export const biddingApi = {
  getBidHistory: async (auctionId, playerId) => {
    const response = await api.get(`/api/v1/bidding/${auctionId}/players/${playerId}/history`);
    return response.data;
  }
};

/**
 * Invitations API Endpoints
 */
export const invitationsApi = {
  getMyInvitations: async () => {
    const response = await api.get('/api/v1/invitations/my-invitations');
    return response.data;
  },
  acceptInvitation: async (invitationId, requestData) => {
    const response = await api.post(`/api/v1/invitations/${invitationId}/accept`, requestData);
    return response.data;
  },
  declineInvitation: async (invitationId) => {
    const response = await api.post(`/api/v1/invitations/${invitationId}/decline`);
    return response.data;
  },
  getForAuction: async (auctionId) => {
    const response = await api.get(`/api/v1/invitations/auction/${auctionId}`);
    return response; // returning the whole response object for consistency with useInvitations
  },
  inviteClient: async (auctionId, clientId) => {
    const response = await api.post(`/api/v1/invitations/auction/${auctionId}/invite/${clientId}`);
    return response.data;
  }
};

/**
 * Utility function to download reports as blobs (PDF/CSV)
 */
export const downloadReport = async (endpoint, format, defaultFilename) => {
  try {
    const response = await api.get(`${endpoint}?format=${format}`, {
      responseType: 'blob', // crucial for binary files
    });

    // Check if filename was provided in headers (Content-Disposition)
    let filename = defaultFilename || `report_${new Date().getTime()}.${format}`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error('Download failed', error);
    throw error;
  }
};

export { api, paymentApi };
