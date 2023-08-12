const signUpBtn = document.querySelector("#sign-up-btn");
const signInBtn = document.querySelector("#sign-in-btn");
const container = document.querySelector(".container");
const formEl = document.getElementById("form2");
const formlogin = document.getElementById("form1");
const usernameText = document.getElementById("text1");
const emailText = document.getElementById("text2");
const passwordText = document.getElementById("text3");

let BASEURL = "https://weak-red-ant-sock.cyclic.app";

signUpBtn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

signInBtn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Validation
const emailInput = document.getElementById("email");
emailInput.addEventListener("input", validateEmail);

const usernameInput = document.getElementById("name");
usernameInput.addEventListener("input", validateUsername);

const passwordInput = document.getElementById("password");
passwordInput.addEventListener("input", validatePassword);

function validateEmail() {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const email = emailInput.value;

  if (email.match(emailRegex)) {
    emailText.textContent = "Email is valid";
    emailText.style.color = "#00ff00";
    setTimeout(() => {
      emailText.textContent = "";
    }, 1000);
  } else {
    emailText.textContent = "Please enter a valid email";
    emailText.style.color = "#ff0000";
  }
}

function validateUsername() {
  const usernameRegex = /^(?!.*([A-Za-z0-9])\1)[A-Za-z0-9]{3,16}$/;
  const username = usernameInput.value;

  if (username.match(usernameRegex)) {
    usernameText.textContent = "Username is valid";
    usernameText.style.color = "#00ff00";
    setTimeout(() => {
      usernameText.textContent = "";
    }, 1000);
  } else {
    usernameText.textContent =
      "Username must be alphanumeric (3-16 characters)";
    usernameText.style.color = "#ff0000";
  }
}

function validatePassword() {
  const password = passwordInput.value;

  if (password.trim() !== "") {
    passwordText.textContent = "Password is valid";
    passwordText.style.color = "#00ff00";
    setTimeout(() => {
      passwordText.textContent = "";
    }, 1000);
  } else {
    passwordText.textContent = "Please enter a password";
    passwordText.style.color = "#ff0000";
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (
    emailInput.value === "" ||
    usernameInput.value === "" ||
    passwordInput.value === ""
  ) {
    emailText.textContent = "Please enter an email";
    usernameText.textContent = "Please enter a username";
    passwordText.textContent = "Please enter a password";

    emailText.style.color = "#ff0000";
    usernameText.style.color = "#ff0000";
    passwordText.style.color = "#ff0000";
  } else {
    try {
    
      const userObj = {
        username: usernameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      };

      const response = await fetch(`${BASEURL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userObj),
      });

      
      if(response.status === 401){
        alert("Email already registered")
      }
      if(response.status === 200){
        alert("Registration success ! Verification link sent to mail")
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }
});

// login and email verification

formlogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    let email = document.getElementById("email1").value;
    let password = document.getElementById("password1").value;
    let obj = {
      email: email,
      password: password,
    };

    let res = await fetch(`${BASEURL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (res.ok) {
      let response = await res.json();
      console.log(response.isVerified);

      // Checking if the email is verified
      if (response.isVerified) {
        // Email is verified, proceed with login
        storeUserInLocalStorage(response);
        alert("Login Successfully");
        window.location.href = "../dashboard.html";
      } else {
        // Email is not verified
        alert("Email verification required.");
      }
    } else if (res.status === 401) {
      // Wrong credentials
      alert("Wrong Credentials");
    } else {
      alert("Login request failed");
    }
  } catch (error) {
    alert("Something went wrong");
  }
});

async function verifyEmail(userId) {
  try {
    let verifyRes = await fetch(`${BASEURL}/user/verify?id=${userId}`, {
      method: "GET",
    });
    return verifyRes;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function storeUserInLocalStorage(user) {
  localStorage.setItem("token", user.token);
  localStorage.setItem("userId", user.userId);
  localStorage.setItem("username", user.username);
}

