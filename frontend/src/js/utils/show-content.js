// Show the page content when the page loads
function onPageLoad() {
  document.body.style.visibility = 'visible';
}

// Add the load listener
window.addEventListener('load', onPageLoad);

// Remove it when the page is exiting
window.addEventListener('beforeunload', function cleanup() {
  window.removeEventListener('load', onPageLoad);
});
