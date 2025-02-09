let currentContentType = "foodArticle";  // Set the content type manually

window.onload = () => loadContent(); // Load content on page load

function loadContent() {
    console.log(`Load Content is running...`);
    fetch(`/.netlify/functions/fetchContent?contentType=${currentContentType}`)
    .then(res => res.json())
    .then(data => {
        console.log("Fetched data:", data);  // Log the entire response to check its structure
        
        // Ensure that 'items' exists in the data
        if (!data) {
            console.error("Error: Missing or invalid 'items' in API response.");
            return;
        }

        const contentList = document.getElementById("contentList");
        contentList.innerHTML = "";  // Clear existing content
        
        // Proceed with the forEach loop
        data.forEach(item => {
            console.log(item);  // Log each item
            const fields = item.fields;
            const title = fields.title || "Untitled";
            const date = fields.date || "Unknown Date";
            const authorImage = fields.authorImage || "/src/assets/img/user.svg";
            const authorName = fields.authorName || "Unknown Author";

            const div = document.createElement("div");
            div.classList.add("content-item");
            div.innerHTML = `
                <img src="${authorImage}" alt="Author">
                <div>
                    <strong>${title}</strong> <br>
                    <small>${date} - ${authorName}</small>
                    <div class="hidden-details">
                        <pre>${JSON.stringify(fields, null, 2)}</pre>
                        <button onclick="editContent('${item.id}')">Edit</button>
                        <button onclick="deleteContent('${item.id}')">Delete</button>
                    </div>
                </div>
            `;

            div.addEventListener("click", () => {
                div.querySelector(".hidden-details").style.display = "block";
            });

            contentList.appendChild(div);
        });
    })
    .catch(err => console.error("Error loading content:", err));
}
