const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/database');
const { authMiddleware, dashboardAuthMiddleware } = require('./middleware/authMiddleware'); // Updated import

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Frontend'));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, '../Frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../Frontend/js')));
app.use('/images', express.static(path.join(__dirname, '../Frontend/images')));

// Import routes
const applicationRoutes = require('./routes/applicationRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const { authRoutes, verifyToken } = require('./routes/authRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/track', trackingRoutes);

// Home route - render template
app.get('/', (req, res) => {
    res.render('home/home', { 
        title: 'Ek Transport - Professional Driver Job Portal',
        page: 'home'
    });
});

// About route
app.get('/about', (req, res) => {
    res.render('home/about', { 
        title: 'About Us - Ek Transport',
        page: 'about'
    });
});

// Career route 
app.get('/carrer', (req, res) => {
    res.render('home/carrer', { 
        title: 'Careers - Ek Transport',
        page: 'career'
    });
});

// Login route 
app.get('/login', (req, res) => {
    res.render('home/login', { 
        title: 'Login - Ek Transport',
        page: 'login'
    });
});

// Dashboard route (protected) - USING UPDATED MIDDLEWARE
app.get('/dashboard', dashboardAuthMiddleware, (req, res) => {
    console.log('🎯 Rendering dashboard for:', req.admin.email);
    res.render('home/dashboard', { 
        title: 'Dashboard - Ek Transport',
        page: 'dashboard',
        admin: req.admin,
        token: req.token // Pass token to client for API calls
    });
});

// Public tracking page
app.get('/tracking', (req, res) => {
    res.render('home/tracking', { 
        title: 'Track Application - Ek Transport',
        page: 'tracking'
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Ek Transport Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Public application submission page
app.get('/apply', (req, res) => {
    res.render('home/apply', { 
        title: 'Apply as Driver - Ek Transport',
        page: 'apply'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// 404 handler for pages
app.use('*', (req, res) => {
    res.status(404).render('home/404', { 
        title: 'Page Not Found - Ek Transport',
        page: '404'
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.log('⚠️  Starting server without database connection...');
        } else {
            // Initialize database tables
            await initializeDatabase();
        }

        app.listen(PORT, () => {
            console.log(`🚀 Ek Transport Backend Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📱 Frontend: http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🔐 Login: http://localhost:${PORT}/login`);
            console.log(`🗄️  Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();