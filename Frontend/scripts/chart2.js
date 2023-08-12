fetch('db.json')
  .then(response => response.json())
  .then(data => {
    const videos = data;

    // Calculate total likes, total comments, and total views
    let totalLikes = 0;
    let totalComments = 0;
    let totalViews = 0;

    videos.forEach(video => {
      totalLikes += video.Video.likedby.length;
      totalComments += video.Video.comments.length;
      totalViews += video.Video.viewedby.length;
    });

    // Create the graph
    const ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Likes', 'Comments', 'Views'],
        datasets: [{
          label: 'Total',
          data: [totalLikes, totalComments, totalViews],
          backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });