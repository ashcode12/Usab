// Initialize password data
let passwords = JSON.parse(localStorage.getItem("passwords")) || [];

// DOM Elements
const addPasswordForm = document.getElementById("add-password-form");
const passwordForm = document.getElementById("password-form");
const addPasswordBtn = document.getElementById("add-password-btn");
const cancelBtn = document.getElementById("cancel-btn");
const passwordTableBody = document.querySelector("#password-table tbody");
const togglePasswordButton = document.getElementById("toggle-password");

// Utility: Show feedback message
function showMessage(message, type = "success", duration = 3000) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.className = `message ${type}`;

    if (type === "undo") {
        msgDiv.addEventListener("click", () => {
            const undoHandler = msgDiv.dataset.undoHandler;
            if (undoHandler) window[undoHandler]();
        });
        msgDiv.textContent += " (Click to Undo)";
    }

    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove();
    }, duration);
}


// Utility: Clear form inputs
function clearForm() {
    passwordForm.reset();
    delete passwordForm.dataset.mode;
    delete passwordForm.dataset.index;
}

// Populate the password table with intuitive icons for actions
function populateTable(data = passwords) {
    passwordTableBody.innerHTML = ""; // Clear existing rows

    data.forEach((password, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${password.website}</td>
            <td>${password.username}</td>
            <td>
                <button onclick="editPassword(${index})" title="Edit"><span role="img" aria-label="Edit">✏️</span></button>
                <button onclick="deletePassword(${index})" title="Delete"><span role="img" aria-label="Delete">🗑️</span></button>
                <button onclick="copyPassword(${index})" title="Copy"><span role="img" aria-label="Copy">📋</span></button>
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
    const deletedPassword = passwords[index];

    if (confirm("Are you sure you want to delete this password?")) {
        passwords.splice(index, 1);
        localStorage.setItem("passwords", JSON.stringify(passwords));
        populateTable();

        showMessage("Password deleted! Click here to undo.", "undo", 5000);

        // Store undo logic in message dataset
        const undoDelete = () => {
            passwords.splice(index, 0, deletedPassword);
            localStorage.setItem("passwords", JSON.stringify(passwords));
            populateTable();
            showMessage("Delete undone!", "success");
        };

        const msgDiv = document.querySelector(".message.undo");
        msgDiv.dataset.undoHandler = `undoDelete`;
        window.undoDelete = undoDelete; // Expose function globally for undo
    }
}



// Toggle Password Visibility
togglePasswordButton.addEventListener("click", () => {
    const passwordField = document.getElementById("password");
    if (passwordField.type === "password") {
        passwordField.type = "text";
        togglePasswordButton.textContent = "🙈"; // Change icon to 'Hide'
        togglePasswordButton.setAttribute("aria-label", "Hide password");
    } else {
        passwordField.type = "password";
        togglePasswordButton.textContent = "👁️"; // Change icon to 'Show'
        togglePasswordButton.setAttribute("aria-label", "Show password");
    }
});

// Password Strength Indicator
document.getElementById("password").addEventListener("input", () => {
    const password = document.getElementById("password").value;
    const strengthIndicator = document.getElementById("password-strength");

    // Function to calculate password strength
    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[@$!%*?&#]/.test(password)) strength++;
        return strength;
    };

    const strength = calculateStrength(password);

    // Update strength indicator
    strengthIndicator.classList.remove("weak", "medium", "strong", "hidden");
    if (strength <= 2) {
        strengthIndicator.textContent = "Weak";
        strengthIndicator.classList.add("weak");
    } else if (strength === 3 || strength === 4) {
        strengthIndicator.textContent = "Medium";
        strengthIndicator.classList.add("medium");
    } else if (strength === 5) {
        strengthIndicator.textContent = "Strong";
        strengthIndicator.classList.add("strong");
    }

    // Hide the indicator if no password
    if (!password) {
        strengthIndicator.classList.add("hidden");
    }
});

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

// Keyboard Shortcuts

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case "f": // Search
                event.preventDefault();
                document.getElementById("search-bar").focus();
                break;
            case "n": // Add password
                event.preventDefault();
                addPasswordBtn.click();
                break;
            case "1": // Home
                window.location.href = "home.html";
                break;
            case "2": // Private Vault
                window.location.href = "private-vault.html";
                break;
            case "3": // Shared Vault
                window.location.href = "shared-vault.html";
                break;
            case "4": // About
                window.location.href = "about.html";
                break;
            default:
                break;
        }
    }
});


// Initial population of the table
populateTable();
