const { pool } = require('../config/database');

// Track application by tracking ID
const trackApplication = async (req, res) => {
    try {
        const { trackingId } = req.params;

        if (!trackingId) {
            return res.status(400).json({
                success: false,
                message: 'Tracking ID is required'
            });
        }

        const [applications] = await pool.execute(`
            SELECT 
                a.*,
                DATE_FORMAT(a.created_at, '%d %M %Y') as application_date,
                (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'status', ash.status,
                        'notes', ash.notes,
                        'date', DATE_FORMAT(ash.created_at, '%d %M %Y')
                    )
                ) FROM application_status_history ash 
                WHERE ash.application_id = a.id 
                ORDER BY ash.created_at) as status_history
            FROM applications a 
            WHERE a.tracking_id = ?
        `, [trackingId]);

        if (applications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Application not found with the provided Tracking ID'
            });
        }

        const application = applications[0];
        
        // Parse JSON fields
        application.preferred_locations = JSON.parse(application.preferred_locations);
        application.status_history = application.status_history ? JSON.parse(application.status_history) : [];

        // Format response for frontend
        const response = {
            success: true,
            application: {
                summary: {
                    name: application.full_name,
                    id: application.tracking_id,
                    position: 'Professional Driver',
                    date: application.application_date
                },
                status: application.status,
                statusHistory: application.status_history,
                personalInfo: {
                    fullName: application.full_name,
                    email: application.email,
                    phone: application.phone,
                    dob: application.dob,
                    address: application.address
                },
                experience: {
                    drivingExperience: application.driving_experience,
                    licenseType: application.license_type,
                    vehicleType: application.vehicle_type,
                    availability: application.availability,
                    preferredLocations: application.preferred_locations
                }
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Application tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking application',
            error: error.message
        });
    }
};

module.exports = {
    trackApplication
};