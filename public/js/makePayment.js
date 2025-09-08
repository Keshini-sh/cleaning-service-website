let selectedServiceId = null; // Keep track of the selected service

// Search unpaid services
async function searchServices() {
    const searchInput = document.getElementById('search-services').value.trim();

    if (!searchInput) {
        alert('Please enter a service name to search.');
        return;
    }

    try {
        //const response = await fetch(`/paymentHistory/search?service=${searchInput}`);
        const response = await fetch(`/api/paymentHistory/search?service=${searchInput}`);

        const data = await response.json();

        if (data.success) {
            const resultsContainer = document.getElementById('service-results');
            resultsContainer.innerHTML = ''; // Clear previous results

            if (data.services.length === 0) {
                resultsContainer.innerHTML = '<li>No unpaid services found.</li>';
                return;
            }

            // Create a radio group for the services
            const radioGroup = document.createElement('ul');
            radioGroup.style.listStyleType = 'none';

            data.services.forEach(service => {
                const serviceItem = document.createElement('li');
                serviceItem.innerHTML = `
                    <label>
                        <input type="radio" name="service" value="${service.id}" />
                        Service: ${service.Service}, Date: ${service.Date}, Amount: $${service.Amount}
                    </label>
                `;
                radioGroup.appendChild(serviceItem);
            });

            resultsContainer.appendChild(radioGroup);

            // Attach event listeners to the radio buttons
            document.querySelectorAll('input[name="service"]').forEach(radio => {
                radio.addEventListener('change', (event) => {
                    selectedServiceId = event.target.value; // Update the selected service ID
                    alert(`Service with ID ${selectedServiceId} selected for payment.`);
                });
            });
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error searching services:', error);
        alert('Failed to search for unpaid services. Please try again later.');
    }
}

// Handle payment form submission
document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedServiceId) {
        alert('Please select a service to pay for.');
        return;
    }

    const fullName = document.getElementById('full-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.trim();
    const expiryDate = document.getElementById('expiry-date').value.trim();
    const cvv = document.getElementById('cvv').value.trim();

    if (!fullName || !cardNumber || !expiryDate || !cvv) {
        alert('Please fill in all payment details.');
        return;
    }

    if (cardNumber.length !== 9 || isNaN(cardNumber)) {
        alert('Invalid card number. It must be 9 digits.');
        return;
    }

    if (cvv.length !== 3 || isNaN(cvv)) {
        alert('Invalid CVV. It must be 3 digits.');
        return;
    }

    try {
        const response = await fetch(`/api/paymentHistory/pay/${selectedServiceId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, cardNumber, expiryDate, cvv }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Payment successful!');
            window.location.reload(); // Reload to update the payment status
        } else {
            alert(`Payment failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment. Please try again later.');
    }
});
