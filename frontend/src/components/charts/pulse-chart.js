import { getPulseStats } from '/src/js/api/pulse.js';
import { getCourseId } from '/src/js/utils/cache-utils.js';

/**
 * Custom Web Component that displays Pulse (emotion) stats over time
 * in a stacked line chart using Chart.js, with dynamic API parameters.
 *
 * Example usage:
 * ```html
 * <pulse-chart
 *   entire-class="true"
 *   bucket="day"
 *   start-date="2025-12-01"
 *   end-date="2025-12-10"
 *   values='["Happy","Worried"]'
 * ></pulse-chart>
 * ```
 *
 * Changing any of these attributes automatically refreshes the data.
 *
 * @extends HTMLElement
 */
class PulseChart extends HTMLElement {
  /** Sets up initial properties and chart holder. */
  constructor() {
    super();
    this.container = null;
    this.canvas = null;
    this.errorMsg = null;
    this.chartInstance = null;
  }

  /**
   * Defines which attributes should be observed for changes.
   * When changed, data refreshes and chart re-renders.
   */
  static get observedAttributes() {
    return [
      'team-id',
      'user-id',
      'entire-class',
      'values',
      'start-date',
      'end-date',
      'bucket',
    ];
  }

  /** Lifecycle hook: build structure and initialize chart. */
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
   * Called automatically whenever an observed attribute changes.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue && this.isConnected) {
      this.initializeChart();
    }
  }

    /**
   * Builds a parameter object from the element's attributes.
   * Ensures date strings are converted to proper ISO date-time format.
   * @returns {Object} Query parameters for getPulseStats()
   */
  getQueryParams() {
    const params = {};

    if (this.hasAttribute('team-id'))
      params.team_id = Number(this.getAttribute('team-id'));

    if (this.hasAttribute('user-id'))
      params.user_id = Number(this.getAttribute('user-id'));

    if (this.hasAttribute('entire-class'))
      params.entire_class = this.getAttribute('entire-class') === 'true';

    if (this.hasAttribute('bucket'))
      params.bucket = this.getAttribute('bucket');

    // Ensure valid ISO date-time formats for API
    const toISODateTime = (value) => {
      if (!value) return undefined;
      // If it already includes 'T', assume it's ISO
      if (value.includes('T')) return value;
      // Append midnight UTC time if no time given
      return `${value}T00:00:00Z`;
    };

    if (this.hasAttribute('start-date'))
      params.start_date = toISODateTime(this.getAttribute('start-date'));

    if (this.hasAttribute('end-date'))
      params.end_date = toISODateTime(this.getAttribute('end-date'));

    if (this.hasAttribute('values')) {
      try {
        params.values = JSON.parse(this.getAttribute('values'));
      } catch {
        console.warn('Invalid JSON for values attribute — ignoring.');
      }
    }

    return params;
  }

  /** Fetch data from API based on attributes. */
  async fetchPulseData() {
    try {
      const courseId = getCourseId()

      const params = this.getQueryParams();
      const pulses = await getPulseStats(courseId, params);
      return pulses;
    } catch (error) {
      console.error('Error fetching Pulse data', error);
      this.showError('Failed to load chart data.');
      throw error;
    }
  }

  /**
   * Transforms raw API data into Chart.js dataset format.
   */
  transformPulseData(apiData) {
    function getColorForEmotion(emotion, alpha) {
      const colors = {
        Happy: `rgba(75, 192, 75, ${alpha})`,
        Tired: `rgba(255, 206, 86, ${alpha})`,
        Concerned: `rgba(255, 159, 64, ${alpha})`,
        Worried: `rgba(255, 99, 132, ${alpha})`,
      };
      return colors[emotion] || `rgba(201, 203, 207, ${alpha})`;
    }

    const stats = apiData?.stats || [];
    const dates = [...new Set(stats.map((i) => i.bucket))].sort();
    const emotions = [...new Set(stats.map((i) => i.value))];

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

  /** Creates or replaces the Chart.js instance. */
  createChart(chartData) {
    this.canvas.style.display = 'block';
    this.errorMsg.style.display = 'none';

    const ctx = this.canvas.getContext('2d');
    if (this.chartInstance) this.chartInstance.destroy();

    /* global Chart */
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: { y: { stacked: true, beginAtZero: true } },
      },
    });
  }

  /** Simple helper to show an inline error message. */
  showError(message) {
    this.canvas.style.display = 'none';
    this.errorMsg.style.display = 'block';
    this.errorMsg.textContent = message;
  }

  /** Orchestrates fetching, transforming, and drawing the chart. */
  async initializeChart() {
    try {
      const raw = await this.fetchPulseData();
      const data = this.transformPulseData(raw);
      this.createChart(data);
    } catch (error) {
      console.error('Failed to initialize Pulse chart:', error);
      this.showError('Failed to load chart');
    }
  }
}

// Register the component globally
customElements.define('pulse-chart', PulseChart);
