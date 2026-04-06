let editStudentId = null;

// Show logged-in faculty name
document.addEventListener("DOMContentLoaded", function() {
    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user || user.userType !== "faculty") {
        alert("Access Denied!");
        window.location.href = "login.html";
        return;
    }

    document.getElementById("facultyName").textContent = user.username;

    loadStudents();
});


// ✅ ADD / UPDATE STUDENT
document.getElementById("studentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let rollNo = document.getElementById("rollNo").value.trim();
    let name = document.getElementById("studentName").value.trim();

    if (!rollNo || !name) {
        alert("Fill all fields");
        return;
    }

    // ✏️ UPDATE
    if (editStudentId !== null) {

        fetch(`http://127.0.0.1:5000/update_student/${editStudentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rollNo, name })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            editStudentId = null;
            loadStudents();

            // ✅ CLEAR FIELDS
            document.getElementById("studentForm").reset();
        });

        return;
    }

    // ➕ ADD
    fetch("http://127.0.0.1:5000/add_student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, name })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadStudents();

        // ✅ CLEAR FIELDS
        document.getElementById("studentForm").reset();
    });
});


// 📋 LOAD STUDENTS
function loadStudents() {
    fetch("http://127.0.0.1:5000/get_students")
    .then(res => res.json())
    .then(students => {

        let table = document.getElementById("studentTable");
        table.innerHTML = "";

        students.forEach((student, index) => {
            table.innerHTML += `
                <tr>
                    <td>${student.rollNo}</td>
                    <td>${student.name}</td>
                    <td><input type="checkbox" id="attend_${index}"></td>
                    <td>
                        <button onclick="editStudent(${student.id}, '${student.rollNo}', '${student.name}')">Edit</button>
                        <button onclick="deleteStudentDB(${student.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    });
}


// ✏️ EDIT STUDENT (DB)
function editStudent(id, rollNo, name) {

    document.getElementById("rollNo").value = rollNo;
    document.getElementById("studentName").value = name;

    editStudentId = id;
}


// 🗑 DELETE STUDENT (DB)
function deleteStudentDB(id) {

    if (!confirm("Delete this student?")) return;

    fetch(`http://127.0.0.1:5000/delete_student/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        loadStudents();
    });
}


// ✅ SAVE ATTENDANCE (UNCHANGED)
function saveAttendance() {

    let subject = document.getElementById("subjectName").value.trim();
    let date = document.getElementById("attendanceDate").value;

    if (!subject || !date) {
        alert("Enter subject and date!");
        return;
    }

    let rows = document.querySelectorAll("#studentTable tr");

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    // 🔥 REMOVE OLD DATA (same subject + date)
    attendance = attendance.filter(record =>
        !(record.subject === subject && record.date === date)
    );

    // ✅ ADD NEW DATA
    rows.forEach((row, index) => {

        let rollNo = row.cells[0].innerText;
        let name = row.cells[1].innerText;
        let present = document.getElementById(`attend_${index}`).checked;

        attendance.push({
            subject,
            date,
            rollNo,
            name,
            present
        });

    });

    localStorage.setItem("attendance", JSON.stringify(attendance));

    alert("✅ Attendance Saved!");
}

document.getElementById("attendanceDate").addEventListener("change", function () {

    let checkboxes = document.querySelectorAll("#studentTable input[type='checkbox']");

    checkboxes.forEach(cb => {
        cb.checked = false;
    });

});

document.getElementById("subjectName").addEventListener("input", function () {

    let checkboxes = document.querySelectorAll("#studentTable input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);

});

//calculateAttendance
function calculateAttendance() {

    let subject = document.getElementById("subjectName").value.trim();

    if (!subject) {
        alert("Enter subject!");
        return;
    }

    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

    let stats = {};

    attendance.forEach(record => {

        if (record.subject === subject) {   // ✅ FILTER BY SUBJECT

            if (!stats[record.rollNo]) {
                stats[record.rollNo] = {
                    name: record.name,
                    total: 0,
                    present: 0
                };
            }

            stats[record.rollNo].total++;

            if (record.present) {
                stats[record.rollNo].present++;
            }
        }

    });

    if (Object.keys(stats).length === 0) {
        alert("No attendance data for this subject");
        return;
    }

    let result = "Attendance Report:\n\n";

    for (let roll in stats) {

        let data = stats[roll];

        let percent = data.total === 0
            ? 0
            : ((data.present / data.total) * 100).toFixed(2);

        result += `${roll} - ${data.name}: ${percent}%`;

        if (percent < 75) {
            result += " ⚠ Low Attendance";
        }

        result += "\n";
    }

    alert(result);
}

// Load on start
// Load
// 🔔 Load reminders on start
document.addEventListener("DOMContentLoaded", function () {
    loadReminders();
});

// 🔔 Ask permission
function requestPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                alert("✅ Notifications Enabled!");
            } else {
                alert("❌ Permission Denied");
            }
        });
    }
}

// 🔊 Sound
function playSound() {
    document.getElementById("alertSound").play();
}

// 🔔 Browser Notification
function showBrowserNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Reminder", {
            body: message
        });
    }
}

// 💬 Popup Notification
function showNotification(message) {
    let container = document.getElementById("notificationContainer");

    let div = document.createElement("div");
    div.className = "notification";
    div.innerText = message;

    container.appendChild(div);

    setTimeout(() => div.remove(), 5000);
}

// ➕ Add Reminder
document.getElementById("reminderForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let task = document.getElementById("task").value;
    let time = document.getElementById("reminderTime").value;

    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    reminders.push({
        task,
        time,
        triggered: false
    });

    localStorage.setItem("reminders", JSON.stringify(reminders));
    loadReminders();
    this.reset();
});

// 📋 Load Reminders
function loadReminders() {
    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    let table = document.getElementById("reminderTable");

    table.innerHTML = "";

    reminders.forEach((r, index) => {
        table.innerHTML += `
            <tr>
                <td>${r.task}</td>
                <td>${new Date(r.time).toLocaleString()}</td>
                <td>
                    <button onclick="deleteReminder(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// ❌ Delete
function deleteReminder(index) {
    let reminders = JSON.parse(localStorage.getItem("reminders"));
    reminders.splice(index, 1);
    localStorage.setItem("reminders", JSON.stringify(reminders));
    loadReminders();
}

// ⏰ CHECK EVERY SECOND (IMPORTANT FIX)
setInterval(() => {

    let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    let now = new Date();

    reminders.forEach((r) => {

        let reminderTime = new Date(r.time);

        // 🔥 EXACT TIME TRIGGER
        if (!r.triggered && now >= reminderTime) {
            triggerReminder("🔔 Reminder: " + r.task);
            r.triggered = true;
        }

    });

    localStorage.setItem("reminders", JSON.stringify(reminders));

}, 1000); // every 1 sec

// 🔥 FINAL TRIGGER
function triggerReminder(message) {
    showNotification(message);
    showBrowserNotification(message);
    playSound();
}

function logout() {
    localStorage.removeItem("loggedInUser");

    alert("Logged out successfully");

    window.location.href = "login.html";
}