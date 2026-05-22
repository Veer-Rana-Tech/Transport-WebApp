
// Enhanced Mobile menu toggle with animation
document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    const isActive = nav.classList.toggle('active');
    
    // Toggle button icon
    const icon = this.querySelector('i');
    if (isActive) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        this.classList.add('active');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        this.classList.remove('active');
    }
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    const nav = document.getElementById('mainNav');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !menuBtn.contains(e.target)) {
        nav.classList.remove('active');
        menuBtn.querySelector('i').classList.remove('fa-times');
        menuBtn.querySelector('i').classList.add('fa-bars');
        menuBtn.classList.remove('active');
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function() {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.getElementById('mobileMenuBtn');
        
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuBtn.querySelector('i').classList.remove('fa-times');
            menuBtn.querySelector('i').classList.add('fa-bars');
            menuBtn.classList.remove('active');
        }
    });
});

// State selection functionality
document.querySelectorAll('.state-item').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('selected');
        updateFormProgress();
    });
});

// File upload functionality
document.getElementById('licenseUpload').addEventListener('click', function() {
    document.getElementById('licenseFile').click();
});

document.getElementById('photoUpload').addEventListener('click', function() {
    document.getElementById('photoFile').click();
});

document.getElementById('addressUpload').addEventListener('click', function() {
    document.getElementById('addressFile').click();
});

// Display file names after selection and validate file size and type
document.getElementById('licenseFile').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        const validation = validateFile(file, 'license');
        if (validation.isValid) {
            document.getElementById('licenseFileName').textContent = file.name;
            document.getElementById('licenseFileName').style.color = '#38b000';
            showFileSuccess('licenseUpload', '✓ File accepted');
            updateFormProgress();
        } else {
            document.getElementById('licenseFileName').textContent = validation.message;
            document.getElementById('licenseFileName').style.color = '#e63946';
            showFileError('licenseUpload', validation.message);
            this.value = '';
        }
    }
});

document.getElementById('photoFile').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        const validation = validateFile(file, 'photo');
        if (validation.isValid) {
            document.getElementById('photoFileName').textContent = file.name;
            document.getElementById('photoFileName').style.color = '#38b000';
            showFileSuccess('photoUpload', '✓ File accepted');
            updateFormProgress();
        } else {
            document.getElementById('photoFileName').textContent = validation.message;
            document.getElementById('photoFileName').style.color = '#e63946';
            showFileError('photoUpload', validation.message);
            this.value = '';
        }
    }
});

document.getElementById('addressFile').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        const validation = validateFile(file, 'address');
        if (validation.isValid) {
            document.getElementById('addressFileName').textContent = file.name;
            document.getElementById('addressFileName').style.color = '#38b000';
            showFileSuccess('addressUpload', '✓ File accepted');
            updateFormProgress();
        } else {
            document.getElementById('addressFileName').textContent = validation.message;
            document.getElementById('addressFileName').style.color = '#e63946';
            showFileError('addressUpload', validation.message);
            this.value = '';
        }
    }
});

// Enhanced file validation (1MB to 10MB, image types only)
function validateFile(file, fileType) {
    const minSize = 1 * 1024 * 1024; // 1MB in bytes
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    
    // Allowed image types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'image/gif'
    ];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            message: 'Only JPG, PNG, WEBP, or GIF images are allowed'
        };
    }
    
    // Check minimum file size
    if (file.size < minSize) {
        const minSizeMB = (minSize / (1024 * 1024)).toFixed(1);
        return {
            isValid: false,
            message: `File too small. Minimum ${minSizeMB}MB required`
        };
    }
    
    // Check maximum file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            isValid: false,
            message: `File too large. Maximum ${maxSizeMB}MB allowed`
        };
    }
    
    return {
        isValid: true,
        message: 'File is valid'
    };
}

// Show file upload success message
function showFileSuccess(uploadButtonId, message) {
    const uploadBtn = document.getElementById(uploadButtonId);
    const existingMsg = uploadBtn.querySelector('.file-message');
    
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const successMsg = document.createElement('div');
    successMsg.className = 'file-message success';
    successMsg.textContent = message;
    successMsg.style.cssText = `
        color: #38b000;
        font-size: 12px;
        margin-top: 5px;
        font-weight: 500;
    `;
    
    uploadBtn.appendChild(successMsg);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.remove();
        }
    }, 3000);
}

// Show file upload error message
function showFileError(uploadButtonId, message) {
    const uploadBtn = document.getElementById(uploadButtonId);
    const existingMsg = uploadBtn.querySelector('.file-message');
    
    if (existingMsg) {
        existingMsg.remove();
    }
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'file-message error';
    errorMsg.textContent = message;
    errorMsg.style.cssText = `
        color: #e63946;
        font-size: 12px;
        margin-top: 5px;
        font-weight: 500;
    `;
    
    uploadBtn.appendChild(errorMsg);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (errorMsg.parentNode) {
            errorMsg.remove();
        }
    }, 5000);
}

// File size validation helper function
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Form step navigation
document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', function() {
        const currentStep = this.closest('.form-step');
        const nextStepId = this.getAttribute('data-next');
        const nextStep = document.getElementById(`step-${nextStepId}`);
        
        if (validateStep(currentStep.id)) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            updateProgressBar(nextStepId);
        }
    });
});

document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', function() {
        const currentStep = this.closest('.form-step');
        const prevStepId = this.getAttribute('data-prev');
        const prevStep = document.getElementById(`step-${prevStepId}`);
        
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        updateProgressBar(prevStepId);
    });
});

// Update progress bar
function updateProgressBar(step) {
    const progressFill = document.getElementById('form-progress-fill');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Update progress bar width
    progressFill.style.width = `${(step / 3) * 100}%`;
    
    // Update step indicators
    progressSteps.forEach(stepEl => {
        const stepNumber = stepEl.getAttribute('data-step');
        if (stepNumber <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}

// Enhanced step validation with file checks
function validateStep(stepId) {
    const step = document.getElementById(stepId);
    const requiredFields = step.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            // Add error message if not exists
            if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                errorMsg.style.cssText = 'color: var(--danger); font-size: 14px; margin-top: 5px;';
                field.parentNode.insertBefore(errorMsg, field.nextSibling);
            }
        } else {
            field.classList.remove('error');
            
            // Remove error message if exists
            if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
                field.nextElementSibling.remove();
            }
        }
    });
    
    // Special validation for step 2 (locations)
    if (stepId === 'step-2') {
        const selectedStates = document.querySelectorAll('.state-item.selected');
        if (selectedStates.length === 0) {
            isValid = false;
            showNotification('Please select at least one preferred job location.', 'error');
        }
    }
    
    // Special validation for step 3 (documents)
    if (stepId === 'step-3') {
        // Check if required files are uploaded
        const licenseFile = document.getElementById('licenseFile').files[0];
        const photoFile = document.getElementById('photoFile').files[0];
        const addressFile = document.getElementById('addressFile').files[0];
        
        if (!licenseFile) {
            isValid = false;
            showNotification('Please upload your driver\'s license document.', 'error');
        }
        
        if (!photoFile) {
            isValid = false;
            showNotification('Please upload your passport photo.', 'error');
        }
        
        if (!addressFile) {
            isValid = false;
            showNotification('Please upload your address proof document.', 'error');
        }
    }
    
    return isValid;
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease-out;
    `;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e63946, #d00000)';
    } else if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #38b000, #2d8c00)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #4361ee, #3a56d4)';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Update form progress based on completion
function updateFormProgress() {
    const activeStep = document.querySelector('.form-step.active');
    const stepNumber = activeStep ? activeStep.id.split('-')[1] : 1;
    updateProgressBar(stepNumber);
}

// Update the API_BASE_URL and endpoints in script.js
const API_BASE_URL = '/api/applications';

// Enhanced form submission with better file validation
document.getElementById('driver-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (validateStep('step-3')) {
        // Show loading spinner
        document.getElementById('loading-spinner').classList.remove('hidden');
        
        try {
            // Collect form data
            const formData = new FormData();
            
            // Personal info
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('dob', document.getElementById('dob').value);
            formData.append('address', document.getElementById('address').value);
            
            // Experience
            formData.append('drivingExperience', document.getElementById('experience').value);
            formData.append('licenseType', document.getElementById('licenseType').value);
            formData.append('vehicleType', document.getElementById('vehicleType').value);
            formData.append('availability', document.getElementById('availability').value);
            
            // Preferred locations
            const selectedLocations = Array.from(document.querySelectorAll('.state-item.selected'))
                .map(item => item.textContent);
            formData.append('preferredLocations', JSON.stringify(selectedLocations));
            
            // Additional info
            formData.append('additionalInfo', document.getElementById('additionalInfo').value);
            
            // Files with final validation
            const licenseFile = document.getElementById('licenseFile').files[0];
            const photoFile = document.getElementById('photoFile').files[0];
            const addressFile = document.getElementById('addressFile').files[0];
            
            // Final file validation before submission
            if (licenseFile) {
                const licenseValidation = validateFile(licenseFile, 'license');
                if (!licenseValidation.isValid) {
                    throw new Error(`License file: ${licenseValidation.message}`);
                }
                formData.append('licenseFile', licenseFile);
            }
            
            if (photoFile) {
                const photoValidation = validateFile(photoFile, 'photo');
                if (!photoValidation.isValid) {
                    throw new Error(`Photo file: ${photoValidation.message}`);
                }
                formData.append('photoFile', photoFile);
            }
            
            if (addressFile) {
                const addressValidation = validateFile(addressFile, 'address');
                if (!addressValidation.isValid) {
                    throw new Error(`Address proof: ${addressValidation.message}`);
                }
                formData.append('addressFile', addressFile);
            }
            
            // Submit to backend - updated endpoint
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                document.getElementById('generated-tracking-id').textContent = result.trackingId;
                document.getElementById('form-success').classList.remove('hidden');
                document.getElementById('driver-form').classList.add('hidden');
                
                // Scroll to success message
                document.getElementById('form-success').scrollIntoView({ behavior: 'smooth' });
                
                showNotification('Application submitted successfully!', 'success');
            } else {
                throw new Error(result.message || 'Application submission failed');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            showNotification('Error submitting application: ' + error.message, 'error');
        } finally {
            // Hide loading spinner
            document.getElementById('loading-spinner').classList.add('hidden');
        }
    }
});

// Application tracking - FIXED VERSION for your HTML structure
document.getElementById('trackBtn').addEventListener('click', async function() {
    const trackingId = document.getElementById('trackingId').value.trim();
    
    if (!trackingId) {
        showNotification('Please enter your Application ID', 'error');
        return;
    }
    
    // Show loading state
    const trackBtn = document.getElementById('trackBtn');
    const originalText = trackBtn.innerHTML;
    trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
    trackBtn.disabled = true;
    
    // Hide previous results
    document.getElementById('tracking-result').classList.add('hidden');
    document.getElementById('tracking-error').classList.add('hidden');
    
    try {
        console.log(`🔍 Tracking: ${trackingId}`);
        
        const response = await fetch(`${API_BASE_URL}/track/${trackingId}`);
        const result = await response.json();
        
        if (result.success) {
            // Populate with real data
            const app = result.application;
            document.getElementById('summary-name').textContent = app.summary.name;
            document.getElementById('summary-id').textContent = app.summary.id;
            document.getElementById('summary-position').textContent = app.summary.position;
            document.getElementById('summary-date').textContent = app.summary.date;
            
            // Update status timeline based on actual status
            updateStatusTimeline(app.status, app.statusHistory);
            
            document.getElementById('tracking-result').classList.remove('hidden');
            console.log('✅ Tracking successful');
            
            showNotification('Application status loaded successfully!', 'success');
        } else {
            document.getElementById('tracking-error').classList.remove('hidden');
            console.log('❌ Tracking failed:', result.message);
            showNotification(result.message || 'Application not found', 'error');
        }
    } catch (error) {
        console.error('❌ Tracking error:', error);
        document.getElementById('tracking-error').classList.remove('hidden');
        document.getElementById('tracking-error').innerHTML = `
            <h3><i class="fas fa-exclamation-circle"></i> Tracking Error</h3>
            <p>Error tracking application. Please try again later.</p>
        `;
        showNotification('Network error. Please check your connection.', 'error');
    } finally {
        // Reset button
        trackBtn.innerHTML = originalText;
        trackBtn.disabled = false;
    }
});

// Function to update status timeline based on actual application status
function updateStatusTimeline(currentStatus, statusHistory) {
    const statusSteps = [
        { id: 'submitted', title: 'Application Submitted', description: 'Your application has been successfully submitted and is under review.' },
        { id: 'document_verified', title: 'Document Verification', description: 'Your documents have been verified successfully. All documents are in order.' },
        { id: 'background_check', title: 'Background Check', description: 'We are currently conducting background verification. This process typically takes 3-5 business days.' },
        { id: 'interview_scheduled', title: 'Interview Scheduled', description: 'Interview will be scheduled after successful background verification. You will receive details via email and SMS.' },
        { id: 'approved', title: 'Final Decision', description: 'Final decision will be communicated within 48 hours after the interview process.' }
    ];

    const timelineContainer = document.querySelector('.status-timeline');
    timelineContainer.innerHTML = '';

    statusSteps.forEach((step, index) => {
        const statusItem = document.createElement('div');
        
        // Find status history for this step
        const stepHistory = statusHistory?.find(sh => sh.status === step.id);
        const stepDate = stepHistory?.date || (index === 0 ? 'Recently' : 'Pending');
        
        // Determine status class
        let statusClass = '';
        if (currentStatus === step.id) {
            statusClass = 'active';
        } else if (getStatusIndex(currentStatus) > index) {
            statusClass = 'completed';
        }
        
        statusItem.className = `status-item ${statusClass}`;
        statusItem.innerHTML = `
            <h4>${step.title}</h4>
            <span class="status-date">${stepDate}</span>
            <p>${step.description}</p>
        `;
        
        timelineContainer.appendChild(statusItem);
    });
}

// Helper function to get status index for comparison
function getStatusIndex(status) {
    const statusOrder = ['submitted', 'document_verified', 'background_check', 'interview_scheduled', 'approved', 'rejected'];
    return statusOrder.indexOf(status);
}

// Enhanced status formatting function
function formatStatusText(status) {
    const statusMap = {
        'submitted': 'Application Submitted',
        'document_verified': 'Documents Verified',
        'background_check': 'Background Check in Progress',
        'interview_scheduled': 'Interview Scheduled',
        'approved': 'Application Approved',
        'rejected': 'Application Rejected'
    };
    return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Stats counter animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current) + (stat.textContent.includes('%') ? '%' : '+');
        }, 16);
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress bar
    updateProgressBar(1);
    
    // Animate stats when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(document.querySelector('.stats-section'));
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                document.getElementById('mainNav').classList.remove('active');
            }
        });
    });
    
    // Add active class to navigation links based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});
