import { getCourseId } from '/src/js/utils/cache-utils.js';
import { getInteractionStats } from '/src/js/api/interactions.js';

/**
 * Custom Web Component that displays interaction statistics
 * over time as a stacked line (area) chart using Chart.js.
 *
 * Example usage:
 * ```html
 * <interaction-chart></interaction-chart>
 * ```
 *
 * @extends HTMLElement
 */
class InteractionChart extends HTMLElement {
  /**
   * Constructs an instance of the component.
   * Sets up fields for the chart instance and elements.
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
   * Lifecycle: Called when the element is added to the DOM.
   * Builds the component structure and initiates chart rendering.
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
   * Fetches raw interaction data from the API.
   *
   * @async
   * @returns {Promise<Object>} - The raw API response containing stats.
   * @throws Will throw an error if the API request fails.
   */
  async fetchInteractionData() {
    try {
      const filters = { entire_class: true };
      const interactions = await getInteractionStats(getCourseId(), filters);
      return interactions;
    } catch (error) {
      console.error('Error fetching Interaction data', error);
      this.showError('Failed to load chart data.');
      throw error;
    }
  }

  /**
   * Transforms raw API data into a dataset suitable for a stacked line chart.
   *
   * @param {Object} apiData - The API response containing interaction stats.
   * @param {Array} apiData.stats - Array of stat objects with {bucket, value, count}.
   * @returns {{labels: string[], datasets: Object[]}} A Chart.js-compatible dataset.
   */
  transformInteractionData(apiData) {
    /**
     * Returns a consistent color for a given interaction value.
     * @param {string} value - One of "Positive", "Neutral", or "Negative".
     * @param {number} alpha - Opacity value (0–1).
     * @returns {string} rgba() formatted color string.
     */
    function getColorForValue(value, alpha) {
      const colors = {
        positive: `rgba(75, 192, 75, ${alpha})`,
        neutral: `rgba(255, 206, 86, ${alpha})`,
        negative: `rgba(255, 99, 132, ${alpha})`,
      };
      return colors[value.toLowerCase()] || `rgba(201, 203, 207, ${alpha})`;
    }

    const stats = apiData.stats || [];

    const dates = [...new Set(stats.map((item) => item.bucket))].sort();
    const values = [...new Set(stats.map((item) => item.value))];

    const datasets = values.map((value) => {
      const data = dates.map((date) => {
        const found = stats.find((s) => s.bucket === date && s.value === value);
        return found ? found.count : 0;
      });

      return {
        label: value,
        data,
        fill: true,
        backgroundColor: getColorForValue(value, 0.5),
        borderColor: getColorForValue(value, 1),
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
   * Creates (or re-creates) the interaction chart.
   *
   * @param {{labels: string[], datasets: Object[]}} chartData - Formatted data for Chart.js.
   */
  createChart(chartData) {
    this.canvas.style.display = 'block';
    this.errorMsg.style.display = 'none';

    const ctx = this.canvas.getContext('2d');

    // Clean up old chart instance if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    /* global Chart */
    this.chartInstance = new Chart(ctx, {
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
   * Displays an error message inside the component.
   * @param {string} message - The error message to show.
   */
  showError(message) {
    this.canvas.style.display = 'none';
    this.errorMsg.style.display = 'block';
    this.errorMsg.textContent = message;
  }

  /**
   * Initializes the chart rendering process:
   * - Fetches data
   * - Transforms it
   * - Draws the chart
   */
  async initializeChart() {
    try {
      const raw = await this.fetchInteractionData();
      const formattedData = this.transformInteractionData(raw);
      this.createChart(formattedData);
    } catch (err) {
      console.error('Failed to initialize chart:', err);
      this.showError('Failed to load chart');
    }
  }
}

// Register custom element
customElements.define('interaction-chart', InteractionChart);
