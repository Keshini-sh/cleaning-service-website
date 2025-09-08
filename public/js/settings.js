// Mock data for payment methods (placeholder for business features)
let paymentMethods = [
    { type: "Visa", lastFour: "1234" },
    { type: "MasterCard", lastFour: "5678" }
];

// ─────────────────────────────────────────────
// Handle Account Settings Update (Client)
// ─────────────────────────────────────────────
/*
document.querySelector("#account-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.querySelector("input[name='name']").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email) {
        alert("Username and Email cannot be empty!");
        return;
    }




    try {
        const response = await fetch(`/auth/settings`, {
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

});

*/



//adding this 
document.querySelector("#account-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.querySelector("input[name='name']").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password || !name) {
        alert("All fields are required!");
        return;
    }

    try {
        const response = await fetch('/auth/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, username, email, password })
        });

        const result = await response.json();

        if (result.success) {
            alert(result.message || 'Profile updated successfully!');
            // ✅ Force reload to get fresh session data from server
           // window.location.reload();
        } else {
            alert(result.message || 'Failed to update profile.');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile.');
    }
});





   









// ─────────────────────────────────────────────
// Mock Business-Side: Payment Methods UI
// ─────────────────────────────────────────────
function updatePaymentMethodsUI() {
    const methodsContainer = document.querySelector(".payment-methods");
    methodsContainer.innerHTML = "";

    paymentMethods.forEach((method, index) => {
        const div = document.createElement("div");
        div.classList.add("payment-method");
        div.innerHTML = `
            <span>${method.type} ending in ${method.lastFour}</span>
            <button class="edit-btn" onclick="editPaymentMethod(${index})">Edit</button>
            <button class="remove-btn" onclick="removePaymentMethod(${index})">Remove</button>
        `;
        methodsContainer.appendChild(div);
    });

    const addButton = document.createElement("button");
    addButton.classList.add("add-payment-btn");
    addButton.textContent = "Add New Payment Method";
    addButton.onclick = addPaymentMethod;
    methodsContainer.appendChild(addButton);
}

function editPaymentMethod(index) {
    const newLastFour = prompt("Enter the last four digits of your card:", paymentMethods[index].lastFour);
    if (newLastFour && newLastFour.length === 4 && !isNaN(newLastFour)) {
        paymentMethods[index].lastFour = newLastFour;
        updatePaymentMethodsUI();
        alert("Payment method updated successfully!");
    } else {
        alert("Invalid input! Please enter exactly 4 digits.");
    }
}

function removePaymentMethod(index) {
    if (confirm(`Are you sure you want to remove ${paymentMethods[index].type} ending in ${paymentMethods[index].lastFour}?`)) {
        paymentMethods.splice(index, 1);
        updatePaymentMethodsUI();
        alert("Payment method removed successfully!");
    }
}

function addPaymentMethod() {
    const type = prompt("Enter the card type (e.g., Visa, MasterCard):");
    const lastFour = prompt("Enter the last four digits of the card:");
    if (type && lastFour && lastFour.length === 4 && !isNaN(lastFour)) {
        paymentMethods.push({ type, lastFour });
        updatePaymentMethodsUI();
        alert("New payment method added successfully!");
    } else {
        alert("Invalid input! Please provide a valid card type and 4-digit number.");
    }
}

// ─────────────────────────────────────────────
// Handle Preferences Form (Client)
// ─────────────────────────────────────────────
document.querySelector("#preferences-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const notifications = document.getElementById("notifications").value;
    const language = document.getElementById("language").value;

    alert(`Preferences saved!\nNotifications: ${notifications}\nLanguage: ${language}`);
    console.log("Updated Preferences:", { notifications, language });
});

// ─────────────────────────────────────────────
// Initialize Payment Methods on Load (Business UI Stub)
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    updatePaymentMethodsUI();
});


// Payment History
/*app.get('/payment-history', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM paymentHistory'); // Fetch all rows
        res.json(rows); // Send the data to the frontend
    } catch (err) {
        console.error('Error fetching payment history:', err);
        res.status(500).send('Error fetching payment history.');
    }
});
*/