/**
 * @description Makes an HTTP request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {*} [options] - Fetch options.
 * @param {number} [timeoutDuration] - Number of milliseconds before giving up on the request.
 * @param {number} [numRetries] - Number of times to retry the request when the request does not succeed.
 * @returns { ok: boolean, status: number, data?: json, error?: string} - An object containing:
 * - ok: Whether the request was successful.
 * - status?: Status code of the response.
 * - data?: Data in the response, if the response was successful.
 * - error?: Message describing the error, if it occured.
 */
export async function fetchWrapper(
  url,
  options = {},
  timeoutDuration = 1000,
  numRetries = 0
) {
  while (numRetries >= 0) {
    try {
      let response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(timeoutDuration),
      });

      // Fetch worked, but there was a problem with the server
      if (!response.ok) {
        if (numRetries > 0) {
          numRetries -= 1;
          continue;
        }
        return {
          ok: false,
          status: response.status,
          error: 'Server Error: Status ' + response.status,
        };
      }

      let data = await response.json();
      // Good response
      return {
        ok: true,
        status: response.status,
        data: data,
      };
    } catch (err) {
      if (numRetries > 0) {
        numRetries -= 1;
        continue;
      }
      if (err.name === 'TimeoutError') {
        // Fetch timed out
        return {
          ok: false,
          error: 
          'Timeout Error: Took longer than ' +
            timeoutDuration +
            ' milliseconds to fetch',
        };
      } else {
        // Fetch failed
        return {
          ok: false,
          error: 'Fetch Error: ' + err.message,
        };
      }
    }
  }
}
