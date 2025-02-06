async function fetchArticles(contentType) {
  const response = await fetch('/.netlify/functions/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: contentType, get: "fetch" }), // Include id if requesting a specific article
  });

  const data = await response.json();
  return data;
}

function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');       // Remove leading & trailing hyphens
} 

async function loadArticles() {
  document.addEventListener("DOMContentLoaded", () => {
    fetchArticles("travelArticles")
      .then((data) => {
        if (data.exists) {
          const container = document.getElementById("articles-container");
          container.innerHTML = ""; // Clear previous content
          data.articles.forEach((article) => {
            const card = document.createElement("div");
            card.classList.add("article-card");
            const generatedSlug = generateSlug(article.title);
            card.innerHTML = `
              <img src="${article.image}" alt="${article.title}" class="article-image">
              <div class="article-content">
                <h2 class="article-title">${article.title}</h2>
                <p class="article-author">By ${article.author.authorName} - ${article.dateCreate}</p>
                <p class="article-description">${article.introduction}</p>
                <a href="/travel-articles/${generatedSlug}" class="read-more">Read More</a>
              </div>
            `;

            container.appendChild(card);
          });
        } else {
          console.log("No articles found");
        }
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  });
}

// Call function on page load
loadArticles();
