const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const fs = require('fs');
const PDFDocument = require('pdfkit');
const hbs = require('hbs');

const app = express();
const port = 5050;

app.use(express.static(path.join(__dirname, 'public')));        //added 

//Database (promise-based)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'website',
    port: 3306,
    decimalNumbers: true
});
const db = pool.promise();


// Session Store
const sessionStore = new MySQLStore({}, pool); // use pool here for compatibility


// Session Setup
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: 'lax'
    }
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// View Engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerHelper('eq', (a, b) => a === b);

// Routes
const authRoutes = require('./routes/auth'); // clean version, no DB injection
const pageRoutes = require('./routes/pages');
app.use('/auth', authRoutes);
app.use('/', pageRoutes);

// Middleware to protect API
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'Unauthorized' });
}









// ========== AFFAN's API ROUTES (Client Dashboard Backend) ==========

// Add booking
app.post('/api/bookings', isAuthenticated, async (req, res) => {
    const { username, service, date, time, location } = req.body;
    try {
        await db.query(
            `INSERT INTO bookings (username, service, date, time, location, status) VALUES (?, ?, ?, ?, ?, 'Upcoming')`,
            [username, service, date, time, location]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).json({ success: false });
    }
});

// Get upcoming bookings
app.get('/api/bookings/upcoming', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM bookings WHERE status = 'Upcoming'`);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching:', err);
        res.status(500).json({ success: false });
    }
});

// Complete a booking + generate invoice
/*
app.post('/api/bookings/complete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        const [bookingRows] = await db.query(`SELECT * FROM bookings WHERE id = ?`, [id]);
        const booking = bookingRows[0];
        const { service, date, time, location, username } = booking;

        await db.query(`UPDATE bookings SET status = 'Completed' WHERE id = ?`, [id]);

        const amount = calculateAmount(service);
        const invoiceId = generateInvoice(username, service, date, time, location, amount);

        await db.query(
            `INSERT INTO paymentHistory (Service, Date, Amount, Status, Invoice) VALUES (?, ?, ?, 'Unpaid', ?)`,
            [service, date, amount, invoiceId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
*/

app.post('/api/bookings/complete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const [bookingRows] = await db.query(`SELECT * FROM bookings WHERE id = ?`, [id]);

        if (!bookingRows || bookingRows.length === 0) {
            console.warn(`No booking found for ID: ${id}`);
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const booking = bookingRows[0];
        const { service, date, time, location, username } = booking;

        await db.query(`UPDATE bookings SET status = 'Completed' WHERE id = ?`, [id]);

        //const amount = calculateAmount(service);
        const [serviceResult] = await db.query(
            'SELECT price FROM services WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))',
            [service]
        );

        //add for debug
        console.log(`🔎 Looking up price for service: "${service}"`);
        if (!serviceResult || serviceResult.length === 0) {
        console.warn(`⚠️ No price found for service: "${service}"`);
        }


        const amount = serviceResult[0]?.price || 0;

        if (amount === undefined || isNaN(amount)) {
            console.error(`Invalid amount for service: ${service}`);
            return res.status(400).json({ success: false, message: 'Invalid service amount' });
        }

        const invoiceId = generateInvoice(username, service, date, time, location, amount);

        await db.query(
            `INSERT INTO paymentHistory (Service, Date, Amount, Status, Invoice) VALUES (?, ?, ?, 'Unpaid', ?)`,
            [service, date, amount, invoiceId]
        );

        res.json({ success: true, message: 'Service marked as done and invoice created.' });
    } catch (err) {
        console.error('🔥 Booking complete error:', err);
        res.status(500).json({ success: false, message: 'Server error while completing booking' });
    }
});


// Payment history
app.get('/api/paymentHistory', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM paymentHistory');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Payment processing
app.post('/api/paymentHistory/pay/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`UPDATE paymentHistory SET Status = 'Paid' WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Search unpaid payment history by service name
app.get('/api/paymentHistory/search', isAuthenticated, async (req, res) => {
    const searchTerm = req.query.service;

    if (!searchTerm) {
        return res.json({ success: true, services: [] });
    }

    try {
        const [rows] = await db.query(
            `SELECT * FROM paymentHistory WHERE Status = 'Unpaid' AND Service LIKE ?`,
            [`%${searchTerm}%`]
        );
        res.json({ success: true, services: rows });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Failed to search unpaid services' });
    }
});


// Reschedule
app.put('/api/bookings/reschedule/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { date, time } = req.body;
    try {
        await db.query(`UPDATE bookings SET date = ?, time = ? WHERE id = ?`, [date, time, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Cancel
app.delete('/api/bookings/cancel/:id', isAuthenticated, async (req, res) => {
    try {
        await db.query(`DELETE FROM bookings WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Invoice PDF download
app.get('/invoices/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'invoices', req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).send('File not found.');
    res.sendFile(filePath);
});

// Calculate amount for service
function calculateAmount(service) {
    const prices = {
        'Car Wash': 50,
        'Resdential Cleaning': 75,
        'Pet Grooming': 40,
        'Full Service': 150,
    };
    return prices[service] || 0;
}

// Generate PDF invoice
function generateInvoice(username, service, date, time, location, amount) {
    const invoiceId = `INV-${Date.now()}`;
    const invoicePath = path.join(__dirname, 'invoices', `${invoiceId}.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(invoicePath);

    doc.pipe(stream);
    doc.fontSize(20).text('Invoice', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoiceId}`);
    doc.text(`Date: ${date}`);
    doc.text(`Time: ${time}`);
    doc.text(`Service: ${service}`);
    doc.text(`Client: ${username}`);
    doc.text(`Location: ${location}`);
    doc.text(`Amount: $${amount.toFixed(2)}`);
    doc.end();

    return invoiceId;
}


// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
