const validator = require('validator');

const validateApplication = (req, res, next) => {
    const errors = [];
    
    // Personal Info Validation
    const { fullName, email, phone, dob, address } = req.body;
    
    if (!fullName || fullName.trim().length < 2) {
        errors.push('Full name is required and must be at least 2 characters long');
    }
    
    if (!email || !validator.isEmail(email)) {
        errors.push('Valid email address is required');
    }
    
    if (!phone || !validator.isMobilePhone(phone, 'any')) {
        errors.push('Valid phone number is required');
    }
    
    if (!dob) {
        errors.push('Date of birth is required');
    }
    
    if (!address || address.trim().length < 10) {
        errors.push('Address is required and must be at least 10 characters long');
    }
    
    // Experience Validation
    const { drivingExperience, licenseType, availability, preferredLocations } = req.body;
    
    if (!drivingExperience || drivingExperience < 0) {
        errors.push('Valid driving experience is required');
    }
    
    if (!licenseType) {
        errors.push('License type is required');
    }
    
    if (!availability) {
        errors.push('Availability is required');
    }
    
    if (!preferredLocations || preferredLocations.length === 0) {
        errors.push('At least one preferred location must be selected');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }
    
    next();
};

module.exports = {
    validateApplication
};