window.addEventListener("load", () => {
    getData();
  });
  
  async function getData() {
    try {
      let response = await fetch("http://13.233.69.180:3000/api/getcourses");
      let data = await response.json();
      console.log(data);
  
      const combinedLikes = data.reduce((totalLikes, video) => {
        const likesData = video.content.likedby;
        console.log(likesData)
        return totalLikes.concat(likesData);
      }, []);
  
      // Filter likes within the last 24 hours
      const last24Hours = filterLikesByTime(combinedLikes, 24);
      console.log(last24Hours);
  
      // Filter likes within the last 48 hours
      const last48Hours = filterLikesByTime(combinedLikes, 48);
      console.log(last48Hours);
  
      // Get the total likes count
      const totalLikes = combinedLikes.length;
      console.log(totalLikes);
  
      // Create a chart using Chart.js
      createChart('chart1', 'Likes Count', [last24Hours, last48Hours, totalLikes], ['Last 24 Hours', 'Last 48 Hours', 'All Time']);
    } catch (err) {
      console.log(err);
    }
  }
  
  function createChart(chartId, chartLabel, data, labels) {
    const ctx = document.getElementById(chartId).getContext('2d');
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: chartLabel,
          data: data,
          backgroundColor: ['rgba(0, 123, 255, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
          borderColor: ['rgba(0, 123, 255, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  function filterLikesByTime(likesData, hours) {
    const currentTime = new Date();
    const timeThreshold = currentTime.getTime() - hours * 60 * 60 * 1000;
  
    const filteredLikes = likesData.filter(entry => {
      const likeTime = new Date(entry.likeTime).getTime();
      return likeTime >= timeThreshold;
    });
  
    return filteredLikes.length;
  }
  