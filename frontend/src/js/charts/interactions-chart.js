import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getInteractionStats } from '/src/js/api/interactions.js';

//Fetch API Data
async function fetchInteractionData() {
  try {
    const filters = {
      entire_class: true,
    };
    const interactions = await getInteractionStats(getCourseId(), filters);
    console.log(interactions);

    return interactions;
  } catch (error) {
    console.error('Error fetching Interaction data', error);

    //Display Error to User
    document.getElementById('error-message').textContent =
      'Failed to load chart data.';
    throw error;
  }
}

//Format Interaction API Data for Stacked Charting Format
function transformInteractionData(apiData) {
  // Helper function for colors
  function getColorForValue(value, alpha) {
    const colors = {
      positive: `rgba(75, 192, 75, ${alpha})`,
      neutral: `rgba(255, 206, 86, ${alpha})`,
      negative: `rgba(255, 99, 132, ${alpha})`,
    };

    return colors[value.toLowerCase()] || `rgba(201, 203, 207, ${alpha})`;
  }

  const stats = apiData.stats;

  const dates = [...new Set(stats.map((item) => item.bucket))].sort();
  const values = [...new Set(stats.map((item) => item.value))];

  const datasets = values.map((value) => {
    const data = dates.map((date) => {
      const found = stats.find((s) => s.bucket === date && s.value === value);
      return found ? found.count : 0;
    });

    return {
      label: value,
      data: data,
      fill: true,
      backgroundColor: getColorForValue(value, 0.5),
      borderColor: getColorForValue(value, 1),
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
  const canvasElement = document.getElementById('interactionChart');
  const chartContext = canvasElement.getContext('2d');

  console.log('here', chartData);
  //Create new chart object
  // The below tag tells our linter to ignore 'Chart not defined'
  // Chart is defined globally when adding CDN script in <head>
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
    const rawData = await fetchInteractionData();

    //Transform Data
    const chartData = transformInteractionData(rawData);

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
