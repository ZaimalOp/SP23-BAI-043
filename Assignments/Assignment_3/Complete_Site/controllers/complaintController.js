const Complaint = require('../models/complaint');

// Renders the form for submitting a new complaint
exports.getComplaintForm = (req, res, next) => {
    console.log('getComplaintForm called');
    console.log('User:', req.session.user);
    
    res.render('contact', {
        pageTitle: 'Contact Us',
        path: '/contact',
        errorMessage: null
    });
};

// Handles the submission of a new complaint
exports.postComplaint = (req, res, next) => {
    console.log('postComplaint called');
    console.log('User:', req.session.user);
    console.log('Body:', req.body);
    
    const { orderId, message } = req.body;
    
    // Check if user is logged in
    if (!req.session.user) {
        req.flash('error', 'Please login to submit a complaint');
        return res.redirect('/auth/login');
    }
    
    const userId = req.session.user._id || req.session.user.id;

    const complaint = new Complaint({
        userId: userId,
        orderId: orderId,
        message: message
    });

    complaint.save()
        .then(result => {
            console.log('Created Complaint');
            req.flash('success', 'Complaint submitted successfully!');
            res.redirect('/my-complaints');
        })
        .catch(err => {
            console.log(err);
            res.status(500).render('contact', {
                pageTitle: 'Contact Us',
                path: '/contact',
                errorMessage: 'Submitting the complaint failed. Please try again.'
            });
        });
};

// Displays the list of complaints submitted by the logged-in user
exports.getUserComplaints = (req, res, next) => {
    console.log('getUserComplaints called');
    console.log('User:', req.session.user);
    
    // Check if user is logged in
    if (!req.session.user) {
        req.flash('error', 'Please login to view your complaints');
        return res.redirect('/auth/login');
    }
    
    const userId = req.session.user._id || req.session.user.id;
    
    Complaint.find({ userId: userId })
        .sort({ createdAt: -1 })
        .then(complaints => {
            console.log('Found complaints:', complaints.length);
            res.render('my-complaints', {
                pageTitle: 'My Complaints',
                path: '/my-complaints',
                complaints: complaints
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};

exports.getAdminAllComplaints = (req, res, next) => {
    Complaint.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email') // Get user's name and email
        .then(complaints => {
            res.render('admin/all-complaints', {
                pageTitle: 'All User Complaints',
                path: '/admin/complaints',
                complaints: complaints
            });
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};