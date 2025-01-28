 // Declare all variables at the top
 const loginBtn = document.querySelector('.login');
 const registerBtn = document.querySelector('.register');
 const logoutBtn = document.querySelector('.logout');

 // Initialize Netlify Identity
 netlifyIdentity.on('init', (user) => {
   if (user) {
     console.log("User logged in:", user);
     localStorage.setItem('user', JSON.stringify(user)); // Store user data in localStorage
     updateAuthUI(user);
   } else {
     console.log("No user logged in");
     localStorage.removeItem('user'); // Clear user data from localStorage
     updateAuthUI(null);
   }
 });

 // Check login state on page load
 window.onload = function() {
   const user = JSON.parse(localStorage.getItem('user')); // Retrieve user data from localStorage

   if (user) {
     console.log("User is logged in:", user);
     updateAuthUI(user);
   } else {
     console.log("User is not logged in.");
     updateAuthUI(null);
   }
 };

 // Update the UI based on login state
 function updateAuthUI(user) {
   if (user) {
     // Show logout button, hide login/register
     loginBtn.style.display = 'none';
     registerBtn.style.display = 'none';
     logoutBtn.style.display = 'inline-block'; // Show logout button
   } else {
     // Show login/register buttons, hide logout
     loginBtn.style.display = 'inline-block';
     registerBtn.style.display = 'inline-block';
     logoutBtn.style.display = 'none';
   }
 }

 // Logout user when logout button is clicked
 if (logoutBtn) {
   logoutBtn.addEventListener('click', () => {
     netlifyIdentity.logout();
     localStorage.removeItem('user'); // Clear user data from localStorage
     updateAuthUI(null); // Update UI to show login/register
   });
 }

 // Handle login state updates
 netlifyIdentity.on('login', function(user) {
   console.log('User logged in:', user);
   localStorage.setItem('user', JSON.stringify(user)); // Store user data in localStorage
   updateAuthUI(user);
   console.log('Login state updated. Register/Login buttons hidden, Logout button shown.');
 });

 netlifyIdentity.on('logout', function() {
   console.log('User logged out');
   localStorage.removeItem('user'); // Clear user data from localStorage
   updateAuthUI(null);
   console.log('Logout state updated. Register/Login buttons shown, Logout button hidden.');
 });

 // Open the login/register modal when the login button is clicked
 if (loginBtn) {
   loginBtn.addEventListener('click', function() {
     console.log('Login button clicked. Opening Netlify Identity modal.');
     window.location.href = '/src/auth/login/index.html'
   });
 }

 // Open the register modal when the register button is clicked
 if (registerBtn) {
   registerBtn.addEventListener('click', function() {
     console.log('Register button clicked. Opening Netlify Identity signup modal.');
     netlifyIdentity.open('signup');
   });
 }

 // Log the user out when the logout button is clicked
 if (logoutBtn) {
   logoutBtn.addEventListener('click', function() {
     console.log('Logout button clicked. Logging out user.');
     netlifyIdentity.logout();
   });
 }

 // Debug log to check if Netlify Identity is initialized
 console.log('Netlify Identity initialized:', netlifyIdentity);

 // Debug log for initial state of buttons
 const isLoggedIn = netlifyIdentity.currentUser() ? true : false;
 console.log('Initial login state:', isLoggedIn);
