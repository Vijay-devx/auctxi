require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const base64Secret = process.env.JWT_SECRET || '4a7d1ed414474e4033ac29ccb8653d9b';
const JWT_SECRET = Buffer.from(base64Secret, 'base64'); // Must match Spring Boot's Decoders.BASE64.decode

// 1. Basic Middleware
app.use(cors()); // Centralized CORS
app.use(morgan('dev')); // Logging

// 2. Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'API Gateway' });
});

// 3. JWT Validation Middleware
const authenticateToken = (req, res, next) => {
    // Exclude public endpoints (using req.originalUrl because req.path is stripped by app.use('/api'))
    if (req.originalUrl && (req.originalUrl.startsWith('/api/v1/auth/login') || req.originalUrl.startsWith('/api/v1/auth/register'))) {
        console.log(`[Gateway] Skipping auth for public endpoint: ${req.originalUrl}`);
        return next();
    }
    // Also exclude uploads if they are directly accessed via GET, but here uploads go to core.
    if (req.path.startsWith('/uploads/')) {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn(`[Gateway] No token provided for ${req.originalUrl}`);
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Spring Boot uses Base64 decoded secret, so Node.js MUST parse it as base64 Buffer to match HMAC signatures
    jwt.verify(token, Buffer.from(JWT_SECRET, 'base64'), (err, user) => {
        if (err) {
            console.error(`[Gateway] JWT verification failed for ${req.originalUrl}: ${err.message}`);
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        
        // Inject user context into headers for downstream services to trust
        req.headers['X-User-Id'] = user.userId || user.id || ''; // Depends on Spring Boot payload
        req.headers['X-User-Email'] = user.sub || '';
        req.headers['X-User-Roles'] = user.roles || '';
        
        next();
    });
};

// Apply Authentication Middleware globally to /api/* routes
app.use('/api', authenticateToken);

// 4. Reverse Proxy Configurations
// In Docker, these resolve to container names. Locally, they fall back to localhost.
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:5001';
const AI_SERVICE_URL      = process.env.AI_SERVICE_URL      || 'http://localhost:8000';
const CORE_SERVICE_URL    = process.env.CORE_SERVICE_URL    || 'http://localhost:8080';

// Proxy to ASP.NET Core Payment Service
app.use('/api/v1/payments', createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
}));

// Proxy to Python AI Service
app.use('/api/v1/ai', createProxyMiddleware({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
}));



// Proxy all other /api/* requests to Spring Boot Core Service
app.use('/api', createProxyMiddleware({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
}));

// Route /uploads/* to Spring Boot Core Service
app.use('/uploads', createProxyMiddleware({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
}));

// Start the server
app.listen(PORT, () => {
    console.log(`[Gateway] API Gateway running on http://localhost:${PORT}`);
    console.log(`[Gateway] Proxying /api/v1/payments -> ${PAYMENT_SERVICE_URL}`);
    console.log(`[Gateway] Proxying /api/v1/ai      -> ${AI_SERVICE_URL}`);
    console.log(`[Gateway] Proxying /api/*           -> ${CORE_SERVICE_URL}`);
});
