-- Applications table with corrected enum values - MySQL 5.7 compatible
USE ek_transport;

-- Drop and recreate the applications table with correct enum values
DROP TABLE IF EXISTS application_status_history;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS admin_users;

-- Applications table with corrected enum values
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
    preferred_locations TEXT NOT NULL, -- Changed from JSON to TEXT for MySQL 5.7
    license_filename VARCHAR(255),
    license_filepath VARCHAR(500),
    photo_filename VARCHAR(255),
    photo_filepath VARCHAR(500),
    address_filename VARCHAR(255),
    address_filepath VARCHAR(500),
    additional_info TEXT,
    status ENUM('submitted', 'document_verified', 'background_check', 'interview_scheduled', 'approved', 'rejected') DEFAULT 'submitted',
    status_history TEXT, -- Changed from JSON to TEXT for MySQL 5.7
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tracking_id (tracking_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Application status history table
CREATE TABLE IF NOT EXISTS application_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_created_at (created_at)
);



CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);