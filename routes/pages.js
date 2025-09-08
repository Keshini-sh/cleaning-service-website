const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');


// Add this below your existing dashboard GET routes
router.post('/dashboard/settings', isAuthenticated, authController.updateProfile);


// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

//if the client is logged in redirect
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard/services');
    }
    next();
}

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register');
});

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});


// Home page or redirect if logged in
router.get('/', (req, res) => { 
    if (req.session && req.session.user) {
        return res.redirect('/dashboard/services');
    }
    res.render('index');
});

// Optional: direct access to index view
router.get('/index', (req, res) => {
    res.render('index');
});

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Register page
router.get('/register', (req, res) => {
    res.render('register');
});


// Dashboard sections
router.get('/dashboard/services', isAuthenticated, (req, res) => {
    res.render('dashboard', { section: 'services', user: req.session.user });
});

router.get('/dashboard/payments', isAuthenticated, (req, res) => {
    res.render('dashboard', { section: 'payments', user: req.session.user });
});

router.get('/dashboard/make-payment', isAuthenticated, (req, res) => {
    res.render('dashboard', { section: 'make-payment', user: req.session.user });
});

router.get('/dashboard/upcoming', isAuthenticated, (req, res) => {
    res.render('dashboard', { section: 'upcoming', user: req.session.user });
});

router.get('/dashboard/settings', isAuthenticated, (req, res) => {
    console.log("📦 Session user data at /dashboard/settings:", req.session.user);
    res.render('dashboard', { section: 'settings', user: req.session.user });
});

// Handle POST for updating profile from /dashboard/settings
router.post('/dashboard/settings', isAuthenticated, authController.updateProfile);
console.log("📡 About to run UPDATE query...kkk");


router.post('/dashboard/settings', isAuthenticated, (req, res, next) => {
    console.log("🚀 POST /dashboard/settings hit");
    next(); // forward to the controller
}, authController.updateProfile);
console.log("📡 About to run UPDATE query...iii");


//-------------------- Maram + Vinuya ------------------
// ─────────────────────────────────────
// ADMIN: Admin Dashboard View
// ─────────────────────────────────────
router.get('/admin', (req, res) => {
    if (!req.session.businessId) {
        return res.redirect('/login'); 
    }
    res.render('admin');
});


// ─────────────────────────────────────
// HOMEPAGE: API - Fetch All Services
// ─────────────────────────────────────
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'website'
});


// ─────────────────────────────────────
// HOMEPAGE: API - Search Services
// ─────────────────────────────────────
router.get('/searchServices', async (req, res) => {
    const query = req.query.query?.toLowerCase();
    if (!query) return res.json([]);

    try {
        const [rows] = await pool.query(
            'SELECT * FROM services WHERE LOWER(name) LIKE ? OR LOWER(business_name) LIKE ?',
            [`%${query}%`, `%${query}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ message: 'Search failed.' });
    }
});



module.exports = router;
