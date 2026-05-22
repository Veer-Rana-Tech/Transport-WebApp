// emailController.js
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

// Email configuration
const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};

// Create transporter - FIXED: createTransport instead of createTransporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email transporter is ready to send messages');
    }
});

// Send email to user with application confirmation
const sendUserConfirmationEmail = async (applicationData) => {
    try {
        const {
            tracking_id,
            full_name,
            email,
            phone,
            dob,
            address,
            driving_experience,
            license_type,
            vehicle_type,
            availability,
            preferredLocations,
            additional_info,
            applicationId,
            created_at
        } = applicationData;

        // Format preferred locations
        const locations = Array.isArray(preferredLocations) 
            ? preferredLocations.join(', ')
            : preferredLocations;

        const mailOptions = {
            from: `"E-Truck Team" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Application Submitted Successfully - Tracking ID: ${tracking_id}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .tracking-id { background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; color: #856404; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 14px; }
        .status-timeline { margin: 20px 0; }
        .status-item { display: flex; align-items: center; margin: 10px 0; }
        .status-dot { width: 12px; height: 12px; background: #28a745; border-radius: 50%; margin-right: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Submitted Successfully!</h1>
            <p>Thank you for applying to join E-Truck as a driver</p>
        </div>
        
        <div class="content">
            <div class="tracking-id">
                Your Application Tracking ID: <span style="font-size: 24px;">${tracking_id}</span>
            </div>
            
            <p>Dear <strong>${full_name}</strong>,</p>
            
            <p>We have successfully received your driver application. Our team will review your application and get back to you within 3-5 business days.</p>
            
            <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Application Summary</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Full Name:</strong><br>
                        ${full_name}
                    </div>
                    <div>
                        <strong>Email:</strong><br>
                        ${email}
                    </div>
                    <div>
                        <strong>Phone:</strong><br>
                        ${phone}
                    </div>
                    <div>
                        <strong>Date of Birth:</strong><br>
                        ${new Date(dob).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Driving Experience:</strong><br>
                        ${driving_experience} years
                    </div>
                    <div>
                        <strong>License Type:</strong><br>
                        ${license_type}
                    </div>
                    <div>
                        <strong>Vehicle Type:</strong><br>
                        ${vehicle_type || 'Not specified'}
                    </div>
                    <div>
                        <strong>Availability:</strong><br>
                        ${availability}
                    </div>
                </div>
                
                <div style="margin-top: 15px;">
                    <strong>Preferred Locations:</strong><br>
                    ${locations}
                </div>
                
                ${additional_info ? `
                <div style="margin-top: 15px;">
                    <strong>Additional Information:</strong><br>
                    ${additional_info}
                </div>
                ` : ''}
                
                <div style="margin-top: 15px;">
                    <strong>Application Date:</strong><br>
                    ${new Date(created_at).toLocaleDateString()}
                </div>
            </div>
            
            <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">What's Next?</h3>
                <div class="status-timeline">
                    <div class="status-item">
                        <div class="status-dot"></div>
                        <div>
                            <strong>Application Received</strong><br>
                            <small>We've received your application and documents</small>
                        </div>
                    </div>
                    <div class="status-item">
                        <div style="width: 12px; height: 12px; background: #6c757d; border-radius: 50%; margin-right: 10px;"></div>
                        <div>
                            <strong>Document Verification</strong><br>
                            <small>Reviewing your submitted documents (2-3 days)</small>
                        </div>
                    </div>
                    <div class="status-item">
                        <div style="width: 12px; height: 12px; background: #6c757d; border-radius: 50%; margin-right: 10px;"></div>
                        <div>
                            <strong>Background Check</strong><br>
                            <small>Verifying your driving history and records (3-5 days)</small>
                        </div>
                    </div>
                    <div class="status-item">
                        <div style="width: 12px; height: 12px; background: #6c757d; border-radius: 50%; margin-right: 10px;"></div>
                        <div>
                            <strong>Final Review</strong><br>
                            <small>Final assessment and decision (1-2 days)</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Track Your Application</h3>
                <p>You can track your application status anytime using your Tracking ID:</p>
                <p style="text-align: center; font-size: 16px; font-weight: bold; color: #667eea;">
                    ${tracking_id}
                </p>
                <p>Visit our application tracking page to check the current status of your application.</p>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>The E-Truck Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} E-Truck. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('User confirmation email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending user confirmation email:', error);
        return { success: false, error: error.message };
    }
};

// Send email to admin about new application
const sendAdminNotificationEmail = async (applicationData) => {
    try {
        const {
            tracking_id,
            full_name,
            email,
            phone,
            driving_experience,
            license_type,
            vehicle_type,
            preferredLocations,
            applicationId,
            created_at
        } = applicationData;

        const locations = Array.isArray(preferredLocations) 
            ? preferredLocations.join(', ')
            : preferredLocations;

        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;

        const mailOptions = {
            from: `"E-Truck Applications" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Driver Application Received - ${tracking_id}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 25px; border-radius: 0 0 10px 10px; }
        .alert-badge { background: #dc3545; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-bottom: 15px; }
        .info-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #dc3545; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .action-buttons { text-align: center; margin: 25px 0; }
        .btn { display: inline-block; padding: 12px 25px; margin: 0 10px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .btn-primary { background: #007bff; }
        .btn-success { background: #28a745; }
        .quick-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
        .stat-item { background: white; padding: 15px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Driver Application Received</h1>
            <p>Application ID: ${tracking_id}</p>
        </div>
        
        <div class="content">
            <div class="alert-badge">
                ⚡ IMMEDIATE ATTENTION REQUIRED
            </div>
            
            <div class="info-card">
                <h3 style="color: #dc3545; margin-top: 0;">Applicant Information</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Full Name:</strong><br>
                        ${full_name}
                    </div>
                    <div>
                        <strong>Contact Email:</strong><br>
                        ${email}
                    </div>
                    <div>
                        <strong>Phone Number:</strong><br>
                        ${phone}
                    </div>
                    <div>
                        <strong>Application ID:</strong><br>
                        ${tracking_id}
                    </div>
                    <div>
                        <strong>Database ID:</strong><br>
                        #${applicationId}
                    </div>
                    <div>
                        <strong>Submitted On:</strong><br>
                        ${new Date(created_at).toLocaleString()}
                    </div>
                </div>
            </div>
            
            <div class="info-card">
                <h3 style="color: #dc3545; margin-top: 0;">Professional Details</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong>Driving Experience:</strong><br>
                        ${driving_experience} years
                    </div>
                    <div>
                        <strong>License Type:</strong><br>
                        ${license_type}
                    </div>
                    <div>
                        <strong>Vehicle Type:</strong><br>
                        ${vehicle_type || 'Not specified'}
                    </div>
                    <div>
                        <strong>Preferred Locations:</strong><br>
                        ${locations}
                    </div>
                </div>
            </div>
            
            <div class="quick-stats">
                <div class="stat-item">
                    <div style="font-size: 24px; font-weight: bold; color: #007bff;">${driving_experience}</div>
                    <div>Years Experience</div>
                </div>
                <div class="stat-item">
                    <div style="font-size: 24px; font-weight: bold; color: #28a745;">${license_type}</div>
                    <div>License Type</div>
                </div>
                <div class="stat-item">
                    <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${preferredLocations.length || 0}</div>
                    <div>Preferred Locations</div>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="${process.env.ADMIN_URL}/applications/${applicationId}" class="btn btn-primary">
                    📋 View Full Application
                </a>
                <a href="${process.env.ADMIN_URL}/applications" class="btn btn-success">
                    🏠 Go to Admin Panel
                </a>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <strong>Next Steps:</strong>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    <li>Review the application details</li>
                    <li>Verify submitted documents</li>
                    <li>Initiate background check</li>
                    <li>Update application status</li>
                </ol>
            </div>
            
            <p style="text-align: center; color: #666; margin-top: 25px;">
                This is an automated notification from E-Truck Application System
            </p>
        </div>
    </div>
</body>
</html>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        return { success: false, error: error.message };
    }
};

// Main function to send both emails
const sendApplicationEmails = async (applicationId) => {
    try {
        // Get application details from database
        const [applications] = await pool.execute(`
            SELECT 
                a.*,
                DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                a.preferred_locations as preferredLocations
            FROM applications a 
            WHERE a.id = ?
        `, [applicationId]);

        if (applications.length === 0) {
            throw new Error('Application not found');
        }

        let application = applications[0];
        
        // Parse JSON fields
        if (typeof application.preferredLocations === 'string') {
            application.preferredLocations = JSON.parse(application.preferredLocations);
        }

        // Add applicationId to the data
        application.applicationId = applicationId;

        // Send emails in parallel
        const [userResult, adminResult] = await Promise.allSettled([
            sendUserConfirmationEmail(application),
            sendAdminNotificationEmail(application)
        ]);

        const results = {
            userEmail: userResult.status === 'fulfilled' ? userResult.value : { success: false, error: userResult.reason },
            adminEmail: adminResult.status === 'fulfilled' ? adminResult.value : { success: false, error: adminResult.reason }
        };

        // Log email sending results
        console.log('Email sending results:', {
            applicationId,
            trackingId: application.tracking_id,
            userEmailSuccess: results.userEmail.success,
            adminEmailSuccess: results.adminEmail.success
        });

        return results;

    } catch (error) {
        console.error('Error in sendApplicationEmails:', error);
        throw error;
    }
};

// Test email functionality
const testEmail = async (req, res) => {
    try {
        const testData = {
            tracking_id: 'ET20241001',
            full_name: 'Test User',
            email: process.env.SMTP_USER,
            phone: '+1234567890',
            dob: '1990-01-01',
            address: '123 Test Street, Test City',
            driving_experience: '5',
            license_type: 'Commercial',
            vehicle_type: 'Heavy Truck',
            availability: 'Full-time',
            preferredLocations: ['New York', 'California'],
            additional_info: 'Test application',
            applicationId: 1,
            created_at: new Date()
        };

        const results = await Promise.allSettled([
            sendUserConfirmationEmail(testData),
            sendAdminNotificationEmail(testData)
        ]);

        res.json({
            success: true,
            message: 'Test emails sent',
            results: {
                user: results[0].status === 'fulfilled' ? results[0].value : results[0].reason,
                admin: results[1].status === 'fulfilled' ? results[1].value : results[1].reason
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending test emails',
            error: error.message
        });
    }
};

module.exports = {
    sendUserConfirmationEmail,
    sendAdminNotificationEmail,
    sendApplicationEmails,
    testEmail
};