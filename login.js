document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    console.log("Login clicked"); // DEBUG

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const userType = document.getElementById("userType").value;

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, userType })
    })
    .then(res => res.json())
    .then(data => {
        console.log("response:",data); // DEBUG

        if (data.message) {
            console.log("Redirecting..");

            // 🔀 Redirect based on user type
            if (userType === "admin") {
                window.location.href = "admin.html";
            } 
            else if (userType === "faculty") {
                window.location.href = "faculty.html";
            } 
           

        } else {
            alert(data.error);
        }
		if (data.message) {

    localStorage.setItem("loggedInUser", JSON.stringify({
        username: username,
        userType: userType
    }));

    if (userType === "admin") {
        window.location.href = "admin.html";
    } else if (userType === "faculty") {
        window.location.href = "faculty.html";
    }
}
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error");
    });
});