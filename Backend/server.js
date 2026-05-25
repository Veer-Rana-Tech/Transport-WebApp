const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, initializeDatabase } = require('./config/database');
const { dashboardAuthMiddleware } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================
// EJS TEMPLATE ENGINE
// ============================

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../Frontend'));

// ============================
// STATIC FILES
// ============================

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/css', express.static(path.join(__dirname, '../Frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../Frontend/js')));
app.use('/images', express.static(path.join(__dirname, '../Frontend/images')));

// ============================
// IMPORT ROUTES
// ============================

const applicationRoutes = require('./routes/applicationRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const { authRoutes } = require('./routes/authRoutes');

// ============================
// API ROUTES
// ============================

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/track', trackingRoutes);

// ============================
// PAGE ROUTES
// ============================

app.get('/', (req, res) => {
    res.render('home/home', {
        title: 'Ek Transport - Professional Driver Job Portal',
        page: 'home'
    });
});

app.get('/about', (req, res) => {
    res.render('home/about', {
        title: 'About Us - Ek Transport',
        page: 'about'
    });
});

app.get('/carrer', (req, res) => {
    res.render('home/carrer', {
        title: 'Careers - Ek Transport',
        page: 'career'
    });
});

app.get('/login', (req, res) => {
    res.render('home/login', {
        title: 'Login - Ek Transport',
        page: 'login'
    });
});

app.get('/dashboard', dashboardAuthMiddleware, (req, res) => {
    res.render('home/dashboard', {
        title: 'Dashboard - Ek Transport',
        page: 'dashboard',
        admin: req.admin,
        token: req.token
    });
});

app.get('/tracking', (req, res) => {
    res.render('home/tracking', {
        title: 'Track Application - Ek Transport',
        page: 'tracking'
    });
});

app.get('/apply', (req, res) => {
    res.render('home/apply', {
        title: 'Apply as Driver - Ek Transport',
        page: 'apply'
    });
});

// ============================
// HEALTH CHECK
// ============================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Ek Transport Backend is running',
        timestamp: new Date().toISOString()
    });
});

// ============================
// ERROR HANDLER
// ============================

app.use((err, req, res, next) => {
    console.error('Server error:', err);

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// ============================
// 404 API ROUTES
// ============================

app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found'
    });
});

// ============================
// 404 PAGE ROUTES
// ============================

app.use('*', (req, res) => {
    res.status(404).render('home/404', {
        title: 'Page Not Found - Ek Transport',
        page: '404'
    });
});

// ============================
// START SERVER
// ============================

const startServer = async () => {
    try {

        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.log('⚠️ Starting server without database connection...');
        } else {
            await initializeDatabase();
        }

        app.listen(PORT, () => {

            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Frontend: http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🔐 Login: http://localhost:${PORT}/login`);
            console.log(`🗄️ Database: ${dbConnected ? '✅ Connected' : '❌ Not connected'}`);

        });

    } catch (error) {

        console.error('❌ Failed to start server:', error);
        process.exit(1);

    }
};

startServer();
