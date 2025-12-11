import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getAttendanceStatsForLecture } from '/src/js/api/attendance.js';

/**
 * Custom Web Component that renders a pie chart of attendance data
 * for a specific lecture using Chart.js.
 *
 * The component updates automatically when the `lecture-id` attribute changes.
 *
 * Example usage:
 * ```html
 * <attendance-chart lecture-id="61"></attendance-chart>
 * ```
 *
 * @extends HTMLElement
 */
class AttendanceChart extends HTMLElement {
  /**
   * Creates an instance of AttendanceChart.
   * Initializes the default lecture ID and chart instance.
   */
  constructor() {
    super();

    /**
     * The lecture ID used to fetch attendance data.
     * Defaults to 61 if not set via `lecture-id` attribute.
     * @type {number|string}
     */
    this.lecture = this.getAttribute('lecture-id') || 61;

    /**
     * Holds the Chart.js instance, allowing reinitialization and cleanup.
     * @type {import('chart.js').Chart|null}
     */
    this.chartInstance = null;
  }

  /**
   * Defines which HTML attributes should trigger
   * `attributeChangedCallback()` when changed.
   *
   * @returns {string[]} List of observed attribute names.
   */
  static get observedAttributes() {
    return ['lecture-id'];
  }

  /**
   * Called automatically when the element is inserted into the DOM.
   * Sets up DOM elements (container, canvas, error message) and initializes the chart.
   */
  connectedCallback() {
    this.container = document.createElement('div');
    this.errorMsg = document.createElement('p');
    this.canvas = document.createElement('canvas');

    this.container.appendChild(this.errorMsg);
    this.container.appendChild(this.canvas);
    this.appendChild(this.container);

    this.initializeChart();
  }

  /**
   * Fired whenever an observed attribute (here, `lecture-id`) changes.
   *
   * @param {string} name - The name of the attribute that changed.
   * @param {string|null} oldValue - The previous attribute value.
   * @param {string|null} newValue - The new attribute value.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'lecture-id' && newValue !== oldValue) {
      this.lecture = newValue;
      // Re-initialize the chart whenever the associated lecture changes
      this.initializeChart();
    }
  }

  /**
   * Fetches attendance data for a given lecture via the API.
   *
   * @async
   * @param {number|string} lectureId - The lecture ID to fetch data for.
   * @returns {Promise<Object>} The raw attendance data returned from the API.
   * @throws Will throw an error if the API request fails.
   */
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

  /**
   * Converts raw attendance API data into a dataset formatted for Chart.js.
   *
   * @param {Object} apiData - The raw API response.
   * @param {number} apiData.total_present - Number of students present.
   * @param {number} apiData.total_enrolled - Total number of enrolled students.
   * @returns {{labels: string[], datasets: Object[]}} The formatted dataset for Chart.js.
   */
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

  /**
   * Creates and renders a Chart.js pie chart based on formatted data.
   * If a chart already exists, it is destroyed before creating a new one.
   *
   * @param {{labels: string[], datasets: Object[]}} chartData - Chart.js formatted data object.
   */
  createChart(chartData) {
    this.canvas.style.display = 'block';
    this.errorMsg.style.display = 'none';

    const chartContext = this.canvas.getContext('2d');

    // Destroy existing chart instance to avoid memory leaks
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
              /**
               * Custom tooltip displaying label, raw count, and percentage breakdown.
               *
               * @param {import('chart.js').TooltipItem<'pie'>} context
               * @returns {string} Formatted tooltip label text.
               */
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

  /**
   * Initializes the chart creation cycle:
   * - Fetches fresh attendance data
   * - Transforms it for Chart.js
   * - Renders the chart.
   *
   * Handles API and rendering errors gracefully.
   *
   * @async
   */
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
