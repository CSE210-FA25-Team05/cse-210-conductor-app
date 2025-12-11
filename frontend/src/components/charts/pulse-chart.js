import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getPulseStats } from '/src/js/api/pulse.js';

/**
 * Custom Web Component that displays a stacked line chart of
 * course "pulse" data (student emotion trends) using Chart.js.
 *
 * Example usage:
 * ```html
 * <pulse-chart></pulse-chart>
 * ```
 *
 * @extends HTMLElement
 */
class PulseChart extends HTMLElement {
  /**
   * Constructs a new instance of PulseChart.
   * Initializes DOM element placeholders and chart reference.
   */
  constructor() {
    super();

    /** @type {HTMLDivElement|null} */
    this.container = null;

    /** @type {HTMLCanvasElement|null} */
    this.canvas = null;

    /** @type {HTMLParagraphElement|null} */
    this.errorMsg = null;

    /** @type {import('chart.js').Chart|null} */
    this.chartInstance = null;
  }

  /**
   * Lifecycle hook: Called automatically when the component
   * is inserted into the document DOM.
   * Builds structure and initializes the chart.
   */
  connectedCallback() {
    this.container = document.createElement('div');
    this.errorMsg = document.createElement('p');
    this.canvas = document.createElement('canvas');

    this.errorMsg.style.display = 'none';

    this.container.appendChild(this.errorMsg);
    this.container.appendChild(this.canvas);
    this.appendChild(this.container);

    this.initializeChart();
  }

  /**
   * Fetches Pulse (emotion) stats for the current course.
   *
   * @async
   * @returns {Promise<Object>} Raw API response object with stats data.
   * @throws {Error} If the API request fails.
   */
  async fetchPulseData() {
    try {
      const params = { entire_class: 'true' };
      const pulses = await getPulseStats(getCourseId(), params);
      return pulses;
    } catch (error) {
      console.error('Error fetching Pulse data', error);
      this.showError('Failed to load chart data.');
      throw error;
    }
  }

  /**
   * Converts raw API data into a dataset suitable for a stacked area (line) chart.
   *
   * @param {Object} apiData - Raw pulse data response from the API.
   * @param {Array} apiData.stats - Array of pulse records {bucket, value, count}.
   * @returns {{labels: string[], datasets: Object[]}} Chart.js-ready data structure.
   */
  transformPulseData(apiData) {
    /**
     * Maps each pulse emotion to a consistent RGBA color.
     *
     * @param {string} emotion - Emotion name (e.g., "Happy", "Tired").
     * @param {number} alpha - Opacity (0–1).
     * @returns {string} RGBA color string.
     */
    function getColorForEmotion(emotion, alpha) {
      const colors = {
        Happy: `rgba(75, 192, 75, ${alpha})`, // Green
        Tired: `rgba(255, 206, 86, ${alpha})`, // Yellow
        Concerned: `rgba(255, 159, 64, ${alpha})`, // Orange
        Worried: `rgba(255, 99, 132, ${alpha})`, // Red
      };
      return colors[emotion] || `rgba(201, 203, 207, ${alpha})`;
    }

    const stats = apiData.stats || [];

    const dates = [...new Set(stats.map((item) => item.bucket))].sort();
    const emotions = [...new Set(stats.map((item) => item.value))];

    const datasets = emotions.map((emotion) => {
      const data = dates.map((date) => {
        const found = stats.find(
          (s) => s.bucket === date && s.value === emotion
        );
        return found ? found.count : 0;
      });

      return {
        label: emotion,
        data,
        fill: true,
        backgroundColor: getColorForEmotion(emotion, 0.5),
        borderColor: getColorForEmotion(emotion, 1),
        borderWidth: 2,
      };
    });

    const labels = dates.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    });

    return { labels, datasets };
  }

  /**
   * Creates or re-creates the pulse chart using Chart.js.
   *
   * @param {{labels: string[], datasets: Object[]}} chartData - Formatted chart dataset.
   */
  createChart(chartData) {
    this.canvas.style.display = 'block';
    this.errorMsg.style.display = 'none';

    const context = this.canvas.getContext('2d');

    // If chart already exists, destroy it before reinitializing
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    /* global Chart */
    this.chartInstance = new Chart(context, {
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
  }

  /**
   * Displays an error message and hides the chart canvas.
   *
   * @param {string} message - Message to show to the user.
   */
  showError(message) {
    this.canvas.style.display = 'none';
    this.errorMsg.style.display = 'block';
    this.errorMsg.textContent = message;
  }

  /**
   * Coordinates data fetching, transforming, and chart rendering.
   *
   * @async
   */
  async initializeChart() {
    try {
      const raw = await this.fetchPulseData();
      const chartData = this.transformPulseData(raw);
      this.createChart(chartData);
    } catch (error) {
      console.error('Failed to initialize Pulse chart:', error);
      this.showError('Failed to load chart');
    }
  }
}

// Register the web component
customElements.define('pulse-chart', PulseChart);
