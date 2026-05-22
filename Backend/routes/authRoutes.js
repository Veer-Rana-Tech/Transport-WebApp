
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Correct database import - use the pool from database.js
const { pool } = require('../config/database');

// Register Admin - ONLY ONE ADMIN ALLOWED
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if ANY admin already exists - ONLY ONE ADMIN ALLOWED
        try {
            const [allAdmins] = await pool.execute('SELECT * FROM admin_users');
            
            if (allAdmins.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Only one admin registration is allowed. System already has an admin.'
                });
            }

            // Check if admin with this email already exists
            const [existingAdmins] = await pool.execute(
                'SELECT * FROM admin_users WHERE email = ?',
                [email]
            );

            if (existingAdmins.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Admin with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert admin - FIXED
            const [result] = await pool.execute(
                'INSERT INTO admin_users (name, email, phone, password) VALUES (?, ?, ?, ?)',
                [name, email, phone, hashedPassword]
            );

            res.status(201).json({
                success: true,
                message: 'Admin registered successfully',
                admin: {
                    id: result.insertId,
                    name,
                    email,
                    phone
                }
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login Admin - FIXED DATABASE CALLS
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        try {
            // Find admin - FIXED
            const [admins] = await pool.execute(
                'SELECT * FROM admin_users WHERE email = ?',
                [email]
            );

            if (admins.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const admin = admins[0];

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    adminId: admin.id,
                    email: admin.email,
                    name: admin.name
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone
                }
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Admin Profile
router.get('/profile', async (req, res) => {
    try {
        // For now, we'll get the admin from the token
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get fresh admin data from database
        const [admins] = await pool.execute(
            'SELECT id, name, email, phone FROM admin_users WHERE id = ?',
            [decoded.adminId]
        );

        if (admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.json({
            success: true,
            admin: admins[0]
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify Token Middleware
const verifyToken = (req, res, next) => {
    console.log('🔐 VerifyToken Middleware Called for:', req.path);
    
    let token = null;

    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
        console.log('✅ Token from Authorization header');
    }
    
    // Check query parameter
    else if (req.query && req.query.token) {
        token = req.query.token;
        console.log('✅ Token from query parameter');
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
        next();
    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};

module.exports = {
    authRoutes: router,
    verifyToken: verifyToken
};
