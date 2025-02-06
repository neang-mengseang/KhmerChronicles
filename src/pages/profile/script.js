console.log("{ Profile Script is running...");
const notifications = document.querySelector(".notifications");

const toastDetails = {
    timer: 5000,
    success: {
        icon: "fa-circle-check",
        text: "Success: Operation completed successfully."
    },
    error: {
        icon: "fa-circle-xmark",
        text: "Error: Something went wrong. Please try again."
    }
};

const removeToast = (toast) => {
    toast.classList.add("hide");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    setTimeout(() => toast.remove(), 500);
};

const createToast = (id) => {
    const { icon, text } = toastDetails[id];
    const toast = document.createElement("li");
    toast.className = `toast ${id}`;
    toast.innerHTML = `
        <div class="column">
            <i class="fa-solid ${icon}"></i>
            <span>${text}</span>
        </div>
        <i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>`;
    
    notifications.appendChild(toast);
    toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
};

// Set default image URL
const defaultImg = '/src/assets/img/user.svg';

let originalData = {};

async function fetchUserData() {
    const currentUser = netlifyIdentity.currentUser();

    if (!currentUser) {
        document.getElementById('user-image').src = defaultImg;
        document.getElementById('username').textContent = "Username: Guest";
        document.getElementById('email').textContent = "Email: N/A";
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/get-user?id=${currentUser.id}`);
        const data = await response.json();
        const profile_card = document.getElementById('profile_container');

        if (data.exists) {
            originalData = {
                entry_id: data.user.entry_id,
                id: data.user.entry_id,
                username: data.user.username || "Anonymous",
                bio: data.user.bio || "No bio available",
                profile_picture: data.user.profile_picture || defaultImg,
            };

            const badge = {
                admin: { icon: "fa-solid fa-code", text: "Administrator", class: "admin" },
                content_creator: { icon: "fa-solid fa-pen-nib", text: "Content Creator", class: "content-creator" }
            };

            const userRole = data.user.role || "guest";
            const roleBadge = badge[userRole] ? `
                <div class="badge ${badge[userRole].class}">
                    <i class="${badge[userRole].icon}"></i>
                    <span>${badge[userRole].text}</span>
                </div>` : `<div class="badge"><span>Guest</span></div>`;

            profile_card.innerHTML = `
                <div class="card" id="main">
                    <section class="left">
                        <div id="img_container">
                            <img id="user-image" src="${originalData.profile_picture}" alt="User Image">
                        </div>
                        <p id="username">${originalData.username}</p>
                        ${roleBadge}  
                    </section>
                    <section class="right">
                        <span id="id"><i class="fa-regular fa-address-card"> ID: </i> ${data.user.id || "N/A"}</span>
                        <p id="email"><i class="fa-solid fa-envelope"></i> Email: ${data.user.email || "N/A"}</p>
                        <span id="bio">${originalData.bio}</span>
                    </section>
                    <div id="btn_container">
                        <button id="edit-btn" class="btn edit" onclick="editProfileFields()"><i class="fa-solid fa-pen-to-square"></i>Edit Profile</button>
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
        <button class="btn save" onclick='saveProfile()'>Save</button>
        <button class="btn cancel" onclick='fetchUserData()'>Cancel</button>
    `;
}

async function saveProfile() {
    const saveButton = document.querySelector('.btn.save');
    saveButton.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Saving...`;
    saveButton.disabled = true;

    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser) {
        alert('You must be logged in to edit your profile.');
        resetSaveButton(saveButton);
        return;
    }

    const usernameInput = document.getElementById('username').querySelector('input');
    const bioInput = document.getElementById('bio').querySelector('textarea');

    const updatedData = {
        username: usernameInput.value.trim(),
        bio: bioInput.value.trim(),
    };

    const data = {
        contentType: "user",
        entry_id: originalData.entry_id,
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

        if (file.size > maxSize) {
            alert(`File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`);
            resetSaveButton(saveButton);
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
            await sendProfileUpdate(data, saveButton);
        };
        reader.readAsDataURL(file);
    } else {
        await sendProfileUpdate(data, saveButton);
    }
}

// Reset Save button back to normal
function resetSaveButton(button) {
    button.innerHTML = "Save";
    button.disabled = false;
}


async function sendProfileUpdate(data) {
    try {
        console.log("Data being sent:", JSON.stringify(data, null, 2));

        const response = await fetch(`/.netlify/functions/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        if (responseData.success) {
            createToast("success");
            await fetchUserData();
        } else {
            alert('Error updating profile: ' + responseData.error);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        createToast("error");
    }
}

// Ensure profile data loads after login
netlifyIdentity.on("login", () => fetchUserData());
netlifyIdentity.on("logout", () => {
    document.getElementById('profile_container').innerHTML = "<p>Please log in to see your profile.</p>";
});

// Only fetch user data if already logged in
if (netlifyIdentity.currentUser()) {
    fetchUserData();
}
