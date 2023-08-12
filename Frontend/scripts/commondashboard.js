window.onload = function () {
    let token = localStorage.getItem("username");
    if (token === null) {
        window.location = "./index.html";
        // alert("Login first to access the website");
    }
};



const url = "http://localhost:8080"

const cl = document.getElementById("onclickk")
cl.addEventListener("click",(e)=>{
    e.preventDefault()
    async function logoutfun(){
        let log = await fetch(`${url}/user/logout`,{
            method:"GET",
            headers:{
                "Content-type": "application/json",
                Authorization: `${localStorage.getItem("token")}`
            },
        })
        if(log.ok){
         localStorage.removeItem("token")
         alert("Logout successfull..!!")
          localStorage.removeItem("username")
          window.open("./index.html");
        }
    }
    logoutfun()
})