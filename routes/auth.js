const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// ─────────────────────────────────────────────
// Registration Routes (Client + Business)
// ─────────────────────────────────────────────
router.get('/register', (req, res) => res.render('register'));
router.get('/register-client', (req, res) => res.render('register-client'));
router.get('/register-business', (req, res) => res.render('register-business'));

router.post('/register-client', authController.registerClient);
router.post('/register-business', authController.registerBusiness);

// ─────────────────────────────────────────────
// Login & Logout
// ─────────────────────────────────────────────
router.get('/login', (req, res) => res.render('login'));

router.post('/login', authController.login);

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ─────────────────────────────────────────────
// Client Settings (Update + Delete)
// ─────────────────────────────────────────────
router.post('/settings', authController.updateProfile);
router.post('/delete-account', authController.deleteAccount);



// ─────────────────────────────────────────────
// Business/Admin Routes
// ─────────────────────────────────────────────

// Business info CRUD
router.get('/business-info', authController.getBusinessInfo); // Uses session businessId
//router.put('/updateBusinessInfo', authController.updateBusinessInfo);
router.put('/updateBusinessInfo', (req, res, next) => {
    next();
}, authController.updateBusinessInfo);
router.delete('/deleteBusinessInfo', authController.deleteBusinessInfo);

// Services CRUD
router.post('/addService', authController.addService);
router.put('/updateService/:id', authController.updateService);
router.delete('/deleteService/:id', authController.deleteService);

router.get('/getServices', authController.getServices);

//manage billings 
router.get('/loadPaidBills', authController.loadPaidBills);

// Billing & Late Notices
router.get('/getUnpaidBookings', authController.getUnpaidBookings);
router.post('/sendLateNotice', authController.sendLateNotice);


// ─────────────────────────────────────────────
// Export the router
// ─────────────────────────────────────────────
module.exports = router;
