   // Initialize Netlify Identity
   netlifyIdentity.init();

   // Set default image URL
   const defaultImageUrl = '/src/assets/img/user.svg'; // Replace with your default image path

   async function fetchUserData(userId) {
     try {
       const response = await fetch(`/.netlify/functions/get-user?id=${userId}`);
       const data = await response.json();
       console.log(response);
       if (data.exists) {
         document.getElementById('username').textContent = `${data.user.username}`;
         document.getElementById('email').textContent = `${data.user.email}`;

         // Handle profile picture
         document.getElementById('user-image').src = data.user.profile_picture;
         localStorage.setItem('ProfileImg', data.user.profile_picture);
       } else {
         document.getElementById('user-profile').innerHTML = "<p>User not found</p>";
       }
     } catch (error) {
       console.error("Error fetching user data:", error);
       document.getElementById('user-profile').innerHTML = "<p class='error'>Error fetching user data</p>";
     }
   }

   // Check if the user is logged in with Netlify Identity
   const user = netlifyIdentity.currentUser();

   if (user) {
     // If the user is logged in, fetch the user data from Contentful
     fetchUserData(user.id);
   } else {
     // If no user is logged in, use default image and show a guest message
     document.getElementById('user-image').src = defaultImageUrl;
     document.getElementById('username').textContent = "Username: Guest";
     document.getElementById('email').textContent = "Email: N/A";
   }