import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getAttendanceStatsForLecture } from '/src/js/api/attendance.js';

class AttendanceChart extends HTMLElement {
  constructor() {
    super();
    this.lecture = this.getAttribute('lecture-id') || 61;
    this.chartInstance = null;
  }

  static get observedAttributes() {
    // This tells the element to watch for changes on `lecture-id`
    return ['lecture-id'];
  }

  connectedCallback() {
    this.container = document.createElement('div');
    this.errorMsg = document.createElement('p');
    this.canvas = document.createElement('canvas');

    this.container.appendChild(this.errorMsg);
    this.container.appendChild(this.canvas);
    this.appendChild(this.container);

    this.initializeChart();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'lecture-id' && newValue !== oldValue) {
      this.lecture = newValue;
      // Re-initialize the chart when the attribute changes
      this.initializeChart();
    }
  }

  async attendanceData(lectureId) {
    try {
      const courseId = getCourseId();
      const attendance = await getAttendanceStatsForLecture(
        courseId,
        lectureId
      );
      return attendance;
    } catch (error) {
      console.error('Error fetching Attendance data', error);
      this.errorMsg.textContent = 'Failed to load chart data.';
      throw error;
    }
  }

  transformAttendanceData(apiData) {
    const present = apiData.total_present;
    const absent = apiData.total_enrolled - apiData.total_present;

    return {
      labels: ['Present', 'Absent'],
      datasets: [
        {
          data: [present, absent],
          backgroundColor: [
            'rgba(75, 192, 75, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: ['rgba(75, 192, 75, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 2,
        },
      ],
    };
  }

  createChart(chartData) {
    this.canvas.style.display = 'block';
    this.errorMsg.style.display = 'none';
    const chartContext = this.canvas.getContext('2d');

    // Destroy previous chart if exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    /* global Chart */
    this.chartInstance = new Chart(chartContext, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  async initializeChart() {
    try {
      const rawData = await this.attendanceData(this.lecture);
      const chartData = this.transformAttendanceData(rawData);
      this.createChart(chartData);
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      this.canvas.style.display = 'none';
      this.errorMsg.style.display = 'block';
      this.errorMsg.textContent = 'Failed to load chart';
    }
  }
}

customElements.define('attendance-chart', AttendanceChart);
