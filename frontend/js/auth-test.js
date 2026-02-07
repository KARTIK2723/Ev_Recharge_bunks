import { registerUser, loginUser } from "./auth.js";

const status = document.getElementById("status");

document.getElementById("registerBtn").onclick = async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const user = await registerUser(email, password, name);
    status.innerText = "Registered: " + user.email;
    console.log("REGISTER SUCCESS", user);
  } catch (err) {
    status.innerText = err.message;
    console.error(err);
  }
};

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const user = await loginUser(email, password);
    status.innerText = "Logged in: " + user.email;
    console.log("LOGIN SUCCESS", user);
  } catch (err) {
    status.innerText = err.message;
    console.error(err);
  }
};
