import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getPulseStats } from '/src/js/api/pulse.js';

//Fetch API Data
async function fetchPulseData() {
  try {
    const params = {
      entire_class: 'true',
    };
    const pulses = getPulseStats(getCourseId(), params);
    return pulses;
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
  // The below tag tells our linter to ignore 'Chart not defined'
  // Chart is defined globally when adding CDN scropt in <head>
  /* global Chart */
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
    const rawData = await fetchPulseData();

    //Transform Data
    const chartData = transformPulseData(rawData);

    //Create Chart
    createChart(chartData);

    console.log('Chart created successfully');
  } catch (error) {
    console.error('Failed to initialize chart:', error);
    document.getElementById('error-message').textContent =
      'Failed to load chart';
  }
}

//Initialize after page load.
document.addEventListener('DOMContentLoaded', initializeChart);
