const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaintController');
const { isAuthenticated } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Debug logging middleware
router.use((req, res, next) => {
    console.log('Complaint route hit:', req.method, req.path);
    next();
});

// Test routes without authentication
router.get('/contact-test', (req, res) => {
    console.log('Contact test route hit');
    res.send('Contact test route working!');
});

router.get('/my-complaints-test', (req, res) => {
    console.log('My complaints test route hit');
    res.send('My complaints test route working!');
});

// User routes (temporarily without authentication for testing)
router.get('/contact', complaintController.getComplaintForm);
router.post('/contact', complaintController.postComplaint);
router.get('/my-complaints', complaintController.getUserComplaints);

// Admin routes (require admin authentication)
router.get('/admin/complaints', isAdmin, complaintController.getAdminAllComplaints);

module.exports = router;