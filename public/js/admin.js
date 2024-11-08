// Admin Registration
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      }),
    });
    const result = await response.json();
    alert(result.message);
  });

// Admin Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const response = await fetch("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }),
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem("adminToken", result.token);
    alert("Login successful");
  } else {
    alert(result.message);
  }
});

// Add Train
document
  .getElementById("addTrainForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const response = await fetch("/admin/add-train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainNumber: document.getElementById("trainNumber").value,
        name: document.getElementById("name").value,
        startStation: document.getElementById("startStation").value,
        endStation: document.getElementById("endStation").value,
        stoppages: document.getElementById("stoppages").value.split(","),
      }),
    });
    const result = await response.json();
    alert(result.message);
  });
