window.addEventListener("load", async () => {
  const spinner = document.getElementById("loadingSpinner");
  const tableBody = document.getElementById("TableBody");
  const table = document.getElementById("table");
  const refreshBtn = document.getElementById("refreshBtn");


  
  async function fetchContents() {
    spinner.style.display = "block";
    table.style.display = "none";
    tableBody.innerHTML = ""; // Clear existing data

    try {
      const contentTypes = "foodArticle";
      const response = await fetch(
        `/.netlify/functions/fetchContent?contentType=${contentTypes}`
      );
      console.log("Fetching: ", contentTypes);
      const data = await response.json() || [];
      const item = data.foodArticle;
      console.log(item);
      if (item.length > 0) {
        item.forEach((item) => {
          console.log(item);
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="item_title">${item.fields.title || "Unknown Title"}</td>
            <td class="item_author"><a href="/profile/${item.fields.author.name}">${item.fields.author.name || "N/A"}</a></td>
            <td class="item_version">${item.sys.revision || "N/A"}</td>
            <td class="edit_btn_container">
                <button class="edit_btn" data-id="${item.sys.id}" disabled>
                    <i class="fa-regular fa-pen-to-square"></i> 
                </button>
                <button class="delete_btn" data-id="${item.sys.id}">
                    <i class="fa-regular fa-trash-can"></i> 
                </button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        document.querySelectorAll(".edit_btn").forEach((button) => {
          button.addEventListener("click", (event) => {
            const entryId = event.currentTarget.getAttribute("data-id");
            const itemData = item.find((data) => data.sys.id === entryId);
            openEditModal(itemData);
            console.log("opening Model");
          });
        });
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      spinner.style.display = "none";
      table.style.display = "table";
    }
  }

  refreshBtn.addEventListener("click", async () => {
    spinner.style.display = "block";
    table.style.display = "none";
    setTimeout(() => {
      fetchContents();
    }, 2000);
  });

  fetchContents();
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




// Open the edit modal
function openEditModal(item) {
  const modal = document.createElement("div");
  modal.className = "edit-modal";
  modal.innerHTML = `
      <div class="modal-content">
          <h2>Edit Food Article</h2>
          
          <div>
              <label>Title:</label>
              <input type="text" id="editTitle" value="${item.fields.title}">
          </div>
          
          <div>
              <label>Description:</label>
              <textarea id="editDesc">${item.fields.introduction}</textarea>
          </div>
  
          <!-- Drag & Drop File Upload -->
          <div class="drop-area" id="dropArea">
              <i class="fa-regular fa-image"></i>
              <p>Drag & drop an image here or <span id="browse">browse</span></p>
              <input type="file" id="fileInput" hidden>
              <img id="previewImage" src="${
                item.fields.image ? item.fields.image.url : ""
              }" alt="Preview" class="preview hidden">
          </div>
  
          <div class="btnContainer">
              <button class="btn" id="saveEdit"><i class="fa-regular fa-floppy-disk"></i> Save</button>
              <button class="btn" id="closeEdit"><i class="fa-solid fa-xmark"></i> Cancel</button>
          </div>
      </div>
    `;

  document.body.appendChild(modal);

  dragNdrop(item); // Pass item to dragNdrop function

  // Close modal event
  document.getElementById("closeEdit").addEventListener("click", () => {
    document.body.removeChild(modal);
  });

  // Save event
  document.getElementById("saveEdit").addEventListener("click", async () => {
    const saveButton = document.getElementById("saveEdit");
    saveButton.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; // Change text and show spinner
    saveButton.disabled = true; // Disable the button to prevent multiple clicks

    const newTitle = document.getElementById("editTitle").value;
    const newDesc = document.getElementById("editDesc").value;
    const uploadedImage = document.getElementById("fileInput").files[0];

    const success = await updateFoodRanking(
      item.sys.id,
      newTitle,
      newDesc,
      uploadedImage
    ); // Pass the uploaded image
    if (success) {
      document.body.removeChild(modal); // Close the modal on success
      createToast("success");
    } else {
      saveButton.innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Save'; // Reset the button text
      saveButton.disabled = false; // Re-enable the button if update failed
      alert("Update failed!"); // Show failure message
      createToast("error");
    }
  });
}


// Drag and drop functionality for the image upload
function dragNdrop(item) {
  const dropArea = document.getElementById("dropArea");
  const fileInput = document.getElementById("fileInput");
  const previewImage = document.getElementById("previewImage");

  dropArea.addEventListener("click", () => fileInput.click());

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("dragging");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragging");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("dragging");
    if (event.dataTransfer.files.length > 0) {
      handleFile(event.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (event) => {
    if (event.target.files.length > 0) {
      handleFile(event.target.files[0]);
    }
  });

  function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImage.src = reader.result;
        previewImage.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      alert("Only image files are allowed!");
    }
  }
}


document.getElementById("table").addEventListener("click", async (event) => {
  if (event.target.closest(".delete_btn")) {
      const button = event.target.closest(".delete_btn");
      const entryId = button.getAttribute("data-id");
      const row = button.closest("tr"); // Get the row to remove after deletion

      if (!entryId) return;

      // Show the confirmation modal
      showDeleteModal(entryId, row, button);
  }
});

// Function to create and display the confirmation modal
function showDeleteModal(entryId, row, button) {
  // Create modal HTML
  const modal = document.createElement("div");
  modal.className = "delete-modal";
  modal.innerHTML = `
      <div class="modal-content">
          <h2>Are you sure you want to delete this content?</h2>
          <p>Content ID: ${entryId}</p>
          <div class="modal-buttons">
              <button id="confirmDelete" class="confirm">Yes, Delete</button>
              <button id="cancelDelete" class="cancel">No, Cancel</button>
          </div>
      </div>
  `;

  document.body.appendChild(modal);

  // Handle delete confirmation
  document.getElementById("confirmDelete").addEventListener("click", async () => {
      button.disabled = true;
      button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

      try {
          const response = await fetch("/.netlify/functions/deleteContent", {
              method: "POST",
              body: JSON.stringify({ entryId }),
              headers: { "Content-Type": "application/json" },
          });

          const data = await response.json();
          if (response.ok) {
              button.innerHTML = `<i class="fa-regular fa-trash-can"></i> Deleted`;
              button.style.background = "#ccc"; // Optional: Gray out button
              createToast("success");
              // ✅ Remove the deleted row from UI
              setTimeout(() => {
                  row.remove();
              }, 500);
          } else {
              throw new Error(data.error || "Failed to delete content.");
          }
      } catch (error) {
          console.error(error);
          button.innerHTML = `<i class="fa-regular fa-trash-can"></i> Delete`;
          button.disabled = false;

          createToast("error");
      } finally {
          document.body.removeChild(modal);
      }
  });

  // Handle cancel button
  document.getElementById("cancelDelete").addEventListener("click", () => {
      document.body.removeChild(modal);
  });
}
