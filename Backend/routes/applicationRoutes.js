const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware'); // Updated import

const {
    submitApplication,
    getAllApplications,
    getApplicationById,
    getApplicationByTrackingId,
    updateApplicationStatus,
    getApplicationStats,
    resendApplicationEmails
} = require('../controllers/applicationController');
const { uploadFiles, handleUploadErrors, normalizeFilePaths } = require('../middleware/uploadMiddleware'); // Updated import
const { validateApplication } = require('../middleware/validationMiddleware');

// Public routes
router.post('/submit', 
    uploadFiles, 
    handleUploadErrors, 
    normalizeFilePaths,  // ADD THIS LINE - Fixes path issue
    validateApplication, 
    submitApplication
);

// Public tracking route
router.get('/track/:trackingId', getApplicationByTrackingId);

// Admin routes - PROTECTED
router.get('/all', authMiddleware, getAllApplications);
router.get('/stats', authMiddleware, getApplicationStats);
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id/status', authMiddleware, updateApplicationStatus);
router.post('/:applicationId/resend-emails', authMiddleware, resendApplicationEmails);

module.exports = router;