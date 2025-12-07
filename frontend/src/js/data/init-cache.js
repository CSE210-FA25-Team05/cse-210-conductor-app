import {
  getCourseId,
  cacheProfile,
  cacheCourses,
  cacheAllPulseConfigs,
} from '/src/js/utils/cache-utils.js';

/**
 * Initializes all API caches for the current session.
 * Loads profile, user's courses, course_id (from URL),
 * and users for each course.
 *
 * @async
 * @returns {Promise<void>} Resolves when all caches are populated.
 */
export async function initializeCache() {
  try {
    // Cache the current course ID from the URL
    getCourseId();

    // Fetch and cache the current user's profile
    await cacheProfile();

    // Fetch and cache all courses the user is in
    await cacheCourses();

    // Fetch and cache the pulse config for each course the user is in
    await cacheAllPulseConfigs();
  } catch (err) {
    console.error('failed to initialize cache:', err);
  }
}

initializeCache();
