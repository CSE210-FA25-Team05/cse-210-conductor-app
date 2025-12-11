import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getAttendanceStatsForLecture } from '/src/js/api/attendance.js';


//Fetch API Data
async function attendanceData() {
  try {
    const attendance = await getAttendanceStatsForLecture(getCourseId(), 4);
    return attendance;

  } catch (error) {

    console.error('Error fetching Attendance data', error);

    //Display Error to User
    document.getElementById('error-message').textContent =
      'Failed to load chart data.';
    throw error;
  }
}

//Format Attendance API Data for Pie Chart Format
function transformAttendanceData(apiData) {
  
  const present = apiData.total_present;
  const absent = apiData.total_enrolled - apiData.total_present;

  return {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [present, absent],
      backgroundColor: [
        'rgba(75, 192, 75, 0.8)',  // Green for present
        'rgba(255, 99, 132, 0.8)'   // Red for absent
      ],
      borderColor: [
        'rgba(75, 192, 75, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 2
    }]
  };
}
  
  

//Create Pie Chart
function createChart(chartData) {
  //Get Canvas and Chart Contexts
  const canvasElement = document.getElementById('attendanceChart');
  const chartContext = canvasElement.getContext('2d');

  //Create new chart object
  /* global Chart */
  const chart = new Chart(chartContext, {
    type: 'pie',
    data: {
      labels: chartData.labels,
      datasets: chartData.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    },
  });

  return chart;
}

//Orchestrator
async function initializeChart() {
  try {
    //Fetch raw data
    const rawData = await attendanceData();
    console.log('Raw API data:', rawData);  // DEBUG

    //Transform Data
    const chartData = transformAttendanceData(rawData);

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
