// Fetch and display upcoming appointments
document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/bookings/upcoming')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
            return response.json();
        })
        .then(appointments => {
            const upcomingSection = document.querySelector(".appointments-section");
            upcomingSection.innerHTML = ""; // Clear existing content

            if (!appointments || appointments.length === 0) {
                upcomingSection.innerHTML = "<p>No upcoming appointments.</p>";
                return;
            }

            appointments.forEach(appointment => {
                const card = document.createElement("div");
                card.classList.add("appointment-card");
                card.innerHTML = `
                    <h3>${appointment.service}</h3>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
                    <p><strong>Location:</strong> ${appointment.location}</p>
                    <button onclick="openRescheduleModal(${appointment.id})">Reschedule</button>
                    <button onclick="cancelAppointment(${appointment.id})" class="cancel-btn">Cancel</button>
                `;
                upcomingSection.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching upcoming appointments:", error);
            document.querySelector(".appointments-section").innerHTML = "<p>Error loading upcoming appointments. Please try again later.</p>";
        });
});

// Open the reschedule modal
function openRescheduleModal(appointmentId) {
    const modal = document.getElementById("rescheduleModal");
    modal.style.display = "block";
    document.getElementById("reschedule-appointment-id").value = appointmentId;
}

// Close the reschedule modal
function closeRescheduleModal() {
    const modal = document.getElementById("rescheduleModal");
    modal.style.display = "none";
    document.getElementById("new-date").value = "";
    document.getElementById("new-time").value = "";
}

// Save rescheduled appointment
document.getElementById("reschedule-save-btn").addEventListener("click", async () => {
    const id = document.getElementById("reschedule-appointment-id").value;
    const newDate = document.getElementById("new-date").value;
    const newTime = document.getElementById("new-time").value;

    if (!newDate || !newTime) {
        alert("Please fill in the new date and time.");
        return;
    }

    try {
        const response = await fetch(`/bookings/reschedule/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: newDate, time: newTime }),
        });

        if (!response.ok) throw new Error("Failed to reschedule appointment");

        alert("Appointment rescheduled successfully!");
        closeRescheduleModal();
        window.location.reload();
    } catch (error) {
        console.error("Error rescheduling appointment:", error);
        alert("Failed to reschedule the appointment. Please try again later.");
    }
});

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
        const response = await fetch(`/bookings/cancel/${appointmentId}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Failed to cancel appointment");

        alert("Appointment canceled successfully!");
        window.location.reload();
    } catch (error) {
        console.error("Error canceling appointment:", error);
        alert("Failed to cancel the appointment. Please try again later.");
    }
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
