document.addEventListener("DOMContentLoaded", function() {

    // Fetch data from db.json or your API endpoint
    fetch('./db.json')
      .then(response => response.json())
      .then(data => {
        const combinedComments = data.reduce((totalComments, video) => {
          const commentsData = video.Video.comments;
          return totalComments.concat(commentsData);
        }, []);
  
        // Filter comments within the last 24 hours
        const last24Hours = filterCommentsByTime(combinedComments, 24);
        console.log(last24Hours.length);
        
        // Filter comments within the last 48 hours
        const last48Hours = filterCommentsByTime(combinedComments, 48);
        console.log({ "last48Hours": last48Hours.length });
        
        // Get the total comment count
        const totalComments = combinedComments.length;
        console.log({ "totalComments": totalComments });
        
        // Create a chart using Chart.js
        createChart('chart3', 'Comment Count', [last24Hours, last48Hours, totalComments], ['Last 24 Hours', 'Last 48 Hours', 'All Time']);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
  
  function createChart(chartId, chartLabel, data, labels) {
    const ctx = document.getElementById(chartId);
  
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
  
  function filterCommentsByTime(commentsData, hours) {
    const currentTime = new Date();
    const timeThreshold = currentTime.getTime() - hours * 60 * 60 * 1000;
  
    const filteredComments = commentsData.filter(entry => {
      const commentTime = new Date(entry.commentTime).getTime();
      return commentTime >= timeThreshold;
    });
    return filteredComments.length;
  } 
