// Initialize password data
let passwords = JSON.parse(localStorage.getItem("passwords")) || [];

// DOM Elements
const addPasswordForm = document.getElementById("add-password-form");
const passwordForm = document.getElementById("password-form");
const addPasswordBtn = document.getElementById("add-password-btn");
const cancelBtn = document.getElementById("cancel-btn");
const passwordTableBody = document.querySelector("#password-table tbody");

// Utility: Show feedback message
function showMessage(message) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.className = "message";
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// Utility: Clear form inputs
function clearForm() {
    passwordForm.reset();
    delete passwordForm.dataset.mode;
    delete passwordForm.dataset.index;
}

// Populate the password table
function populateTable(data = passwords) {
    passwordTableBody.innerHTML = ""; // Clear existing rows

    data.forEach((password, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${password.website}</td>
            <td>${password.username}</td>
            <td>
                <button onclick="editPassword(${index})">Edit</button>
                <button onclick="deletePassword(${index})">Delete</button>
                <button onclick="copyPassword(${index})">Copy</button>
            </td>
        `;
        passwordTableBody.appendChild(row);
    });
}

// Copy password functionality
function copyPassword(index) {
    const password = passwords[index].password;
    navigator.clipboard.writeText(password).then(() => {
        showMessage("Password copied to clipboard!");
    }).catch((err) => {
        console.error("Error copying password:", err);
        alert("Failed to copy password. Please try again.");
    });
}

// Search functionality
function filterPasswords() {
    const query = document.getElementById("search-bar").value.toLowerCase();
    const filteredPasswords = passwords.filter(password =>
        password.website.toLowerCase().includes(query) ||
        password.username.toLowerCase().includes(query)
    );
    populateTable(filteredPasswords); // Pass the filtered list to populateTable
}

// Input validation for forms
function validateForm(website, username, password) {
    if (!website || !username || !password) {
        alert("All fields are required!");
        return false;
    }
    return true;
}

// Handle Add/Edit Password
function handleFormSubmission(website, username, password) {
    if (passwordForm.dataset.mode === "edit") {
        // Edit Mode
        const index = passwordForm.dataset.index;
        passwords[index] = { website, username, password };
        showMessage("Password updated successfully!");
    } else {
        // Add Mode
        passwords.push({ website, username, password });
        showMessage("Password added successfully!");
    }

    // Save to localStorage and update the table
    localStorage.setItem("passwords", JSON.stringify(passwords));
    populateTable();
    addPasswordForm.classList.add("hidden");
    clearForm();
}

// Edit Password
function editPassword(index) {
    const password = passwords[index];
    document.getElementById("website").value = password.website;
    document.getElementById("username").value = password.username;
    document.getElementById("password").value = password.password;
    addPasswordForm.classList.remove("hidden");
    passwordForm.dataset.mode = "edit";
    passwordForm.dataset.index = index;
}

// Delete Password
function deletePassword(index) {
    if (confirm("Are you sure you want to delete this password?")) {
        passwords.splice(index, 1);
        localStorage.setItem("passwords", JSON.stringify(passwords));
        populateTable();
        showMessage("Password deleted successfully!");
    }
}

// Event Listeners
addPasswordBtn.addEventListener("click", () => {
    addPasswordForm.classList.remove("hidden");
    passwordForm.dataset.mode = "add"; // Set form mode
});

cancelBtn.addEventListener("click", () => {
    addPasswordForm.classList.add("hidden");
    clearForm();
});

passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const website = document.getElementById("website").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (validateForm(website, username, password)) {
        handleFormSubmission(website, username, password);
    }
});

// Add search bar dynamically
addPasswordBtn.insertAdjacentHTML("afterend", `
    <input type="text" id="search-bar" placeholder="Search by website or username" oninput="filterPasswords()">
`);

// Initial population of the table
populateTable();
