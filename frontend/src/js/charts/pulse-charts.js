import Chart from 'chart.js/auto';

//API Call - Hardcoded for testing, will need to be integrated correctly.
const course_id = '3';
const apiURL = `http://localhost:3001/courses/${course_id}/pulses/stats?entire_class=true`;

//Fetch API Data
async function fetchPulseData(apiEndPoint) {
  try {
    const response = await fetch(apiEndPoint, {
      credentials: 'include',
    });

    //Check response
    if (!response.ok) {
      throw new Error(`API Error. Status: ${response.status}`);
    }

    //Parse JSON Data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Pulse data', error);

    //Display Error to User
    document.getElementById('error-message').textContent =
      'Failed to load chart data.';
  }
}

//Format Pulse API Data for Stacked Charting Format
function transformPulseData(apiData) {
  // Helper function for colors
  function getColorForEmotion(emotion, alpha) {
    const colors = {
      Happy: `rgba(75, 192, 75, ${alpha})`,
      Tired: `rgba(255, 206, 86, ${alpha})`,
      Concerned: `rgba(255, 159, 64, ${alpha})`,
      Worried: `rgba(255, 99, 132, ${alpha})`,
    };

    return colors[emotion] || `rgba(201, 203, 207, ${alpha})`;
  }

  const stats = apiData.stats;

  const dates = [...new Set(stats.map((item) => item.bucket))].sort();
  const emotions = [...new Set(stats.map((item) => item.value))];

  const datasets = emotions.map((emotion) => {
    const data = dates.map((date) => {
      const found = stats.find((s) => s.bucket === date && s.value === emotion);
      return found ? found.count : 0;
    });

    return {
      label: emotion,
      data: data,
      fill: true,
      backgroundColor: getColorForEmotion(emotion, 0.5),
      borderColor: getColorForEmotion(emotion, 1),
      borderWidth: 2,
    };
  });

  const labels = dates.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return { labels, datasets };
}

//Create Stacked Area Chart
function createChart(chartData) {
  //Get Canvas and Chart Contexts
  const canvasElement = document.getElementById('pulseChart');
  const chartContext = canvasElement.getContext('2d');

  //Create new chart object
  const chart = new Chart(chartContext, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          stacked: true,
          beginAtZero: true,
        },
      },
    },
  });

  return chart;
}

//Orchestrator
async function initializeChart() {
  try {
    //Fetch raw data
    const rawData = await fetchPulseData(apiURL);

    //Transform Data
    const chartData = await transformPulseData(rawData);

    //Create Chart
    const chart = createChart(chartData);

    console.log('Chart created successfully');
  } catch (error) {
    console.error('Failed to initialize chart:', error);
    document.getElementById('error-message').textContent =
      'Failed to load chart';
  }
}

//Initialize after page load.
document.addEventListener('DOMContentLoaded', initializeChart);
