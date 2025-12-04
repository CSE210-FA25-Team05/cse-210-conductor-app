'use strict';

const fp = require('fastify-plugin');

module.exports = fp(async function errorHandlerPlugin(fastify) {
  // Global error handler: ensure unhandled errors return a consistent shape
  fastify.setErrorHandler((error, request, reply) => {
    // If headers already sent, just log and bail
    if (reply.raw.headersSent) {
      request.log.error(error, 'Headers already sent, cannot handle error');
      return;
    }

    // Default values
    let statusCode = error.statusCode || 500;
    let errorName = error.name || 'Internal Server Error';
    let message = error.message || 'Something went wrong'; //When in release mode, we should not show the error message to the user
    //Uncomment the following code to hide the error message to the user when in release mode
    //process.env.NODE_ENV === 'development'
    // ? error.message || 'Something went wrong'
    //  : 'Something went wrong';

    // Handle Fastify / Ajv validation errors
    if (error.validation) {
      statusCode = 400;
      errorName = 'Bad Request';
      // Use error.message first as it includes the property path (e.g., "params/course_id must be number")
      // Fallback to validation[0].message if error.message is not available
      message = error.message || error.validation[0]?.message || 'Request validation failed';
      //Uncomment the following code to hide the error message to the user when in release mode
      //if (process.env.NODE_ENV === 'development') {
      //  message = error.validation[0]?.message || 'Request validation failed';
      //} else {
      //  message = 'Request validation failed';
      //}
    }

    // Log full error details on the server
    request.log.error(
      { err: error, url: request.raw.url },
      'Unhandled error caught by setErrorHandler'
    );

    reply.code(statusCode).type('application/json').send({
      statusCode,
      error: errorName,
      message,
    });
  });
});
