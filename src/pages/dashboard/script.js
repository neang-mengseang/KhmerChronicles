window.onload = function() {
  const user = JSON.parse(localStorage.getItem('user')); // Check if user is logged in
};


const contentStructures = {
  foodRanking: [
    { name: "title", label: "Title", type: "text" },
    { name: "ranking", label: "Ranking", type: "number" },
    { name: "image", label: "Image", type: "file" },
  ],
  travelArticle: [
    { name: "title", label: "Title", type: "text" },
    { name: "author", label: "Author", type: "text" },
    { name: "content", label: "Content", type: "textarea" },
  ],
  newsArticle: [
    { name: "title", label: "Title", type: "text" },
    { name: "date", label: "Date", type: "date" },
    { name: "summary", label: "Summary", type: "textarea" },
  ],
};

function loadFields() {
  const selectedType = document.getElementById("contentType").value;
  const formFieldsDiv = document.getElementById("form-fields");
  formFieldsDiv.innerHTML = "";

  if (selectedType && contentStructures[selectedType]) {
    contentStructures[selectedType].forEach(field => {
      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else {
        input = document.createElement("input");
        input.type = field.type;
      }
      input.name = field.name;
      input.placeholder = field.label;
      
      const label = document.createElement("label");
      label.innerText = field.label;
      
      formFieldsDiv.appendChild(label);
      formFieldsDiv.appendChild(input);
    });
  }
}

document.getElementById("content-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const selectedType = document.getElementById("contentType").value;
  if (!selectedType) {
    alert("Please select a content type");
    return;
  }

  const formData = new FormData(event.target);
  let fields = {};

  for (const [key, value] of formData.entries()) {
    if (key === "image") {
      const file = value;
      if (file.size > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          fields[key] = {
            title: file.name,
            contentType: file.type,
            fileName: file.name,
            data: reader.result.split(",")[1],
          };
          await sendData(selectedType, fields);
        };
        return;
      }
    } else {
      fields[key] = value;
    }
  }
  await sendData(selectedType, fields);
});

async function sendData(contentType, fields) {
  const response = await fetch("/.netlify/functions/createContent", {
    method: "POST",
    body: JSON.stringify({ contentType, fields }),
  });

  const data = await response.json();
  alert(data.message || "Error");
}