/**
 * @description Makes an HTTP request and processes the response to return a consistent object. You can use this rather than the specific HTTP request methods if you want more control over what gets passed to the fetch through the options parameter
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
      // Only set Content-Type for requests with a body
      const headers = { ...options.headers };
      if (options.body !== undefined && options.body !== null) {
        headers['Content-Type'] = 'application/json';
      }

      let response = await fetch(url, {
        ...options,
        credentials: 'include', // Tells the server who we are for authorization purposes
        headers: headers,
        signal: AbortSignal.timeout(timeoutDuration), // Interupts the fetch request if it exceeds timeoutDuration number of milliseconds
      });

      // Fetch worked, but there was a problem with the server
      if (!response.ok) {
        if (numRetries > 0) {
          numRetries -= 1;
          continue;
        }
        // Try to get the error message given by the server, but if it doesn't work just use the status code
        let error_message;
        try {
          error_message = (await response.json()).message;
        } catch (err) {
          error_message = `Server Error: ${response.status} ${response.statusText}`;
        }
        return {
          ok: false,
          status: response.status,
          error: error_message,
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

/**
 * @description Makes a GET request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {number} [timeoutDuration] - Number of milliseconds before giving up on the request.
 * @param {number} [numRetries] - Number of times to retry the request when the request does not succeed.
 * @returns { ok: boolean, status: number, data?: json, error?: string} - An object containing:
 * - ok: Whether the request was successful.
 * - status?: Status code of the response.
 * - data?: Data in the response, if the response was successful.
 * - error?: Message describing the error, if it occured.
 */
export async function getWrapper(url, timeoutDuration = 1000, numRetries = 0) {
  let options = {
    method: 'GET',
  };
  let fetchResponse = await fetchWrapper(
    url,
    options,
    timeoutDuration,
    numRetries
  );
  return fetchResponse;
}

/**
 * @description Makes a DELETE request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {object} [body] - Body data to be sent with the HTTP request. Don't use JSON.stringify, we do that for you.
 * @param {number} [timeoutDuration] - Number of milliseconds before giving up on the request.
 * @param {number} [numRetries] - Number of times to retry the request when the request does not succeed.
 * @returns { ok: boolean, status: number, data?: json, error?: string} - An object containing:
 * - ok: Whether the request was successful.
 * - status?: Status code of the response.
 * - data?: Data in the response, if the response was successful.
 * - error?: Message describing the error, if it occured.
 */
export async function deleteWrapper(
  url,
  body = {},
  timeoutDuration = 1000,
  numRetries = 0
) {
  let options = {
    method: 'DELETE',
    body: JSON.stringify(body),
  };
  let fetchResponse = await fetchWrapper(
    url,
    options,
    timeoutDuration,
    numRetries
  );
  return fetchResponse;
}

/**
 * @description Makes a POST request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {object} body - Body data to be sent with the HTTP request. Don't use JSON.stringify, we do that for you.
 * @param {number} [timeoutDuration] - Number of milliseconds before giving up on the request.
 * @param {number} [numRetries] - Number of times to retry the request when the request does not succeed.
 * @returns { ok: boolean, status: number, data?: json, error?: string} - An object containing:
 * - ok: Whether the request was successful.
 * - status?: Status code of the response.
 * - data?: Data in the response, if the response was successful.
 * - error?: Message describing the error, if it occured.
 */
export async function postWrapper(
  url,
  body,
  timeoutDuration = 1000,
  numRetries = 0
) {
  let options = {
    method: 'POST',
    body: JSON.stringify(body),
  };
  let fetchResponse = await fetchWrapper(
    url,
    options,
    timeoutDuration,
    numRetries
  );
  return fetchResponse;
}

/**
 * @description Makes a PATCH request and processes the response to return a consistent object.
 * @param {string} url - URL to send the HTTP request to.
 * @param {object} body - Body data to be sent with the HTTP request. Don't use JSON.stringify, we do that for you.
 * @param {number} [timeoutDuration] - Number of milliseconds before giving up on the request.
 * @param {number} [numRetries] - Number of times to retry the request when the request does not succeed.
 * @returns { ok: boolean, status: number, data?: json, error?: string} - An object containing:
 * - ok: Whether the request was successful.
 * - status?: Status code of the response.
 * - data?: Data in the response, if the response was successful.
 * - error?: Message describing the error, if it occured.
 */
export async function patchWrapper(
  url,
  body,
  timeoutDuration = 1000,
  numRetries = 0
) {
  let options = {
    method: 'PATCH',
    body: JSON.stringify(body),
  };
  let fetchResponse = await fetchWrapper(
    url,
    options,
    timeoutDuration,
    numRetries
  );
  return fetchResponse;
}
