// ───────────────────────────────
// Homepage JS
// ───────────────────────────────

// ─── Dynamic Service Display ───
async function loadServices() {
    try {
        const response = await fetch('/auth/getServices');
        if (!response.ok) throw new Error('Failed to fetch services.');
        const services = await response.json();

        const companyContainer = document.querySelector('.company-container');
        companyContainer.innerHTML = '';

        const groupedServices = services.reduce((grouped, service) => {
            const businessName = service.business_name || "Unknown Business";
            if (!grouped[businessName]) grouped[businessName] = [];
            grouped[businessName].push(service);
            return grouped;
        }, {});

        for (const [businessName, services] of Object.entries(groupedServices)) {
            const businessDiv = document.createElement('div');
            businessDiv.classList.add('business');

            const heading = document.createElement('h3');
            heading.textContent = businessName;
            businessDiv.appendChild(heading);

            const list = document.createElement('ul');
            list.style.listStyleType = 'none';
            list.style.paddingLeft = '0';

            services.forEach(service => {
                const item = document.createElement('li');
                item.innerHTML = `<strong>${service.name}</strong>: $${service.price}`;
                item.style.marginBottom = '5px';
                list.appendChild(item);
            });

            businessDiv.appendChild(list);
            companyContainer.appendChild(businessDiv);
        }
    } catch (error) {
        console.error('Error loading services:', error);
        alert('Failed to load services.');
    }
}

// ─── Search Filtering ───
async function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById("search-bar").value.toLowerCase().trim();
    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    try {
        const response = await fetch(`/searchServices?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Failed to fetch search results.");
        const results = await response.json();

        const companyContainer = document.querySelector(".company-container");
        companyContainer.innerHTML = '';

        if (results.length === 0) {
            alert("No matching services found.");
            return;
        }

        results.forEach(service => {
            const companyDiv = document.createElement("div");
            companyDiv.classList.add("company");
            companyDiv.innerHTML = `
                <h4>${service.business_name}</h4>
                <ul><li><strong>${service.name}</strong>: $${service.price}</li></ul>
            `;
            companyContainer.appendChild(companyDiv);
        });
    } catch (error) {
        console.error("Error fetching search results:", error);
        alert("An error occurred while searching for services.");
    }
}

// ─── Add to Cart UX (Optional) ───
function addToCart() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const location = document.getElementById("location").value;

    const selectedServices = [
        document.getElementById("residential-services").value,
        document.getElementById("carwash-services").value,
        document.getElementById("petgrooming-services").value
    ].filter(service => service);

    if (selectedServices.length === 0 || !date || !time || !location) {
        alert("Please select at least one service and fill in the date, time, and location.");
        return;
    }

    const cartList = document.getElementById("cart-items");
    selectedServices.forEach(service => {
        const item = document.createElement("li");
        item.textContent = `${service} - Date: ${new Date(date).toDateString()} | Time: ${time} | Location: ${location}`;
        cartList.appendChild(item);
    });

    // Clear fields
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("location").value = "";
    document.getElementById("residential-services").value = "";
    document.getElementById("carwash-services").value = "";
    document.getElementById("petgrooming-services").value = "";
}

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
    loadServices();
});
