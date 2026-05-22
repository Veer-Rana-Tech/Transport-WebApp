const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ek_transport',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database Connected Successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Initialize database and tables
const initializeDatabase = async () => {
    try {
        // Create database if not exists
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`✅ Database '${dbConfig.database}' ready`);
        await tempConnection.end();

        // Create applications table
        const createApplicationsTable = `
            CREATE TABLE IF NOT EXISTS applications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                tracking_id VARCHAR(20) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                dob DATE NOT NULL,
                address TEXT NOT NULL,
                driving_experience INT NOT NULL,
                license_type ENUM('LMV', 'HMV', 'MCWG', 'MCG', 'international') NOT NULL,
                vehicle_type ENUM('car', 'truck', 'bus', 'all', '') DEFAULT NULL,
                availability ENUM('immediate', '1week', '2weeks', '1month') NOT NULL,
                preferred_locations JSON NOT NULL,
                license_filename VARCHAR(255),
                license_filepath VARCHAR(500),
                photo_filename VARCHAR(255),
                photo_filepath VARCHAR(500),
                address_filename VARCHAR(255),
                address_filepath VARCHAR(500),
                additional_info TEXT,
                status ENUM('submitted', 'document_verified', 'background_check', 'interview_scheduled', 'approved', 'rejected') DEFAULT 'submitted',
                status_history JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_tracking_id (tracking_id),
                INDEX idx_email (email),
                INDEX idx_status (status),
                INDEX idx_created_at (created_at)
            )
        `;

        await pool.execute(createApplicationsTable);
        console.log('✅ Applications table created/verified');

        // Create application_status_history table
        const createStatusHistoryTable = `
            CREATE TABLE IF NOT EXISTS application_status_history (
                id INT PRIMARY KEY AUTO_INCREMENT,
                application_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
                INDEX idx_application_id (application_id),
                INDEX idx_created_at (created_at)
            )
        `;

        await pool.execute(createStatusHistoryTable);
        console.log('✅ Application status history table created/verified');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
};

module.exports = {
    pool,
    testConnection,
    initializeDatabase
};