document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const userType = document.getElementById("userType").value;

    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, userType })
    })
    .then(res => res.json())
    .then(data => {
    console.log(data);

    if (data.message) {
        alert(data.message);
        window.location.href = "login.html";
    } else {
        document.getElementById("regError").innerText = data.error;
    }
})
.catch(error => {
    console.error(error);
    document.getElementById("regError").innerText = "Server not responding";
});
});