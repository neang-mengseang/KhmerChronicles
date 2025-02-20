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
  document.getElementById("author").href = `/profile/${article.fields.author.name}`;
  document.getElementById("author-username").innerText = article.fields.author.name;
  document.getElementById("author-image").src = article.fields.author.image;
  document.getElementById("modal-description").innerText =
    article.fields.description || "404 | No Description Provided";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

async function loadArticles() {
  document.addEventListener("DOMContentLoaded", async () => {
    const data = await fetchArticles("cuisineGallery");

    if (data.success) {
      allArticles = data.cuisineGallery; // Store all fetched articles
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
function displayArticles(galleries) {
  const container = document.getElementById("gallery");
  const notFound = document.getElementById("notFound");
  notFound.style.display = "none";
  container.innerHTML = ""; // Clear previous content

  if (galleries.length === 0) {
    // Show "No results found" message if no gallery match
    notFound.style.display = "flex";
  }

  galleries.forEach((gallery) => {
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

function filterGalleries() {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();

  const filteredGalleries = allArticles.filter((gallery) =>
    gallery.fields.title.toLowerCase().includes(searchQuery) ||
    (gallery.fields.description && gallery.fields.description.toLowerCase().includes(searchQuery))
  );

  // Display the filtered articles
  displayArticles(filteredGalleries);
}

document.getElementById("searchInput").addEventListener("input", filterGalleries);

loadArticles();
