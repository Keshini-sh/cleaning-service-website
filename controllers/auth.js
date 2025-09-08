const mysql = require("mysql2");

//Connect to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'website'
});

db.connect((error) => {
    if (error) {
        console.error("❌ Database connection error:", error);
        process.exit(1);
    }
    console.log("✅ Connected to the database");
});

exports.db = db;

// ─────────────────────────────────────────────
// Client Registration
// ─────────────────────────────────────────────
exports.registerClient = (req, res) => {
    const { name, username, email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
        return res.render('register', {
            message: 'Passwords do not match.'
        });
    }

    db.query('SELECT email FROM users WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).send('Internal Server Error');

        if (results.length > 0) {
            return res.render('register', {
                message: 'The email is already in use.'
            });
        }

        db.query('INSERT INTO users SET ?', { name, username, email, password }, (error) => {
            if (error) return res.status(500).send('Internal Server Error');
            return res.redirect('/login');
        });
    });
};

// ─────────────────────────────────────────────
// Business Registration 
// ─────────────────────────────────────────────
exports.registerBusiness = (req, res) => {
    const { name, address, email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
        return res.render('register', {
            message: 'Passwords do not match.'
        });
    }

    db.query('SELECT email FROM business_info WHERE email = ?', [email], (error, results) => {
        if (error) return res.status(500).send('Internal Server Error');

        if (results.length > 0) {
            return res.render('register', {
                message: 'The email is already in use for a business account.'
            });
        }

        db.query('INSERT INTO business_info SET ?', { name, address, email, password }, (error) => {
            if (error) return res.status(500).send('Internal Server Error');
            return res.redirect('/login');
        });
    });
};
/*
// ─────────────────────────────────────────────
// Login (Client)
// ─────────────────────────────────────────────
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.render('login', {
                message: 'There was an error. Please try again.'
            });
        }

        if (results.length === 0) {
            return res.render('login', {
                message: 'No account found with that email address.'
            });
        }

        const user = results[0];

        if (password !== user.password) {
            return res.render('login', {
                message: 'Incorrect password. Please try again.'
            });
        }
            

        // Save session
        req.session.userId = user.id;
        req.session.user = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            password: user.password
        };

        req.session.save((err) => {
            if (err) return res.status(500).send('Session save error');
            return res.redirect('/dashboard/settings');
        });
    });
};

*/ 


exports.login = (req, res) => {
    const { email, password } = req.body;

    // Step 1: Try logging in as client
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return res.render('login', {
                message: 'There was an error. Please try again.'
            });
        }

        if (results.length > 0) {
            const user = results[0];

            if (password !== user.password) {
                return res.render('login', {
                    message: 'Incorrect password. Please try again.'
                });
            }

            req.session.userId = user.id;
            req.session.user = {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                password: user.password
            };

            return req.session.save((err) => {
                if (err) return res.status(500).send('Session save error');
                return res.redirect('/dashboard/settings');
            });
        }

        // Step 2: If not found in users, try business_info
        db.query('SELECT * FROM business_info WHERE email = ?', [email], (err2, businessResults) => {
            if (err2) {
                console.error('Business login error:', err2);
                return res.render('login', { message: 'Server error. Try again.' });
            }

            if (businessResults.length === 0) {
                return res.render('login', { message: 'No account found with this email.' });
            }

            const business = businessResults[0];

            if (business.password !== password) {
                return res.render('login', { message: 'Incorrect password. Please try again.' });
            }

            req.session.businessId = business.id;
            req.session.business = {
                id: business.id,
                name: business.name,
                email: business.email,
                address: business.address,
                password: business.password
            };

            return req.session.save((err) => {
                if (err) return res.status(500).send('Session save error');
                return res.redirect('/admin');
            });
        });
    });
};




// ─────────────────────────────────────────────
// Update Profile (Client)
// ─────────────────────────────────────────────
/*exports.updateProfile = (req, res) => {



    console.log("🔧 Incoming updateProfile data:", req.body);

    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized: User session not found.' });
    }

    const { name, username, email, password } = req.body;
    const userId = req.session.userId;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    db.query(
        'UPDATE users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?',
        [name, username, email, password, userId],
        (err, results) => {
            if (err) {
                //debug
                console.error("❌ DB error during profile update:", err);

                return res.status(500).json({ success: false, message: 'Error updating profile.' });
            }
            if (results.affectedRows === 0) {

                //debug
                console.warn("⚠️ No user found with the given ID or no fields were changed.");

                return res.status(400).json({
                    success: false,
                    message: 'No changes were made.'
                });
            }

            // Update session data
            Object.assign(req.session.user, { name, username, email, password });

            return res.json({
                success: true,
                message: 'Profile updated successfully.',
                updatedUser: req.session.user
            });
        }
    );
};
*/


exports.updateProfile = (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }




/*

    db.query(
        'UPDATE users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?',
        [name, username, email, password, userId],
        (err, results) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ message: 'Failed to update user profile' });
            }
    
            // ✅ Update session
            req.session.user = {
                ...req.session.user,
                name,
                username,
                email,
                password, // Not recommended, but OK if already storing it
            };
    
            // ✅ Force session to save
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('Session save error:', saveErr);
                    return res.status(500).json({ message: 'Failed to save session' });
                }
    
                // ✅ Respond with success
                return res.json({
                    message: 'User profile updated successfully',
                    success: true
                });
            });
        }
    );
*/




    db.query(
        'UPDATE users SET name = ?, username = ?, email = ?, password = ? WHERE id = ?',
        [name, username, email, password, userId],
        (err, results) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ message: 'Failed to update user profile' });
            }
    
            // 🟡 Re-fetch updated user from DB
            db.query('SELECT * FROM users WHERE id = ?', [userId], (err2, userResults) => {
                if (err2 || !userResults || userResults.length === 0) {
                    console.error('Failed to fetch updated user:', err2);
                    return res.status(500).json({ message: 'Failed to retrieve updated user' });
                }
    
                // ✅ Update session with fresh user info
                req.session.user = userResults[0];
    
                res.json({ message: 'User profile updated successfully', success: true });
            });
        }
    );





    
}; 











// ─────────────────────────────────────────────
// Delete Account (Client)
// ─────────────────────────────────────────────
exports.deleteAccount = (req, res) => {
    const userId = req.session.userId;

    db.query('DELETE FROM users WHERE id = ?', [userId], (error) => {
        if (error) {
            return res.render('error', { message: 'Error deleting your account.' });
        }

        req.session.destroy((err) => {
            if (err) {
                return res.render('error', { message: 'Error logging out.' });
            }
            res.redirect('/');
        });
    });
};






















// ─────────────────────────────────────────────
// Business/Admin Logic (Maram + Vinuya)
// ─────────────────────────────────────────────


// Admin login
/*
exports.adminLogin = (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT id, name, password FROM business_info WHERE name = ?', [username], (err, results) => {
        if (err) {
            console.error('Login DB error:', err);
            return res.json({ success: false, message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'Business not found' });
        }

        const business = results[0];
        if (business.password === password) {
            req.session.businessId = business.id;
            req.session.business = business;
            return res.json({ success: true, message: 'Login successful', businessId: business.id });
        } else {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
    });
};
*/
// Get business info (using session)
exports.getBusinessInfo = (req, res) => {
    const businessId = req.session.businessId;
    if (!businessId) return res.status(401).json({ message: 'Unauthorized' });

    db.query('SELECT name, address, email, password FROM business_info WHERE id = ?', [businessId], (err, results) => {
        if (err) {
            console.error('Fetch error:', err);
            return res.status(500).json({ message: 'Failed to fetch business info' });
        }
        if (results.length === 0) return res.status(404).json({ message: 'Business not found' });
        res.json(results[0]);
    });
};

// Update business info
exports.updateBusinessInfo = (req, res) => {
    const businessId = req.session.businessId;
    if (!businessId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, address, email, password } = req.body;
    if (!name || !address || !email || !password)
        return res.status(400).json({ message: 'All fields are required' });

    db.query(
        'UPDATE business_info SET name = ?, address = ?, email = ?, password = ? WHERE id = ?',
        [name, address, email, password, businessId],
        (err, results) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ message: 'Failed to update business info' });
            }
            res.json({ message: 'Business info updated successfully' });
        }
    );
};

// Delete business account
exports.deleteBusinessInfo = (req, res) => {
    const businessId = req.session.businessId;
    if (!businessId) return res.status(401).json({ message: 'Unauthorized' });

    db.query('DELETE FROM business_info WHERE id = ?', [businessId], (err, results) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ message: 'Failed to delete account' });
        }

        req.session.destroy(() => {
            res.json({ message: 'Business account deleted successfully' });
        });
    });
};

// Add a service
exports.addService = (req, res) => {
    const { name, price } = req.body;
    const business = req.session.business;

    if (!business || !name || !price || isNaN(price)) {
        return res.status(400).json({ message: 'Missing or invalid data' });
    }

    db.query(
        'INSERT INTO services (business_name, name, price) VALUES (?, ?, ?)',
        [business.name, name, price],
        (err, result) => {
            if (err) {
                console.error('Add service error:', err);
                return res.status(500).json({ message: 'Failed to add service' });
            }
            res.status(201).json({ message: 'Service added', id: result.insertId });
        }
    );
};


// Get all available services (used for client dashboard or homepage)
exports.getServices = (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) {
            console.error('Error fetching services:', err);
            return res.status(500).json({ message: 'Failed to fetch services.' });
        }
        res.json(results);
    });
};




// Update a service
exports.updateService = (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!id || !name || !price || isNaN(price)) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    db.query(
        'UPDATE services SET name = ?, price = ? WHERE id = ?',
        [name, price, id],
        (err, result) => {
            if (err) {
                console.error('Update service error:', err);
                return res.status(500).json({ message: 'Failed to update service' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Service not found' });
            }
            res.json({ message: 'Service updated' });
        }
    );
};



// Delete a service
exports.deleteService = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM services WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Delete service error:', err);
            return res.status(500).json({ message: 'Failed to delete service' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted' });
    });
};

//managing services
exports.loadPaidBills = (req, res) => {
    const query = `
        SELECT 
            b.username AS client,
            p.Service,
            p.Date,
            p.Amount,
            p.Status
        FROM paymentHistory p
        JOIN bookings b ON b.service = p.Service AND b.date = p.Date
        WHERE p.Status = 'Paid'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Get paid bills error:', err);
            return res.status(500).json({ message: 'Failed to fetch paid bills' });
        }
            // DEBUG: See what's being returned
    console.log('🧾 Unpaid bookings:', results);
        res.json(results);
    });
};



// Get unpaid bookings for late notices
exports.getUnpaidBookings = (req, res) => {
    const query = `
    SELECT 
        b.username AS client,
        b.service,
        b.date,
        DATEDIFF(CURDATE(), b.date) AS daysOverdue,
        COALESCE(s.price, 0) AS amountDue,
        COALESCE(u.email, '') AS email
        FROM bookings b
        LEFT JOIN services s ON b.service = s.name
        LEFT JOIN users u ON b.username = u.username
        WHERE (b.status IS NULL OR b.status != 'Paid') 
          AND DATEDIFF(CURDATE(), b.date) > 0 
          AND b.username IS NOT NULL 
          AND b.service IS NOT NULL;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Unpaid bookings error:', err);
            return res.status(500).json({ message: 'Failed to fetch unpaid bookings' });
        }
        res.json(results);
    });
};


// Send a late notice (simulated)
exports.sendLateNotice = (req, res) => {
    const { email, client, service, amountDue, daysOverdue } = req.body;
    console.log('BODY RECEIVED:', req.body); // 🔍 Log first
    
    if (!email || !client || !service || !amountDue || !daysOverdue) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Simulated email sending
    console.log(`📧 Late notice sent to ${email} for ${client} - ${service} - $${amountDue} - ${daysOverdue} days overdue`);
    res.status(200).json({ message: 'Late notice sent successfully!' });
};
