import { getProfile } from '/src/js/api/profile.js';
import { getPulseConfigs } from '/src/js/api/pulse.js';

/**
 * -------------------------------------------------------------
 * Global cache key constants
 * -------------------------------------------------------------
 * These constants define all localStorage keys used
 * by this module to store and retrieve cached data.
 */

export const CACHE_KEYS = {
  COURSE_ID: 'course_id',
  PULSE_CONFIG: 'pulse_config',
  PROFILE: 'profile',
  COURSES: 'courses',
  COURSE_USERS_PREFIX: 'course_', // example: course_<id>_users
  COURSE_USERS_SUFFIX: '_users',
};

// -------------------------------------------------------------
// Helper functions for interacting with localStorage
// -------------------------------------------------------------

/**
 * Store data in localStorage.
 * @param {string} key - The cache key.
 * @param {any} value - The value to serialize and store.
 */
function setCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to cache ${key}:`, err);
  }
}

/**
 * Retrieve and parse data from localStorage.
 * @param {string} key - The cache key.
 * @returns {any | null} - Parsed value or null if not found or invalid.
 */
function getCache(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.warn(`Failed to read ${key} from cache:`, err);
    return null;
  }
}

/**
 * Remove an item from localStorage.
 * @param {string} key - The cache key to remove.
 */
function removeCache(key) {
  localStorage.removeItem(key);
}

/**
 * Sets a cookie with a given name, value, and optional configuration.
 *
 * @param {string} name - The cookie name.
 * @param {string} value - The cookie value.
 * @param {object} [options] - Optional cookie configuration.
 * @param {number | Date} [options.expires] - Expiration as Date object or number of days from now.
 * @param {string} [options.path='/'] - Path for which the cookie is valid.
 * @param {string} [options.domain] - Domain for which the cookie is valid.
 * @param {boolean} [options.secure=false] - Whether the cookie should only be sent over HTTPS.
 * @param {boolean} [options.httpOnly=false] - Whether to mark cookie as HttpOnly (for documentation; cannot be set via client-side JS).
 * @param {string} [options.sameSite='Lax'] - SameSite attribute: 'Strict', 'Lax', or 'None'.
 */
export function setCookie(name, value, options = {}) {
  const {
    expires,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax',
  } = options;

  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Expiration handling
  if (expires) {
    let expDate;
    if (expires instanceof Date) {
      expDate = expires;
    } else if (typeof expires === 'number') {
      expDate = new Date();
      expDate.setTime(expDate.getTime() + expires * 24 * 60 * 60 * 1000);
    } else {
      throw new Error('Invalid expires option: must be number of days or Date');
    }
    cookieStr += `; expires=${expDate.toUTCString()}`;
  }

  // Additional attributes
  cookieStr += `; path=${path}`;
  if (domain) cookieStr += `; domain=${domain}`;
  if (secure) cookieStr += '; Secure';
  if (sameSite) cookieStr += `; SameSite=${sameSite}`;

  document.cookie = cookieStr;
}

/**
 * Retrieves the value of a cookie by name.
 *
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string | null} The decoded cookie value, or null if not found.
 */
export function getCookie(name) {
  const cookieString = document.cookie;
  if (!cookieString) return null;

  const cookies = cookieString.split(';').map((c) => c.trim());

  for (const cookie of cookies) {
    if (cookie.startsWith(`${encodeURIComponent(name)}=`)) {
      const value = cookie.substring(name.length + 1);
      return decodeURIComponent(value);
    }
  }

  return null;
}

// -------------------------------------------------------------
// Course ID utilities
// -------------------------------------------------------------

/**
 * Extracts the course ID from the current URL, caches it, and returns it.
 * URL format expected: `/course/{course_id}/page`
 * @returns {string | null} The extracted course ID, or null if not found.
 */
export function getCourseId() {
  const match = window.location.pathname.match(/\/course\/([^/]+)/);
  const courseId = match ? match[1] : null;

  if (courseId) setCookie(CACHE_KEYS.COURSE_ID, courseId);
  return courseId;
}

/**
 * Get cached course ID if it exists.
 * @returns {string | null} Cached course ID, or null.
 */
export function getCachedCourseId() {
  return getCookie('course_id');
}

// -------------------------------------------------------------
// Profile utilities
// -------------------------------------------------------------

/**
 * Fetches the user profile from API and caches it.
 * Uses cached data if available.
 * @async
 * @returns {Promise<object>} A Promise resolving to the profile object.
 * @throws {Error} If the network request fails.
 */
export async function cacheProfile() {
  try {
    const profile = await getProfile();
    setCache(CACHE_KEYS.PROFILE, profile);
    return profile;
  } catch (err) {
    console.error('Error fetching profile:', err);
    throw err;
  }
}

/**
 * Retrieve the current user's role from cached profile data.
 * @returns {string | null} Role or null if not available.
 */
export function getUserRole() {
  const profile = getCache(CACHE_KEYS.PROFILE);
  return profile?.global_role ?? null;
}

/**
 * Retrieve the current user's ID from cached profile data.
 * @returns {string | number | null} User ID or null.
 */
export function getUserId() {
  const profile = getCache(CACHE_KEYS.PROFILE);
  return profile?.id ?? null;
}

// -------------------------------------------------------------
// Courses utilities
// -------------------------------------------------------------

/**
 * Fetches all courses the user is enrolled in from `/api/courses`.
 * Uses cache if available.
 * @async
 * @returns {Promise<Array<object>>} An array of course objects.
 * @throws {Error} If API call fails.
 */
export async function cacheCourses() {
  try {
    const res = await fetch('/api/courses');
    if (!res.ok) throw new Error(`Failed to fetch courses: ${res.statusText}`);
    const courses = await res.json();
    setCache(CACHE_KEYS.COURSES, courses);
    return courses;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Gets cached courses if available.
 * @returns {Array<object> | null} Cached courses or null.
 */
export function getCachedCourses() {
  return getCache(CACHE_KEYS.COURSES);
}

// -------------------------------------------------------------
// Pulse utilities
// -------------------------------------------------------------

/**
 * Builds the cache key for pulse configs specific to a course.
 * @param {string} courseId - The course ID.
 * @returns {string} A formatted key like `pulse_config_<courseId>`.
 */
function getPulseConfigCacheKey(courseId) {
  return `${CACHE_KEYS.PULSE_CONFIG}_${courseId}`;
}

/**
 * Fetch and cache the pulse configuration for a specific course.
 * @async
 * @param {string} courseId - The course ID.
 * @returns {Promise<object>} The fetched pulse configuration object.
 * @throws {Error} If the network request fails.
 */
export async function cachePulseConfig(courseId) {
  try {
    const config = await getPulseConfigs(courseId);
    setCache(getPulseConfigCacheKey(courseId), config);
    return config;
  } catch (err) {
    console.error(`Error fetching pulse config for course ${courseId}:`, err);
    throw err;
  }
}

/**
 * Fetch and cache the pulse configs for **all courses** the user is enrolled in.
 * Uses the cached courses list.
 * @async
 * @returns {Promise<object>} An object mapping courseId → pulseConfig.
 * @throws {Error} If any network requests fail.
 */
export async function cacheAllPulseConfigs() {
  const courses = getCachedCourses() || (await cacheCourses());
  const configs = {};

  for (const course of courses) {
    const courseId = course.id?.toString?.();
    if (!courseId) continue;

    if (!getCachedPulseConfig(courseId)) {
      try {
          configs[courseId] = await cachePulseConfig(courseId);
      } catch (err) {
          console.warn(`Skipping course ${courseId} due to pulse config error.`);
      }
    }

  }

  return configs;
}

/**
 * Get cached pulse configuration for a specific course.
 * @param {string} courseId
 * @returns {object | null}
 */
export function getCachedPulseConfig(courseId) {
  return getCache(getPulseConfigCacheKey(courseId));
}

// -------------------------------------------------------------
// Users in a course
// -------------------------------------------------------------

/**
 * Build the full cache key for course user lists.
 * @param {string} courseId - The course ID.
 * @returns {string} A formatted localStorage key like `course_<id>_users`.
 */
function getCourseUsersCacheKey(courseId) {
  return `${CACHE_KEYS.COURSE_USERS_PREFIX}${courseId}${CACHE_KEYS.COURSE_USERS_SUFFIX}`;
}

/**
 * Fetch all users from `/api/courses/{courseId}/users` and cache them.
 * Uses cache if available.
 * @async
 * @param {string} courseId - The course ID to fetch users for.
 * @returns {Promise<Array<object>>} Array of user objects.
 */
export async function cacheUsersInCourse(courseId) {
  const cacheKey = getCourseUsersCacheKey(courseId);

  try {
    const res = await fetch(`/api/courses/${courseId}/users`);
    if (!res.ok)
      throw new Error(`Failed to fetch users for course ${courseId}`);
    const users = await res.json();
    setCache(cacheKey, users);
    return users;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Get cached users for a specific course.
 * @param {string} courseId - The course ID.
 * @returns {Array<object> | null} Cached array of users or null.
 */
export function getCachedUsers(courseId) {
  return getCache(getCourseUsersCacheKey(courseId));
}

// -------------------------------------------------------------
// Cache management
// -------------------------------------------------------------

/**
 * Clears all cached data — course ID, profile, courses, and users.
 * Useful for logout or full data refresh.
 */
export function clearCache() {
  removeCache(CACHE_KEYS.COURSE_ID);
  removeCache(CACHE_KEYS.PROFILE);
  removeCache(CACHE_KEYS.COURSES);

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith(CACHE_KEYS.COURSE_USERS_PREFIX) &&
      key.endsWith(CACHE_KEYS.COURSE_USERS_SUFFIX)
    ) {
      removeCache(key);
    }
  });
}
