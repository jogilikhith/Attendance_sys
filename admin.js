let editId = null;

document.addEventListener("DOMContentLoaded", function () {

    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user || user.userType !== "admin") {
        alert("Access Denied!");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("currentUser").textContent =
        user.username + " (" + user.userType + ")";

    loadFacultyAccounts();

    // ✅ FORM SUBMIT
    document.getElementById("facultyForm").addEventListener("submit", function (e) {
        e.preventDefault();

        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();

        // 🔴 ✅ PLACE VALIDATION HERE
        if (!username || !password) {
            alert("Please fill all fields");
            return;
        }

        if (editId === null) {

            fetch("http://127.0.0.1:5000/add_faculty", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || data.error);
                loadFacultyAccounts();
            });

        } else {

            fetch(`http://127.0.0.1:5000/update_faculty/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                editId = null;
                loadFacultyAccounts();
            });
        }

        document.getElementById("facultyForm").reset();
    });

});



// 📋 Load Faculty Accounts
function loadFacultyAccounts() {

    fetch("http://127.0.0.1:5000/get_faculty")
    .then(res => res.json())
    .then(users => {

        let table = document.getElementById("facultyTable");
        table.innerHTML = "";

        users.forEach((user) => {
            table.innerHTML += `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.password}</td>
                    <td>
                        <button onclick="editFaculty(${user.id}, '${user.username}', '${user.password}')">Edit</button>
                        <button onclick="deleteFaculty(${user.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    });
}

// ✏️ Edit Account


function editFaculty(id, username, password) {

    document.getElementById("username").value = username;
    document.getElementById("password").value = password;

    editId = id;
}


// 🗑 Delete Account
function deleteFaculty(id) {

    if (!confirm("Are you sure to delete?")) return;

    fetch(`http://127.0.0.1:5000/delete_faculty/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadFacultyAccounts();
    })
    .catch(err => {
        console.error(err);
        alert("Delete failed");
    });
}


// 🚪 Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}
