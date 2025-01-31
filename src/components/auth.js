// Ensure Netlify Identity is initialized
netlifyIdentity.init();
defaultImageUrl = '/src/assets/img/user.svg'
// Check if the user is already logged in from localStorage
const storedUserId = localStorage.getItem("userId");
if (storedUserId) {
  // Fetch user profile if logged in
  fetchUserProfile(storedUserId);
  console.log("User ID Detected, Checking for user");
}

// Select the existing auth-container
const authContainer = document.querySelector(".auth-container");

// Function to create authentication elements dynamically
function createAuthElements() {
  const loginBtn = document.createElement("button");
  loginBtn.id = "loginBtn";
  loginBtn.classList.add("btn", "login");
  loginBtn.textContent = "Login";
  loginBtn.style.display = "inline-block";

  const userInfo = document.createElement("div");
  userInfo.id = "userInfo";
  userInfo.style.display = "none"; // Hidden initially
  userInfo.innerHTML = ` 
    <a href="javascript:void(0);" id="userProfileLink">
      <img id="profilePicture" alt="Profile Picture" />
    </a>
  `;

  const userMenu = document.createElement("div");
  userMenu.id = "userMenu";
  userMenu.classList.add("slide-menu");
  userMenu.innerHTML = `
    <div id='userDetail'>
      <img id="profilePictureInMenu" alt="Profile" />
      <div id="userName"></div> <!-- Display username -->
      <button id="closeMenuBtn" class="closeMenuBtn">×</button>
    </div>
    <div class="menu-content">
      <ul>
        <li><a href="/src/pages/profile/index.html">Profile</a></li>
        <li><a href="/src/pages/dashboard/index.html">Dashboard</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
      <button class='menuLogout' id="logoutBtn">
        <span>
          <img src='/src/assets/img/logout.svg'>
          Logout
        </span>
      </button>
    </div>
  `;

  authContainer.appendChild(loginBtn);
  authContainer.appendChild(userInfo);
  authContainer.appendChild(userMenu);

  // Open/close user menu
  document.getElementById("userProfileLink").addEventListener("click", () => {
    userMenu.classList.toggle("open");
  });

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", () => {
    netlifyIdentity.logout();
  });

  // Close menu button
  document.getElementById("closeMenuBtn").addEventListener("click", () => {
    userMenu.classList.remove("open");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !userMenu.contains(event.target) &&
      !document.getElementById("userProfileLink").contains(event.target)
    ) {
      userMenu.classList.remove("open");
    }
  });

  // Login button event listener
  loginBtn.addEventListener("click", () => {
    netlifyIdentity.open();
  });
}

// Call function to create UI elements
createAuthElements();

// When the user logs in
netlifyIdentity.on("login", async function(user) {
  console.log("User logged in:", user);
  localStorage.setItem('userId', user.id); // Store user ID in localStorage
  localStorage.setItem('user', true); // Store user ID in localStorage

  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("userInfo").style.display = "block";

  if (!user) {
    console.error("User not found in Netlify Identity.");
    return;
  }

  // Define `userData` object to send to the backend
  const userData = {
    id: user.id,
    username: user.user_metadata.full_name || "Anonymous",
    email: user.email,
    userImage: "/src/assets/img/user.svg", // Default profile picture
  };

  console.log("✅ Checking user in Contentful...");

  // Check if user already exists in Contentful
  try {
    const response = await fetch("/.netlify/functions/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    if (result.exists) {
      // If the user exists in Contentful, fetch updated info
      console.log("User exists, fetching updated info...");
      const userFromContentful = result.user; // Assuming backend sends updated user datao
      localStorage.setItem('userData', JSON.stringify(userFromContentful)); // Update localStorage with latest info
      // Update profile UI with latest info
      const profileImageUrl = userFromContentful.profile_picture?.fields?.file?.url || defaultImageUrl;
      console.log(profileImageUrl);
      document.getElementById("profilePicture").src = profileImageUrl;
      document.getElementById("profilePictureInMenu").src = profileImageUrl;
      console.log('profileImageUrl');
      document.getElementById("userName").textContent = userFromContentful.username;

    } else {
      // If the user doesn't exist, create a new entry in Contentful
      console.log("User doesn't exist, creating new user...");
      const createUserResponse = await fetch("/.netlify/functions/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const createResult = await createUserResponse.json();
      localStorage.setItem('userData', JSON.stringify(createResult)); // Store newly created user data

      // Update profile UI with new data
      document.getElementById("profilePicture").src = createResult.userImage;
      document.getElementById("profilePictureInMenu").src = createResult.userImage;
      document.getElementById("userName").textContent = createResult.username;
    }
  } catch (error) {
    console.error("❌ Error checking user in Contentful:", error);
  }
});

// When the user logs out
netlifyIdentity.on("logout", () => {
  localStorage.removeItem("userId");
  console.log("User logged out");
  document.getElementById("loginBtn").style.display = "inline-block";
  document.getElementById("userInfo").style.display = "none";
  document.getElementById("userMenu").classList.remove("open"); // Close the menu on logout
});

// Fetch user profile if stored in localStorage
async function fetchUserProfile(userId) {
  try {
    const response = await fetch(`/.netlify/functions/get-user?id=${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user profile.");
    
    const data = await response.json();
    //console.log("✅ Retrieved user profile:", data);
    const profileImageUrl = data.user.profile_picture;
    //  console.log(`Profile Url: ${profileImageUrl}`);

    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("profilePicture").src = "/src/assets/img/user.svg";

    document.getElementById("profilePictureInMenu").src =
      profileImageUrl || "/src/assets/img/user.svg";
    document.getElementById("userName").textContent =
      data.user.username || "Anonymous";
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
  }
}
