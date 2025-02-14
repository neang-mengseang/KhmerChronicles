window.addEventListener("load", async () => {
    const rankingList = document.getElementById("rankingList");
    const data = await fetchContents();
    data.sort((a, b) => a.fields.ranking - b.fields.ranking);
  
    if (data.length > 0) {
      rankingList.innerHTML = ""; // Clear previous logs
      data.forEach((item) => {
        const list = document.createElement("li");
        list.className = "rankingItem";
        list.innerHTML = `
          <div class="ranking_item_container">
              <span>
                  <div class="rank">${item.fields.ranking || "N/A"}</div>
                  <p class="title">${item.fields.title || "Unknown Title"}</p>
              </span>
              <button class="edit_btn" data-id="${item.sys.id}">
                  <i class="fa-regular fa-pen-to-square"></i>
              </button>
          </div>
        `;
        rankingList.appendChild(list);
      });
  
      // Attach event listeners to edit buttons
      document.querySelectorAll(".edit_btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const entryId = event.currentTarget.getAttribute("data-id");
          const itemData = data.find((item) => item.sys.id === entryId);
          openEditModal(itemData);
        });
      });
    }
  });
  
  // Fetch contents from Contentful
  function fetchContents() {
    const contentTypes = "foodRanking";
    return fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`)
      .then((res) => res.json())
      .then((data) => data.foodRanking)
      .catch((err) => console.error("Error fetching content:", err));
  }
  
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
              <img id="previewImage" src="${item.fields.image ? item.fields.image.url : ''}" alt="Preview" class="preview hidden">
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
      saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...'; // Change text and show spinner
      saveButton.disabled = true; // Disable the button to prevent multiple clicks
  
      const newTitle = document.getElementById("editTitle").value;
      const newDesc = document.getElementById("editDesc").value;
      const uploadedImage = document.getElementById('fileInput').files[0];
      
      const success = await updateFoodRanking(item.sys.id, newTitle, newDesc, uploadedImage); // Pass the uploaded image
      console.log(success);
      if (success) {
        document.body.removeChild(modal); // Close the modal on success
      } else {
        saveButton.innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Save'; // Reset the button text
        saveButton.disabled = false; // Re-enable the button if update failed
        alert("Update failed!"); // Show failure message
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
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1]; // Extract base64 string
  
        updateData.updates.image = {
          title: uploadedImage.name,
          contentType: uploadedImage.type,
          fileName: uploadedImage.name,
          data: base64String,
        };
  

        try{
          const response = await fetch(`/.netlify/functions/updateContent`, {
            method: "POST",
            body: JSON.stringify(updateData),
          });
      
          if(response.ok){
            return true;
          }else{return false}
        }catch (error){
          console.log(error)
        }
      };
      reader.readAsDataURL(uploadedImage); // Start reading the image file
    }else{
      try{
        const response = await fetch(`/.netlify/functions/updateContent`, {
          method: "POST",
          body: JSON.stringify(updateData),
        });
    
        if(response.ok){
          return true;
        }else{return false}
      }catch (error){
        console.log(error)
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
  