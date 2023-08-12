

//let video = document.getElementById("video-content");
let left  = document.getElementById("left-side");
let videoUrl = localStorage.getItem("videoUrl");
let videoName = localStorage.getItem("videoName");
let postId = localStorage.getItem("postId")


document.title = videoName;



  
  display(videoUrl,videoName,postId)

  function display(videoUrl,videoName,postId) {
    console.log(videoUrl,videoName,postId)
    left.innerHTML = null;
    let enterVid = document.createElement("div");
    enterVid.setAttribute("id", "video-content");
    let vid = document.createElement("video");
    vid.src = videoUrl;
    vid.controls = true;
  
    let vidName = document.createElement("h3");
    let str = videoName;
    const start_index = str.indexOf("/") + 1;
    const end_index = str.indexOf("-");
    let data_analyst = str.substring(start_index, end_index);
    vidName.innerText = data_analyst;
  
    let likes = document.createElement("div");
    likes.setAttribute("id", "like");
    let like_given = document.createElement("img");
    let total_Likes = document.createElement("span");
  
    // Get initial like count from localStorage or default to 0
    let likeCount = parseInt(localStorage.getItem("likeCount")) || 0;
    total_Likes.innerText = likeCount;
    
    async function getLikes(postId){
    
      try {
        await fetch(`http://13.233.69.180:3000/api/getcourse/${postId}`,{
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res)=>res.json())
      .then((data)=>{
        
      
      
      
      })
      return likes
      } catch (error) {
        console.log(error)
      }
    }
    // window.onload = function (){
      getLikes(postId)
    // }




    like_given.src =
      "https://img.icons8.com/?size=1x&id=24816&format=png";
    like_given.addEventListener("click",  async()=> {
      const response = await fetch("")
      // Increase like count
      likeCount++;
      // Update total_Likes element
      total_Likes.innerText = likeCount;
      // Store the updated like count in localStorage
      localStorage.setItem("likeCount", likeCount);
    });
  
    likes.append(like_given, total_Likes);
    enterVid.append(vid, vidName, likes);
  
    let commentSection = document.createElement("div");
    commentSection.setAttribute("id", "commentSection");
  
    let commentInput = document.createElement("input");
    commentInput.setAttribute("type", "text");
    commentInput.setAttribute("placeholder", "Enter your comment");
    commentInput.style.width = "100%";
    commentInput.style.height = "5vh";
    commentInput.style.borderRadius = "2rem";
    commentInput.style.marginTop = "1rem"
  
    commentInput.addEventListener("change", function () {
      // Store the comment in localStorage
      let comment = commentInput.value;
      localStorage.setItem("userComment", comment);
  
      // Display the comment in the commentSection
      let commentDiv = document.createElement("div");
      commentDiv.innerText = comment;
      commentSection.appendChild(commentDiv);
  
      // Clear the input field
      commentInput.value = "";
    });
  
    commentSection.appendChild(commentInput);
  
    left.append(enterVid, commentSection);
  }
  



