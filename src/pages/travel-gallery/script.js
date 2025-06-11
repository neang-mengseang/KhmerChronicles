let allArticles = []; // Store all articles

async function fetchArticles(contentType) {
  const res = await fetch(
    `/.netlify/functions/fetchContent?contentType=${encodeURIComponent(contentType)}`
  );
  const data = await res.json();
  return data;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function openModal(article) {
  console.log(article);
  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-image").src = article.fields.image;
  document.getElementById("modal-title").innerText = article.fields.title;
  document.getElementById("modal-author").innerText =
    article.fields.authorUsername;
  document.getElementById("author-image").src = article.fields.authorImage;
  document.getElementById("modal-description").innerText =
    article.fields.description || "404 | No Description Provided";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function loadArticles() {
  document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchArticles("travelGallery");

    if (data.success) {
      allArticles = data.travelGallery; // Store all fetched articles
      displayArticles(allArticles); // Initially display all articles
    } else {
      console.log("No articles found");
    }
  });

  // Close modal event
  document.querySelector(".close").addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) closeModal();
  });
}

// Display articles in the gallery
function displayArticles(gallery) {
  const container = document.getElementById("gallery");
  container.innerHTML = ""; // Clear previous content

  gallery.forEach((gallery) => {
    const card = document.createElement("div");
    card.classList.add("img-card");

    card.innerHTML = `
      <img src="${gallery.fields.image}" alt="${gallery.fields.title}" class="image">
      <div class="imgTitle">${gallery.fields.title}</div>
    `;

    card.addEventListener("click", () => openModal(gallery));

    container.appendChild(card);
  });
}

// Filter articles based on search query
function filterArticles() {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();

  // Filter articles that match the search query (in title or description)
  const filteredArticles = allArticles.filter((article) =>
    article.fields.title.toLowerCase().includes(searchQuery) ||
    (article.fields.description && article.fields.description.toLowerCase().includes(searchQuery))
  );

  // Display the filtered articles
  displayArticles(filteredArticles);
}

document.getElementById("searchInput").addEventListener("input", filterArticles);

loadArticles();
