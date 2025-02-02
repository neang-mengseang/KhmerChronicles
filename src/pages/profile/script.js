// Initialize Netlify Identity
netlifyIdentity.init();

// Set default image URL
const defaultImageUrl = '/src/assets/img/user.svg';

let originalData = {};

async function fetchUserData() {
  const currentUser = await netlifyIdentity.currentUser();

  if (!currentUser) {
    document.getElementById('user-image').src = defaultImageUrl;
    document.getElementById('username').textContent = "Username: Guest";
    document.getElementById('email').textContent = "Email: N/A";
    return;
  }

  try {
    const response = await fetch(`/.netlify/functions/get-user?id=${currentUser.id}`);
    const data = await response.json();
    const profile_card = document.getElementById('profile_container');
    console.log(data);
    if (data.exists) {
      originalData = {
        entry_id: data.user.entry_id,
        id: data.user.entry_id,
        username: data.user.username || "Anonymous",
        bio: data.user.bio || "No bio available",
        profile_picture: data.user.profile_picture || defaultImageUrl,
      };

      profile_card.innerHTML = `
        <div class="card" id="main">
          <img id="user-image" src="${originalData.profile_picture}" alt="User Image">
          <div class="badge admin">
            <span id="role">${data.user.role || "guest"}</span>
          </div>
          <div id="id_container">
            <span id="id">${data.user.id || "N/A"}</span>
          </div>
          <p id="username">${originalData.username}</p>
          <p id="email">${data.user.email || "N/A"}</p>
          <div>
            <span id="bio">${originalData.bio}</span>
          </div>
          <div id="btn_container">
            <button id="edit-btn" onclick="editProfileFields()">Edit Profile</button>
          </div>
          <div id="image-container"></div>
        </div>
      `;
    } else {
      profile_card.innerHTML = "<p>User not found</p>";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    document.getElementById('profile_container').innerHTML = "<p class='error'>Error fetching user data</p>";
  }
}

function editProfileFields() {
  const username = document.getElementById('username');
  const bio = document.getElementById('bio');

  username.innerHTML = `<input type="text" value="${originalData.username}" />`;
  bio.innerHTML = `<textarea>${originalData.bio}</textarea>`;

  const imageContainer = document.getElementById('image-container');
  imageContainer.innerHTML = `<input type="file" id="image-upload" accept="image/*" />`;

  const btnContainer = document.getElementById('btn_container');
  btnContainer.innerHTML = `
    <button onclick='saveProfile()'>Save</button>
    <button onclick='location.reload()'>Cancel</button>
  `;
}

async function saveProfile() {
  const currentUser = netlifyIdentity.currentUser();
  if (!currentUser) {
    alert('You must be logged in to edit your profile.');
    return;
  }

  const usernameInput = document.getElementById('username').querySelector('input');
  const bioInput = document.getElementById('bio').querySelector('textarea');

  const updatedData = {
    username: usernameInput.value.trim(),
    bio: bioInput.value.trim(),
  };


  const data = {
    contentType: "user", // Make sure this is the correct Content Type ID
    entry_id: originalData.entry_id,  // The Contentful Entry ID (sys.id)
    id: currentUser.id,
    fields: {
      username: updatedData.username,
      bio: updatedData.bio,
    },
  };

  const imageInput = document.getElementById('image-upload');

  if (imageInput.files && imageInput.files[0]) {
    const file = imageInput.files[0];
    const maxSize = 5 * 1024 * 1024;

    if (file && file.size > maxSize) {
      alert(`File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`);
      imageInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");

      data.fields.image = {
        title: file.name,
        contentType: file.type,
        fileName: file.name,
        data: base64String,
      };

      try {
        console.log("Data being sent:", JSON.stringify(data, null, 2)); // Log JSON data

        const response = await fetch(`/.netlify/functions/update-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data),
        });
        console.log(JSON.stringify(data));
        const responseData = await response.json();
        if (responseData.success) {
          alert('Profile updated successfully!');
          await fetchUserData(); // Refresh user data after update
        } else {
          alert('Error updating profile: ' + responseData.error);
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    };
    reader.readAsDataURL(file);
  } else { // No image selected
    try {
      console.log("Data being sent:", JSON.stringify(data, null, 2)); // Log JSON data

      const response = await fetch(`/.netlify/functions/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (responseData.success) {
        alert('Profile updated successfully!');
        await fetchUserData(); // Refresh user data after update
      } else {
        alert('Error updating profile: ' + responseData.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  }
}
fetchUserData();