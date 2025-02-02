// Ensure Netlify Identity is initialized
netlifyIdentity.init();
defaultImageUrl = "/src/assets/img/user.svg";
const user = localStorage.getItem("user");
const storedUserId = localStorage.getItem("userId");
if (user) {
  fetchUserProfile(storedUserId);
} else {
  netlifyIdentity.logout();
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
        <li><a href="/profile">Profile</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
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
netlifyIdentity.on("login", async function (user) {
  console.log("User logged in:", user);
  localStorage.setItem("userId", user.id); // Store user ID in localStorage
  localStorage.setItem("user", true); // Store user ID in localStorage
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("userInfo").style.display = "inline-block";

  if (!user) {
    console.error("User not found in Netlify Identity.");
    return;
  }

  // Define `userData` object to send to the backend
  const userData = {
    id: user.id,
    username: user.user_metadata.full_name,
    email: user.email,
    userImage: defaultImageUrl, // Default profile picture
  };

  console.log("User ID: " + userData.id);
  console.log("User Name: " + userData.username);
  console.log("✅ Checking user in Contentful...");

  // Check if user already exists in Contentful
  try {
    const response = await fetch("/.netlify/functions/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    console.log(`Result: ${result.exists}`);
    if (result.exists === true) {
      // If the user exists in Contentful, fetch updated info
      console.log("User exists, fetching updated info...");
      const userFromContentful = result.user; // Assuming backend sends updated user data
      // Update profile UI with latest info
      const profileImageUrl =
        userFromContentful.profile_picture?.fields?.file?.url ||
        defaultImageUrl;
      console.log(profileImageUrl);
      document.getElementById("profilePicture").src = profileImageUrl;
      document.getElementById("profilePictureInMenu").src = profileImageUrl;
      console.log("profileImageUrl");
      document.getElementById("userName").textContent =
        userFromContentful.username;
      location.reload();
    } else {
      // If the user doesn't exist, create a new entry in Contentful
      console.log("❌ Can not find user in the Database");
      const createResult = await registerUser(user);
      localStorage.setItem("userData", JSON.stringify(createResult)); // Store newly created user data

      // Update profile UI with new data
      document.getElementById("profilePicture").src = createResult.userImage;
      document.getElementById("profilePictureInMenu").src =
        createResult.userImage;
      document.getElementById("userName").textContent = createResult.username;
    }
  } catch (error) {
    console.error("❌ Error checking user in Contentful:", error);
  }
});

// When the user logs out
netlifyIdentity.on("logout", () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
  console.log("User logged out");

  document.getElementById("loginBtn").style.display = "inline-block";
  document.getElementById("userInfo").style.display = "none";
  document.getElementById("userMenu").classList.remove("open"); // Close the menu on logout
  location.reload();
});

// Define the registerUser function that will be called when the user signs up
const registerUser = async (user) => {
  // Prepare the user data to send to Contentful
  const userData = {
    id: user.id,
    username: "guest", // Default username for new users
    email: user.email,
    userImage: "./src/assets/img/user.svg", // Default profile image
    bio: "", // Default empty bio
    role: "content creator", // Default role for new users
  };

  console.log("Registering User", userData);

  console.log("🛠️ Creating New user account");
  console.log("🛠️ User Data: ");
  console.log(userData);

  // Send the data to the backend (create-user function)
  try {
    const response = await fetch("/.netlify/functions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("User created successfully in Contentful:", result);
      // You can handle UI updates here if necessary, like redirecting the user
    } else {
      console.error("Failed to create user in Contentful:", result.message);
    }
  } catch (error) {
    console.error("Error sending data to create-user function:", error);
  }
};

// Example of how to call this function when a user signs up using Netlify Identity
netlifyIdentity.on("signup", async function (user) {
  // Call the registerUser function and pass the user object from Netlify Identity
  await registerUser(user);
});

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
    document.getElementById("profilePicture").src = defaultImageUrl;

    document.getElementById("profilePictureInMenu").src =
      profileImageUrl || defaultImageUrl;
    document.getElementById("userName").textContent =
      data.user.username || "Anonymous";
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
  }
}
