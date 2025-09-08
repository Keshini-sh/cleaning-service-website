// Logout admin
function adminLogout() {
    window.location.href = '/auth/logout' // Relies on session-based logout route
}

// Load business info on page load
async function loadBusinessInfo() {
    try {
        const response = await fetch(`/auth/business-info`);
        const businessInfo = await response.json();

        if (response.ok) {
            document.getElementById('businessName').value = businessInfo.name;
            document.getElementById('businessAddress').value = businessInfo.address;
            document.getElementById('businessEmail').value = businessInfo.email;
            document.getElementById('businessPassword').value = businessInfo.password;
        } else {
            alert('Failed to load business information.');
        }
    } catch (error) {
        console.error('Error loading business info:', error);
        alert('Error loading business information.');
    }
}

async function updateBusinessInfo() {
    const name = document.getElementById('businessName').value;
    const address = document.getElementById('businessAddress').value;
    const email = document.getElementById('businessEmail').value;
    const password = document.getElementById('businessPassword').value;

    try {
        const response = await fetch(`/auth/updateBusinessInfo`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, address, email, password }),
        });

        const result = await response.json();
        alert(result.message || 'Failed to update business information.');
    } catch (error) {
        console.error('Error updating business info:', error);
        alert('Error updating business info.');
    }
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account?')) return;

    try {
        const response = await fetch(`/auth/deleteBusinessInfo`, {
            method: 'DELETE',
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = '/logout';
        } else {
            alert('Failed to delete account.');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account.');
    }
}

// ──────────────── Service Management ────────────────

function addService() {
    const name = document.getElementById('newService').value;
    const price = document.getElementById('servicePrice').value;

    if (!name || !price) {
        alert('Please provide both service name and price.');
        return;
    }

    fetch('/auth/addService', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price }),
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Service added.');
            document.getElementById('newService').value = '';
            document.getElementById('servicePrice').value = '';
            loadServices();
        })
        .catch(err => {
            console.error('Error adding service:', err);
            alert('Error adding service.');
        });
}

async function loadServices() {
    try {
        const response = await fetch('/auth/getServices');
        const services = await response.json();

        const tableBody = document.querySelector('#servicesTable tbody');
        tableBody.innerHTML = '';

        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.name}</td>
                <td>$${service.price}</td>
                <td><button onclick="modifyService(${service.id}, '${service.name}', ${service.price})">Modify</button></td>
                <td><button onclick="deleteService(${service.id})">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading services:', error);
        alert('Failed to load services.');
    }
}

function modifyService(id, oldName, oldPrice) {
    const newName = prompt('New Service Name:', oldName);
    const newPrice = prompt('New Price:', oldPrice);

    if (!newName || isNaN(newPrice)) {
        alert('Invalid input.');
        return;
    }

    fetch(`/auth/updateService/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, price: newPrice }),
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Service updated.');
            loadServices();
        })
        .catch(err => {
            console.error('Error updating service:', err);
            alert('Error updating service.');
        });
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
        const response = await fetch(`/auth/deleteService/${id}`, { method: 'DELETE' });
        const result = await response.json();
        alert(result.message || 'Service deleted.');
        loadServices();
    } catch (error) {
        console.error('Error deleting service:', error);
    }
}

//Load Paid Bills into "Manage Client Billings"
async function loadPaidBills() {
    try {
        const response = await fetch('/auth/loadPaidBills');
        const paidBills = await response.json();

        const tableBody = document.querySelector('#paidBillingsTable tbody');
        tableBody.innerHTML = '';

        if (!paidBills.length) {
            tableBody.innerHTML = '<tr><td colspan="5">No paid bills found.</td></tr>';
            return;
        }

        paidBills.forEach(bill => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bill.client || 'N/A'}</td>
                <td>${bill.Service}</td>
                <td>${new Date(bill.Date).toLocaleDateString()}</td>
                <td>$${parseFloat(bill.Amount).toFixed(2)}</td>
                <td>${bill.Status}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading paid bills:', error);
        alert('Failed to load billing information.');
    }
}



// ──────────────── Billing + Late Notice ────────────────

async function loadUnpaidNotices() {
    try {
        const response = await fetch('/auth/getUnpaidBookings');
        const unpaidBookings = await response.json();

        const tableBody = document.querySelector('#unpaidNoticesTable tbody');
        tableBody.innerHTML = '';

        unpaidBookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.client}</td>  
                <td>${booking.service}</td>
                <td>${booking.date}</td>
                <td>$${booking.amountDue}</td>
                <td>${booking.daysOverdue} days</td>
                <td><button onclick="sendLateNotice('${booking.email}', '${booking.client}', '${booking.service}', ${booking.amountDue}, ${booking.daysOverdue})">Send</button></td>
                
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading unpaid bookings:', error);
        alert('Failed to load unpaid bookings.');
    }
}

async function sendLateNotice(email, client, service, amountDue, daysOverdue) {
    try {
        const response = await fetch('/auth/sendLateNotice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, client, service, amountDue, daysOverdue }),
        });

        const result = await response.json();
        alert(result.message || 'Late notice sent.');
    } catch (error) {
        console.error('Error sending late notice:', error);
        alert('Failed to send notice.');
    }
}

// ──────────────── UI Panel Switching ────────────────

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('hidden', section.id !== sectionId);
    });
}

// ──────────────── Init ────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadBusinessInfo();
    loadServices();
    loadUnpaidNotices();
    loadPaidBills();
});
