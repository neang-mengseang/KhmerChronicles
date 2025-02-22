window.addEventListener("load", async () => {
  const spinner = document.getElementById("loadingSpinner");
  const tableBody = document.getElementById("rankingTableBody");
  const table = document.getElementById("table");
  const refreshBtn = document.getElementById("refreshBtn");

  async function fetchContents() {
    spinner.style.display = "block";
    table.style.display = "none";
    tableBody.innerHTML = ""; // Clear existing data

    try {
      const contentTypes = "topPick";
      const response = await fetch(
        `/.netlify/functions/fetchContent?contentType=${contentTypes}`
      );
      const data = await response.json();
      const rankings = data.topPick || [];

      rankings.sort((a, b) => a.fields.ranking - b.fields.ranking);

      if (rankings.length > 0) {
        rankings.forEach((item) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td class="item_ranking">${item.fields.ranking || "N/A"}</td>
            <td class="item_title">${item.fields.title || "Unknown Title"}</td>
            <td class="item_version">${item.sys.revision || "N/A"}</td>
            <td class="edit_btn_container">
                <button class="edit_btn" data-id="${item.sys.id}">
                    <i class="fa-regular fa-pen-to-square"></i> Edit
                </button>
            </td>
          `;
          tableBody.appendChild(row);
        });

        document.querySelectorAll(".edit_btn").forEach((button) => {
          button.addEventListener("click", (event) => {
            const entryId = event.currentTarget.getAttribute("data-id");
            const itemData = rankings.find((item) => item.sys.id === entryId);
            openEditModal(itemData);
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
          <h2>Edit Food Ranking</h2>
          
          <div>
              <label>Title:</label>
              <input type="text" id="editTitle" value="${item.fields.title}">
          </div>
          
          <div>
              <label>Description:</label>
              <textarea id="editDesc">${item.fields.description}</textarea>
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

// Function to update content in Contentful
async function updateFoodRanking(entryId, newTitle, newDesc, uploadedImage) {
  let updateData = {
    entryId: entryId,
    updates: {
      title: newTitle || "",
      description: newDesc || "",
    },
  };

  if (uploadedImage) {
    const maxSize = 5 * 1024 * 1024; // Max size: 5MB
    if (uploadedImage.size > maxSize) {
      alert(`File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`);
      return false;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(",")[1]; // Extract base64 string

        updateData.updates.image = {
          title: uploadedImage.name,
          contentType: uploadedImage.type,
          fileName: uploadedImage.name,
          data: base64String,
        };

        try {
          const response = await fetch(`/.netlify/functions/updateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          });

          resolve(response.ok); // Return true if success, false otherwise
        } catch (error) {
          console.log(error);
          resolve(false); // Ensure it resolves to false on error
        }
      };
      reader.readAsDataURL(uploadedImage); // Start reading the image file
    });
  } else {
    try {
      const response = await fetch(`/.netlify/functions/updateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      return response.ok; // Return true if successful
    } catch (error) {
      console.log(error);
      return false;
    }
  }
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
