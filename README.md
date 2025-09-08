# cleaning-service-website
Project Overview

Clean Sweep is a full-stack web application for managing and booking cleaning services.
It allows customers to:
- Browse available services
- Search for specific services
- Add services to a cart and book them
- Register, log in, and manage their account
  
Admins can:
- Manage businesses and services
- View unpaid and paid bookings
- Send late payment notices to customers
- Payments are handled with a mock system (no real transactions).
------------------------------------------------------------------------------------------
Features
Client Side
- Authentication: Sign up, log in, and manage profile
- Search: Find services using a search bar
- Cart System: Add services with selected dates to a booking cart
- Cookies Banner: User consent handling
- Testimonials & Company Info: Informative static sections

Admin Side
- Service Management: Add, update, and delete services
- Booking Management: Track unpaid and paid bills
- Billing Dashboard: View completed/paid bookings
- Late Notices: Send reminders for overdue payments
------------------------------------------------------------------------------------------
Tech Stack
- Frontend: Handlebars (.hbs), HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT + bcrypt
- Deployment: Localhost (not yet deployed)
------------------------------------------------------------------------------------------
Project Structure 
<pre>
project/
├── app.js                # Main server file  
├── controllers/  
│   └── auth.js           # Authentication logic  
├── routes/  
│   ├── auth.js           # Auth routes  
│   └── pages.js          # Client-facing pages  
├── public/  
│   ├── css/              # Stylesheets  
│   ├── js/               # Client-side JS (index.js, admin.js, webpage.js)  
├── views/  
│   ├── index.hbs         # Homepage with booking & cart  
│   ├── login.hbs         # Login page  
│   ├── register.hbs      # Registration page  
│   └── dashboard.hbs     # Admin dashboard  
└── database/             # SQL schema and seed data  
</pre>
------------------------------------------------------------------------------------------
Setup & Installation

1. Clone the repository:
- git clone https://github.com/yourusername/cleaning-service-website.git
- cd cleaning-service-website

2. Install dependencies:
npm install

3. Set up the database:
Import the SQL schema into MySQL.
Update your DB credentials in .env:
<pre>
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=cleaning_service
JWT_SECRET=yourjwtsecret
</pre>


5. Run the server:
npm start

6. Access the app:
Client side: http://localhost:5050/
------------------------------------------------------------------------------------------
Database  
The database schema is located in `database/schema.sql`.  
It defines tables for users, services, bookings, and businesses. 

------------------------------------------------------------------------------------------
Future Improvements
- Deploy on Heroku / Render / Vercel
- Implement real payment integration (Stripe/PayPal)
- Add email notifications for bookings
- Improve UI with modern framework (React/Next.js)

