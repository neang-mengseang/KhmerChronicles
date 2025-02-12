document.addEventListener("DOMContentLoaded", () => {
  const netlifyIdentity = window.netlifyIdentity;
  netlifyIdentity.init(); // Ensure Netlify Identity initializes

  const isLogin = localStorage.getItem('user');
  if(!isLogin){
      localStorage.removeItem("authenticated"); // Persist authentication across refreshes
      localStorage.removeItem("lastAuthTime"); // Store login timestamp
      netlifyIdentity.logout();
  }
  
    waitForNetlifyIdentity(() => {
      checkAuthentication();
    });
  });
  
  function waitForNetlifyIdentity(callback) {
    const check = () => {
      if (netlifyIdentity) {
        console.log("Netlify Identity is loaded.");
        callback();
      } else {
        console.log("Waiting for Netlify Identity...");
        setTimeout(check, 500);
      }
    };
    check();
  }
  
  function checkAuthentication() {
    if (!netlifyIdentity) {
      console.error("Netlify Identity is not available.");
      return;
    }
  
    const lastAuthTime = localStorage.getItem("lastAuthTime");
    const isAuthenticated = localStorage.getItem("authenticated");
    const currentTime = Date.now();
    const fiveHours = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
  
    // If 5 hours passed, force re-authentication
    if (!lastAuthTime || currentTime - parseInt(lastAuthTime) > fiveHours) {
      console.log("Auth expired. Forcing re-authentication...");
      localStorage.removeItem("authenticated");
    }
  
    if (!isAuthenticated) {
      console.log("Checking if user is logged in...");
  
      // Get current user immediately instead of waiting for "init"
      const user = netlifyIdentity.currentUser();
      if (user) {
        console.log("User already logged in. Proceeding...");
        handleLoginSuccess();
      } else {
        console.log("No user found. Redirecting to login...");
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "/login";
      }
    }
  }
  
  function handleLoginSuccess() {
    console.log("User logged in. Setting auth state...");
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("lastAuthTime", Date.now());
  
    const authMessage = document.getElementById("authMessage");
    if (authMessage) {
      authMessage.innerText = "Authentication in progress... Redirecting in 5 seconds.";
      setTimeout(() => {
        const redirectURL = localStorage.getItem("redirectAfterLogin") || "/dashboard";
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectURL;
      }, 5000);
    } else {
      const redirectURL = localStorage.getItem("redirectAfterLogin") || "/dashboard";
      localStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectURL;
    }
  }
  