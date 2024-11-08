async function registerUser() {
  const response = await fetch("/customers/register", {
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
}

async function loginUser() {
  const response = await fetch("/customers/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    }),
  });
  const result = await response.json();
  if (result.token) {
    localStorage.setItem("authToken", result.token);
    alert("Login successful");
  } else {
    alert(result.message);
  }
}
