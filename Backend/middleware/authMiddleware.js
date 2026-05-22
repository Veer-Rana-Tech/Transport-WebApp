const jwt = require('jsonwebtoken');

// Main auth middleware
const authMiddleware = (req, res, next) => {
    console.log('🔐 Auth Middleware Called for:', req.path);
    
    // Get token from multiple sources
    let token = null;
    
    // 1. Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
        console.log('✅ Token from Authorization header');
    }
    
    // 2. Check query parameter
    else if (req.query && req.query.token) {
        token = req.query.token;
        console.log('✅ Token from query parameter');
    }
    
    // 3. Check cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('✅ Token from cookies');
    }

    console.log('🔑 Token extracted:', token ? 'Yes' : 'NO TOKEN');

    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({
            success: false,
            message: "Access denied. No token provided."
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('✅ Token verified for admin:', decoded.email);
        req.admin = decoded;
        req.token = token;
        next();
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

// Special middleware for dashboard (handles redirects)
const dashboardAuthMiddleware = (req, res, next) => {
    console.log('🔐 Dashboard Auth Middleware Called');
    console.log('📨 URL:', req.url);
    console.log('🔍 Query Params:', req.query);
    
    let token = null;

    // 1. Check query parameter (for redirects from login)
    if (req.query && req.query.token) {
        token = req.query.token;
        console.log('✅ Token from query parameter');
    }
    
    // 2. Check Authorization header
    else if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
        token = req.header('Authorization').replace('Bearer ', '');
        console.log('✅ Token from Authorization header');
    }
    
    // 3. Check cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('✅ Token from cookies');
    }

    console.log('🔑 Token found:', token ? 'Yes' : 'No');

    if (!token) {
        console.log('❌ No token provided, redirecting to login');
        return res.redirect('/login?message=Please login to access dashboard');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('✅ Token verified for admin:', decoded.email);
        req.admin = decoded;
        req.token = token;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        return res.redirect('/login?message=Session expired. Please login again.');
    }
};

module.exports = {
    authMiddleware,
    dashboardAuthMiddleware
};