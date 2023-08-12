const sendLink = document.getElementById("sendLink");
const email = document.getElementById("email");

let BASEURL = "https://weak-red-ant-sock.cyclic.app";

sendLink.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const userObj = {
      email: email.value,
    };
    const response = await fetch(`${BASEURL}/user/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userObj),
    });
    if (response.status === 404) {
      alert("User not found");
    }
    if(response.status===301){
      alert("First verify your mail to reset password")
    }
    const data = await response.json();
    if (response.status === 200) {
      alert("Reset password email is sent to your email");
    }
  } catch (error) {
    console.log(error);
  }
});
