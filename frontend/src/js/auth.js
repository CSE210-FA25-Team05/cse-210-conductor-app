const BACKEND_URL = 'http://localhost:3001';
const LOGIN_PATH = 'src/pages/login.html';
const PUBLIC_ROUTES = ['/', LOGIN_PATH];
const PATH = window.location.pathname;

// Fetch profile
// Store profile information in local host
async function authenticate() {
  try {
    let response = await fetch(BACKEND_URL + '/me', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      window.location.href = LOGIN_PATH;
    }

    // Authenticated
    let data = await response.json();
    localStorage.setItem('me', data);
  } catch (error) {
    console.log('error', error);
  }
}

if (!PUBLIC_ROUTES.includes(PATH)) {
  //authenticate();
}
