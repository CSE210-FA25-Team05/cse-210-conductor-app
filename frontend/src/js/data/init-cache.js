import {
  getCourseId,
  cacheProfile,
  cacheCourses,
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
  } catch (err) {
    console.error('failed to initialize cache:', err);
  }
}

initializeCache();
