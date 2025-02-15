window.addEventListener("load", async () => {
    const contentType = "travelArticles";

    document.getElementById("addBtn").addEventListener("click", function () {
        console.log("➕ Add Button Clicked");
        if (document.getElementById("contentForm")) return; // Prevent duplicate forms

        const formContainer = document.getElementById("formContainer");
        formContainer.style.display = "flex";

        // Create form element
        const form = document.createElement("form");
        form.id = "contentForm";

        // Create content editor container
form.innerHTML = `
    <button type="button" class="close-btn">✖</button>
    <h3>Add New Content | Food Article</h3>
    <div>
        <!-- Title input with label -->
        <label for="title">Title:</label>
        <input type="text" id="title" name="title" placeholder="Title" required><br>
    </div>
    <div>
        <!-- Introduction textarea with label -->
        <label for="introduction">Introduction:</label>
        <textarea id="introduction" name="introduction" placeholder="Introduction" required></textarea><br>

    </div>
    <div>
        <!-- Quill editor container -->
        <label for="editor-container">Content:</label>
        <div id="editor-container" style="height: 200px; border: 1px solid #ccc;"></div>
    </div>
    <div>
        <!-- Featured Image input with label -->
    <label for="featuredImage">Featured Image:</label>
    <input type="file" id="featuredImage" accept="image/*"><br>

    </div>
    <button id="submitBtn" type="submit"><i class="fa-solid fa-check"></i>Submit</button>
`;

        formContainer.appendChild(form);
        form.style.display = "block";
        
        // Initialize Quill Editor
        const quill = new Quill("#editor-container", {
            theme: "snow",
            placeholder: "Write your content here...",
            modules: {
                toolbar: [
                    ["bold", "italic", "underline"],
                    [{ header: [1, 2, 3, false] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                ],
            },
        });

        // Prevent image pasting & dropping
        quill.clipboard.addMatcher("IMG", function () {
            return new Delta(); // Prevents pasted images
        });

        quill.root.addEventListener("drop", function (event) {
            event.preventDefault(); // Prevents drag-and-drop image uploads
        });

        // Handle form submission
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const user = netlifyIdentity.currentUser();
            if (!user) {
                document.getElementById("message").textContent = "You must be logged in!";
                return;
            }

            const submitBtn = document.getElementById("submitBtn");
            // Disable the submit button to prevent multiple submissions
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'; // Optional: Add a spinner and text



            const title = document.getElementById("title").value;
            const introduction = document.getElementById("introduction").value;
            const content = quill.getContents(); // Get Quill Delta content
            const featuredImageInput = document.getElementById("featuredImage");

            let featuredImageId = null;
            if (featuredImageInput.files.length > 0) {
                try {
                    featuredImageId = await uploadImage(featuredImageInput.files[0]);
                } catch (error) {
                    document.getElementById("message").textContent = "Image upload failed!";
                    return;
                }
            }

            const formData = {
                userId: user.id,
                contentType: "travelArticles",
                title,
                introduction,
                content,
                featuredImageId,
            };

            try {
                const response = await fetch("/.netlify/functions/addContent", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                console.log(data);
                formContainer.style.display = "none";
                form.remove(); // Completely removes the form from the DOM
                createToast("success");
            } catch (error) {
                formContainer.style.display = "none";
                form.remove(); // Completely removes the form from the DOM
                createToast("error");            
            }
        });

        async function uploadImage(file) {
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64String = reader.result.split(",")[1]; // Remove the base64 prefix
                    const formData = {
                        imageName: file.name,
                        imageType: file.type,
                        imageBase64: base64String,
                    };

                    try {
                        const response = await fetch("/.netlify/functions/uploadImage", {
                            method: "POST",
                            body: JSON.stringify(formData),
                        });

                        const data = await response.json();
                        if (response.ok) {
                            resolve(data.assetId); // Return the uploaded image's asset ID
                        } else {
                            reject(data.error);
                        }
                    } catch (error) {
                        reject("Failed to upload image.");
                    }
                };

                reader.readAsDataURL(file);
            });
        }

        // Close editor functionality
        const closeButton = form.querySelector(".close-btn");
        closeButton.addEventListener("click", function () {
            console.log("Close Button Clicked");
            formContainer.style.display = "none";
            form.remove(); // Completely removes the form from the DOM
        });
    });

    
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
    },
    info: {
        icon: "fa-solid fa-circle-info",
        text: "Please input all value to submit."
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

});
