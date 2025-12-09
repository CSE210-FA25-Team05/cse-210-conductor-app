/**
 * Links a search input element to a grid component that supports a `searchGrid` method.
 *
 * This function sets up event listeners on the specified search input element
 * (`keyup`, `change`, and `search`) so that when the user types a query, the
 * associated grid is searched using a debounced input value. The debounce prevents
 * excessive calls by waiting 100ms after the user stops typing before triggering
 * the search.
 *
 * @param {string} searchId - The ID of the search input element in the DOM.
 * @param {string} gridId - The CSS selector of the grid element that provides a
 * `searchGrid` method to handle the filtering logic.
 *
 * @example
 * // Example usage:
 * // HTML:
 * // <input id="userSearch" type="search" placeholder="Search users">
 * // <zero-grid id="userGrid"></zero-grid>
 * //
 * // JavaScript:
 * // window.addEventListener('load', () => {
 * //     linkSearchToGrid('userSearch', '#userGrid');
 * // });
 * // window.addEventListener('beforeunload', () => {
 * //     unlinkSearchToGrid('userSearch', '#userGrid');
 * // });
 */
export function linkSearchToGrid(searchId, gridId) {
  // Javascript code to execute after DOM content
  // element references
  const searchGrid = document.getElementById(searchId);
  const zgRef = document.getElementById(gridId);
  // debounce search
  let searchTimeoutId = null;
  // function declarations
  function _searchGrid(e) {
    // debounce search
    clearTimeout(searchTimeoutId);
    let targetValue = e.target.value;
    // delay 100 milliseconds to debounce user input
    searchTimeoutId = setTimeout(
      (userInput) => {
        requestAnimationFrame(() => zgRef.searchGrid(userInput));
      },
      100,
      targetValue
    );
  }
  // add event listeners
  searchGrid.addEventListener('keyup', _searchGrid);
  searchGrid.addEventListener('change', _searchGrid);
  searchGrid.addEventListener('search', _searchGrid);
}
