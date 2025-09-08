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
        alert('Failed to book the service. Please try again later. herrrrrr');
    }
});

// Mark a service as done
async function markAsDone(serviceId) {
    if (!confirm('Are you sure you want to mark this service as done?')) return;

    try {
        const response = await fetch(`/api/bookings/complete/${serviceId}`, {
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

// Fetch and display ongoing services
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/bookings/upcoming')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch ongoing services');
            }
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
                    <p>${service.service} - ${formatDate(service.date)} at ${formatTime(service.time)} @ ${service.location}</p>
                    <button class="done-btn" onclick="markAsDone(${service.id})">Mark as Done</button>
                `;
                container.appendChild(item);
            });
        })
        .catch((error) => {
            console.error('Error fetching ongoing services:', error);
            const container = document.getElementById('ongoing-services-container');
            container.innerHTML = '<p>Error loading ongoing services. Please try again later.</p>';
        });
});

// Utility function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Utility function to format times
function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Modal Logic
const modal = document.getElementById("bookingModal");
const modalForm = document.getElementById("modalBookingForm");
const closeModal = document.querySelector(".close");

// Open Modal
document.querySelectorAll(".book-btn")?.forEach((button) => {
    button.addEventListener("click", (event) => {
        const service = event.target.closest(".card").getAttribute("data-service");
        document.getElementById("modal-service").value = service; // Set service in modal
        modal.style.display = "block";
    });
});

// Close Modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Submit Booking Form in Modal
modalForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("modal-username")?.value.trim();
    const service = document.getElementById("modal-service")?.value;
    const date = document.getElementById("modal-date")?.value;
    const time = document.getElementById("modal-time")?.value;
    const location = document.getElementById("modal-location")?.value.trim();

    if (!username || !service || !date || !time || !location) {
        alert("Please fill in all fields to book a service.");
        return;
    }

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, service, date, time, location }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Booking successful!");
            modal.style.display = "none";
            window.location.reload();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error booking service:", error);
        alert("Failed to book the service. Please try again later. kkk");
    }
});

// Close Modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Fetch and display dynamic services
document.addEventListener("DOMContentLoaded", () => {
    const servicesContainer = document.querySelector('.service-cards'); // changed from .add-services

    // Fetch available services from the backend
    fetch('/auth/getServices')
        .then((response) => {
            if (!response.ok) throw new Error('Failed to fetch available services');
            return response.json();
        })
        .then((services) => {
            servicesContainer.innerHTML = ''; // Clear existing services

            if (services.length === 0) {
                servicesContainer.innerHTML = '<p>No services available at the moment.</p>';
                return;
            }

            services.forEach((service) => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card';
                serviceCard.className = 'card'; //added
                serviceCard.innerHTML = `
                    <h4>${service.name}</h4>
                    <button class="book-btn" onclick="openBookingModal('${service.name}')">Book Service</button>  /
                    
                `;
                servicesContainer.appendChild(serviceCard);
            });

            /*
            document.querySelectorAll('.add-service-btn').forEach((button) => {
                button.addEventListener('click', (event) => {
                    const serviceName = event.target.getAttribute('data-service');
                    alert(`Service "${serviceName}" has been added.`);
                });
            });
            */

        })
        .catch((error) => {
            console.error('Error fetching services:', error);
            servicesContainer.innerHTML = '<p>Failed to load services. Please try again later.</p>';
        });
});
document.addEventListener('DOMContentLoaded', () => {
    const servicesContainer = document.querySelector('.services-container'); // Assuming this class wraps the existing service boxes

    // Add Event Listeners for "Add Service" buttons
    document.querySelectorAll('.add-service-btn').forEach((button) => {
        button.addEventListener('click', (event) => {
            const serviceName = event.target.getAttribute('data-service');

            // Check if the service already exists
            const existingService = Array.from(servicesContainer.children).find(
                (child) => child.querySelector('h3')?.innerText === serviceName
            );
            if (existingService) {
                alert(`The service "${serviceName}" already exists.`);
                return;
            }

            // Create a new service card
            const serviceCard = document.createElement('div');
            serviceCard.className = 'card';
            serviceCard.innerHTML = `
                <h3>${serviceName}</h3>
                <button class="book-btn" onclick="openBookingModal('${serviceName}')">Book Service</button>
            `;

            // Append the new card to the services container
            servicesContainer.appendChild(serviceCard);

            alert(`Service "${serviceName}" has been added.`);
        });
    });
});

// Function to handle opening the booking modal (assuming modal logic exists)
function openBookingModal(serviceName) {
    const modal = document.getElementById('bookingModal');
    document.getElementById('modal-service').value = serviceName; // Populate modal with the service name
    modal.style.display = 'block'; // Show modal
}
