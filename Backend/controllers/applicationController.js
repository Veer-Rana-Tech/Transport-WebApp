const { pool } = require('../config/database');
const { sendApplicationEmails } = require('./emailController');

// Generate unique tracking ID
const generateTrackingId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ET${year}${randomNum}`;
};

// Submit new application - MySQL 5.7 compatible
const submitApplication = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const {
            fullName,
            email,
            phone,
            dob,
            address,
            drivingExperience,
            licenseType,
            vehicleType,
            availability,
            preferredLocations,
            additionalInfo
        } = req.body;

        // Generate tracking ID
        const trackingId = generateTrackingId();

        // Handle file uploads
        const licenseFile = req.files?.licenseFile?.[0];
        const photoFile = req.files?.photoFile?.[0];
        const addressFile = req.files?.addressFile?.[0];

        // Parse preferred locations if it's a string
        const locations = typeof preferredLocations === 'string' 
            ? JSON.parse(preferredLocations) 
            : preferredLocations;

        // SIMPLE INSERT - Only required fields first
        const [result] = await connection.execute(`
            INSERT INTO applications (
                tracking_id, 
                full_name, 
                email, 
                phone, 
                dob, 
                address,
                driving_experience, 
                license_type, 
                availability,
                preferred_locations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            trackingId,
            fullName,
            email,
            phone,
            dob,
            address,
            drivingExperience,
            licenseType,
            availability,
            JSON.stringify(locations) // Store as JSON string in TEXT field
        ]);

        const applicationId = result.insertId;

        // Create initial status history
        const initialStatusHistory = JSON.stringify([{
            status: 'submitted',
            notes: 'Application submitted successfully',
            created_at: new Date()
        }]);

        // Update with optional fields and status
        const updateFields = [];
        const updateValues = [];

        if (vehicleType) {
            updateFields.push('vehicle_type = ?');
            updateValues.push(vehicleType);
        }

        if (licenseFile) {
            updateFields.push('license_filename = ?, license_filepath = ?');
            updateValues.push(licenseFile.filename, licenseFile.path);
        }

        if (photoFile) {
            updateFields.push('photo_filename = ?, photo_filepath = ?');
            updateValues.push(photoFile.filename, photoFile.path);
        }

        if (addressFile) {
            updateFields.push('address_filename = ?, address_filepath = ?');
            updateValues.push(addressFile.filename, addressFile.path);
        }

        if (additionalInfo) {
            updateFields.push('additional_info = ?');
            updateValues.push(additionalInfo);
        }

        // Add status and status_history
        updateFields.push('status = ?, status_history = ?');
        updateValues.push('submitted', initialStatusHistory);

        // Execute update
        if (updateFields.length > 0) {
            updateValues.push(applicationId);
            await connection.execute(`
                UPDATE applications 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `, updateValues);
        }

        // Insert initial status history in separate table
        await connection.execute(`
            INSERT INTO application_status_history (application_id, status, notes)
            VALUES (?, ?, ?)
        `, [applicationId, 'submitted', 'Application submitted successfully']);

        await connection.commit();

        console.log(`✅ Application submitted successfully: ${trackingId} (ID: ${applicationId})`);

        // Send confirmation emails (non-blocking)
        sendApplicationEmails(applicationId)
            .then(results => {
                console.log('Application emails sent successfully:', {
                    applicationId,
                    trackingId,
                    userEmailSuccess: results.userEmail.success,
                    adminEmailSuccess: results.adminEmail.success
                });
            })
            .catch(emailError => {
                console.error('Failed to send application emails:', emailError);
            });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            trackingId: trackingId,
            applicationId: applicationId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Application submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get all applications (for admin)
const getAllApplications = async (req, res) => {
    try {
        const [applications] = await pool.execute(`
            SELECT 
                id, tracking_id, full_name, email, phone, 
                driving_experience, license_type, status,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
            FROM applications 
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};

// Get application by ID - FIXED for MySQL 5.7
const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [applications] = await pool.execute(`
            SELECT 
                a.*,
                DATE_FORMAT(a.dob, '%Y-%m-%d') as formatted_dob,
                DATE_FORMAT(a.created_at, '%d %M %Y') as application_date
            FROM applications a 
            WHERE a.id = ?
        `, [id]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const application = applications[0];
        
        // Get status history separately - FIXED for MySQL 5.7
        const [statusHistory] = await pool.execute(`
            SELECT 
                status,
                notes,
                DATE_FORMAT(created_at, '%d %M %Y') as date
            FROM application_status_history 
            WHERE application_id = ?
            ORDER BY created_at ASC
        `, [id]);

        // Parse JSON fields
        if (application.preferred_locations) {
            application.preferred_locations = JSON.parse(application.preferred_locations);
        }

        res.json({
            success: true,
            application: {
                ...application,
                status_history: statusHistory || []
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching application',
            error: error.message
        });
    }
};

// Get application by tracking ID (for public tracking) - FIXED for MySQL 5.7
const getApplicationByTrackingId = async (req, res) => {
    try {
        const { trackingId } = req.params;

        console.log(`🔍 Tracking application: ${trackingId}`);

        // First, get basic application details
        const [applications] = await pool.execute(`
            SELECT 
                id,
                tracking_id,
                full_name,
                status,
                DATE_FORMAT(created_at, '%d %M %Y') as application_date
            FROM applications 
            WHERE tracking_id = ?
        `, [trackingId]);

        if (applications.length === 0) {
            console.log(`❌ Application not found: ${trackingId}`);
            return res.status(404).json({
                success: false,
                message: 'Application not found. Please check your Tracking ID.'
            });
        }

        const application = applications[0];
        
        // Get status history from separate table - FIXED for MySQL 5.7
        const [statusHistory] = await pool.execute(`
            SELECT 
                status,
                notes,
                DATE_FORMAT(created_at, '%d %M %Y') as date
            FROM application_status_history 
            WHERE application_id = ?
            ORDER BY created_at ASC
        `, [application.id]);

        // Create summary for frontend
        const summary = {
            name: application.full_name,
            id: application.tracking_id,
            position: 'Driver Position',
            date: application.application_date,
            status: application.status
        };

        console.log(`✅ Application found: ${application.full_name} (Status: ${application.status})`);

        res.json({
            success: true,
            application: {
                summary,
                status: application.status,
                statusHistory: statusHistory || []
            }
        });
    } catch (error) {
        console.error('❌ Tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking application. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { status, notes } = req.body;

        // Update application status
        await connection.execute(`
            UPDATE applications 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, id]);

        // Add to status history
        await connection.execute(`
            INSERT INTO application_status_history (application_id, status, notes)
            VALUES (?, ?, ?)
        `, [id, status, notes || `Status updated to ${status}`]);

        // Get updated application
        const [applications] = await connection.execute(`
            SELECT tracking_id, status, email, full_name FROM applications WHERE id = ?
        `, [id]);

        await connection.commit();

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application: {
                id: parseInt(id),
                trackingId: applications[0].tracking_id,
                status: applications[0].status
            }
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({
            success: false,
            message: 'Error updating application status',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM applications 
            GROUP BY status
        `);

        const [total] = await pool.execute('SELECT COUNT(*) as total FROM applications');

        const statsObject = {
            total: total[0].total,
            submitted: 0,
            document_verified: 0,
            background_check: 0,
            interview_scheduled: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            statsObject[stat.status] = stat.count;
        });

        res.json({
            success: true,
            stats: statsObject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching application statistics',
            error: error.message
        });
    }
};

// Resend application emails (admin function)
const resendApplicationEmails = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const results = await sendApplicationEmails(applicationId);

        res.json({
            success: true,
            message: 'Emails resent successfully',
            results: {
                userEmail: results.userEmail.success,
                adminEmail: results.adminEmail.success
            }
        });
    } catch (error) {
        console.error('Error resending emails:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending emails',
            error: error.message
        });
    }
};

module.exports = {
    submitApplication,
    getAllApplications,
    getApplicationById,
    getApplicationByTrackingId,
    updateApplicationStatus,
    getApplicationStats,
    resendApplicationEmails
};