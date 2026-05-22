
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Enhanced File filter - Only images allowed
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/webp',
        'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF images are allowed.'), false);
    }
};

// Configure multer with new size limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB maximum limit
        files: 3 // Maximum 3 files
    }
});

// Custom middleware to check minimum file size (1MB)
const checkMinFileSize = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    const minSize = 1 * 1024 * 1024; // 1MB minimum
    const maxSize = 10 * 1024 * 1024; // 10MB maximum

    const fileErrors = [];

    // Check each uploaded file
    Object.keys(req.files).forEach(fieldName => {
        req.files[fieldName].forEach(file => {
            // Check minimum size
            if (file.size < minSize) {
                fileErrors.push({
                    field: fieldName,
                    filename: file.originalname,
                    message: `File "${file.originalname}" is too small. Minimum size is 1MB.`
                });
            }
            
            // Check maximum size (multer already checks this, but double-check)
            if (file.size > maxSize) {
                fileErrors.push({
                    field: fieldName,
                    filename: file.originalname,
                    message: `File "${file.originalname}" is too large. Maximum size is 10MB.`
                });
            }

            // Additional file type validation
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedMimes.includes(file.mimetype)) {
                fileErrors.push({
                    field: fieldName,
                    filename: file.originalname,
                    message: `File "${file.originalname}" is not a valid image type. Only JPG, PNG, WEBP, and GIF are allowed.`
                });
            }
        });
    });

    if (fileErrors.length > 0) {
        // Delete the uploaded files since they're invalid
        Object.keys(req.files).forEach(fieldName => {
            req.files[fieldName].forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        });

        return res.status(400).json({
            success: false,
            message: 'File validation failed',
            errors: fileErrors
        });
    }

    next();
};

// Middleware for multiple file uploads
const uploadFiles = upload.fields([
    { name: 'licenseFile', maxCount: 1 },
    { name: 'photoFile', maxCount: 1 },
    { name: 'addressFile', maxCount: 1 }
]);

// Enhanced Error handling middleware for multer
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 10MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded. Maximum 3 files allowed.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field. Only licenseFile, photoFile, and addressFile are allowed.'
            });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// Middleware to normalize file paths (fix backslash issue)
const normalizeFilePaths = (req, res, next) => {
    if (req.files) {
        // Convert all backslashes to forward slashes in file paths
        Object.keys(req.files).forEach(fieldName => {
            req.files[fieldName].forEach(file => {
                if (file.path) {
                    file.path = file.path.replace(/\\/g, '/');
                    
                    // Also ensure filename is properly set
                    if (!file.filename) {
                        file.filename = path.basename(file.path);
                    }
                }
            });
        });
    }
    next();
};

// Utility function to get file size in readable format
const getFileSizeMB = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// Utility function to validate single file
const validateSingleFile = (file) => {
    const minSize = 1 * 1024 * 1024; // 1MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    const errors = [];

    if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`File type not allowed. Only images are permitted.`);
    }

    if (file.size < minSize) {
        errors.push(`File too small. Minimum size is 1MB.`);
    }

    if (file.size > maxSize) {
        errors.push(`File too large. Maximum size is 10MB.`);
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        sizeMB: getFileSizeMB(file.size)
    };
};

module.exports = {
    uploadFiles,
    handleUploadErrors,
    normalizeFilePaths,
    checkMinFileSize,
    validateSingleFile,
    getFileSizeMB
};
