// Handle booking form submission for the main form
document.getElementById('bookingForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username')?.value.trim();
    const service = document.querySelector('.service-dropdown')?.value;
    const date = document.getElementById('date')?.value;
    const time = document.getElementById('time')?.value;
    const location = document.getElementById('location')?.value.trim();

    // Validate inputs
    if (!username || !service || !date || !time || !location) {
        alert('Please fill in all fields to book a service.');
        return;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        alert('Invalid date format. Please use YYYY-MM-DD.');
        return;
    }

    const year = parseInt(date.split('-')[0], 10);
    if (year < 1900 || year > 2100) {
        alert('Invalid year. Please enter a year between 1900 and 2100.');
        return;
    }

    try {
        const response = await fetch('/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, service, date, time, location }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Booking successful!');
            window.location.reload(); // Reload to update the UI
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error booking service:', error);
        alert('Failed to book the service. Please try again later.');
    }
});

// Mark a service as done and transition it to payment history
async function markAsDone(serviceId) {
    if (!confirm('Are you sure you want to mark this service as done?')) return;

    try {
        const response = await fetch(`bookings/complete/${serviceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (data.success) {
            alert(data.message);
            window.location.reload(); // Refresh to show updated status
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error marking service as done:', error);
        alert('Failed to mark service as done. Please try again.');
    }
}

// Fetch and display payment history
function fetchPaymentHistory() {
    fetch('/api/paymentHistory')
        .then((response) => {
            if (!response.ok) throw new Error('Failed to fetch payment history');
            return response.json();
        })
        .then((data) => {
            const tableBody = document.querySelector('#payment-history-body');
            tableBody.innerHTML = '';

            data.forEach((row) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.Service}</td>
                    <td>${new Date(row.Date).toLocaleDateString()}</td>
                    <td>$${parseFloat(row.Amount).toFixed(2)}</td>
                    <td class="${row.Status === 'Paid' ? 'status-paid' : 'status-unpaid'}">${row.Status}</td>
                    <td>
                        ${
                    row.Invoice
                        ? `<a href="/invoices/${row.Invoice}.pdf" target="_blank" rel="noopener noreferrer">View Invoice</a>`
                        : 'N/A'
                }
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch((error) => {
            console.error('Error fetching payment history:', error);
        });
}

// Event Listener for Invoice Downloads
function handleInvoiceDownloads() {
    const tableBody = document.querySelector('#payment-history-body');
    tableBody.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.classList.contains('download-invoice')) {
            event.preventDefault();
            const invoiceId = event.target.getAttribute('href').split('/').pop();

            // Debug log for invoice ID
            console.log('Attempting to download invoice:', invoiceId);

            // Redirect to the download URL
            window.location.href = `/download/${invoiceId}`;
        }
    });
}

// Fetch and display ongoing services
function fetchOngoingServices() {
    fetch('/api/bookings/upcoming')
        .then((response) => {
            if (!response.ok) throw new Error('Failed to fetch ongoing services');
            return response.json();
        })
        .then((services) => {
            const container = document.getElementById('ongoing-services-container');
            container.innerHTML = ''; // Clear existing content

            if (services.length === 0) {
                container.innerHTML = '<p>No ongoing services.</p>';
                return;
            }

            services.forEach((service) => {
                const item = document.createElement('div');
                item.classList.add('ongoing-item');
                item.innerHTML = `
                    <p>${service.service} - ${new Date(service.date).toLocaleDateString()} @ ${service.location}</p>
                    <button class="done-btn" onclick="markAsDone(${service.id})">Mark as Done</button>
                `;
                container.appendChild(item);
            });
        })
        .catch((error) => {
            console.error('Error fetching ongoing services:', error);
        });
}

// Initialize event listeners and fetch data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchPaymentHistory();
    handleInvoiceDownloads();
    fetchOngoingServices();
});
