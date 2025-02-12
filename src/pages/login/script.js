document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("login-btn");
    const statusMsg = document.getElementById("status-msg");
    const netlifyIdentity = window.netlifyIdentity;

    if (!netlifyIdentity) {
        console.error("Netlify Identity is not available.");
        return;
    }

    console.log("Netlify Identity initialized:", netlifyIdentity);

    netlifyIdentity.init(); // Initialize Netlify Identity

    const user = netlifyIdentity.currentUser(); // Get current user

    // If user is already logged in, start countdown and redirect
    if (user) {
        handleLoginSuccess(); 
    } else {
        // If not logged in, open the login modal on button click
        loginBtn.addEventListener('click', () => {
            console.log("Opening login modal...");
            netlifyIdentity.open(); // Open the login modal
        });
        loginBtn.textContent = "Login to continue";
    }

    // Handle login event
    netlifyIdentity.on("login", (user) => {
        console.log("User logged in:", user);
        localStorage.setItem("authenticated", "true"); // Persist authentication across refreshes
        localStorage.setItem("lastAuthTime", Date.now()); // Store login timestamp
        handleLoginSuccess(); // Start the countdown
    });

    
// Function to handle login success and countdown
function handleLoginSuccess() {
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("lastAuthTime", Date.now());
    localStorage.setItem("user", true);
    const authMessage = document.getElementById("authMessage");
    const redirectURL = localStorage.getItem("redirectAfterLogin") || "/dashboard";
    localStorage.removeItem("redirectAfterLogin");

    let countdown = 5; // Start countdown from 5 seconds
    console.log("Authentication Success!")
    statusMsg.innerText = "Authentication successful!";

    if (authMessage) {

        authMessage.innerText = `Redirecting in ${countdown} seconds...`;

        const countdownInterval = setInterval(() => {
            countdown--;
            authMessage.innerText = `Redirecting in ${countdown} seconds...`;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = redirectURL;
            }
        }, 1000); // Update every second
    } else {
        // If no message element, just redirect after 5 seconds
        setTimeout(() => {
            window.location.href = redirectURL;
        }, 5000);
    }
}

});
