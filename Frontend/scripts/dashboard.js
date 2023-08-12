
let dataforfilter = []

window.addEventListener("load",()=>{
  getData()
})


async function getData(){
    try{
      let data = await  fetch("http://13.233.69.180:3000/api/getcourses")
      data = await data.json();

    dataforfilter = data


      displayData(data)
    }
    catch(err){
      console.log(err)
    }
}



function displayData(data){

document.querySelector("#main-section").innerHTML = null;
data.forEach((el)=>{
let card = document.createElement("div")
card.setAttribute("class","display-content")
let imagediv = document.createElement("div")
imagediv.setAttribute("id","image-container")

let image = document.createElement("img");
image.setAttribute("id","imagedisplay");

image.setAttribute("src",el.content[0].thumbnailURL)

image.addEventListener("click",(e)=>{
  e.preventDefault()
  clickevent(el._id, el.content[0].videoUrl, el.content[0].videoName)
})




let title = document.createElement("h3")

title.innerText =`Title : ${el.title}` ;
title.style.color = "#800020";


let owner = document.createElement("h3")
owner.innerText = `Created By : ${el.creatorName}`;
owner.style.color = "#b14675";



let createdDate  = document.createElement("h3")

createdDate.style.color = "#b14675";

const dateTimeString = el.content[0].postedAt;
const dateTime = new Date(dateTimeString);

// Extracting individual components
const year = dateTime.getFullYear();
const month = dateTime.getMonth() + 1; // January is month 0
const day = dateTime.getDate();
const hours = dateTime.getHours();
const minutes = dateTime.getMinutes();
const seconds = dateTime.getSeconds();

// Creating the formatted date and time string
const formattedDateTime = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}  ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;




createdDate.innerText =`Posted At : ${formattedDateTime}` ;

imagediv.append(image)
card.append(image,title,owner,createdDate)


document.querySelector("#main-section").append(card);


})



}






function clickevent(id,url,name){



localStorage.setItem("videoUrl",url)
localStorage.setItem("videoName",name)
localStorage.setItem("postId",id)
window.location.href = "./content.html"


}






var selectElement = document.getElementById("courseSelect");

selectElement.addEventListener("change",filterfunc)




function filterfunc(){

let data = dataforfilter

    var selectedCourse = selectElement.value;

if(selectedCourse == ""){
  displayData(data)
}
else{

  let filteredData = data.filter((el)=>{
    console.log(selectedCourse)
 
         return el.title == selectedCourse
         
       })

       displayData(filteredData)
       
}

  
 

}
