// Placeholder for password data
const passwords = [
    { website: "example.com", username: "user1" },
    { website: "testsite.com", username: "user2" },
];

// Populate the password table
function populateTable() {
    const tableBody = document.querySelector("#password-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    passwords.forEach((password, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${password.website}</td>
            <td>${password.username}</td>
            <td>
                <button onclick="editPassword(${index})">Edit</button>
                <button onclick="deletePassword(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Initialize the table
populateTable();
