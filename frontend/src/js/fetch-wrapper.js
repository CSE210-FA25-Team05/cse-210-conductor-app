/**
 * @description Makes an HTTP request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {*} [options] - Fetch options. Can be used to define things like the HTTP method and request body.
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
        credentials: 'include',  // Tells the server who we are for authorization purposes
        headers: {
          "Content-Type": "application/json",
          ...options.headers
        },  // Tells the server we're giving them a json object in the body
        signal: AbortSignal.timeout(timeoutDuration),  // Interupts the fetch request if it exceeds timeoutDuration number of milliseconds
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
          error: 'Server Error: ' + response.status + ' ' + response.statusText,
        };
      }

      // If returned data is in json format, turn it into json, otherwise turn it into plain text
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
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
