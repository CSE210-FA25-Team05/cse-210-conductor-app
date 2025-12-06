'use strict';

/**
 * Code Generator Utility
 *
 * Shared utility for generating random codes (e.g., course join codes, attendance codes).
 */

/**
 * Generate a random 6-character code.
 * Uses alphanumeric characters (A-Z, a-z, 0-9).
 *
 * @returns {string} Generated code
 */
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let generatedCode = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    generatedCode += characters.charAt(randomIndex);
  }
  return generatedCode;
}

module.exports = {
  generateCode,
};
