async function fetchArticles(contentType) {
  const contentTypes = encodeURIComponent(contentType);

  const res = await fetch(`/.netlify/functions/fetchContent?contentType=${contentTypes}`);

  const data = await res.json();
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
        console.log(data);
        if (data.success = true) {
          const container = document.getElementById("articles-container");
          container.innerHTML = ""; // Clear previous content
          data.travelArticles.forEach((article) => {
            const card = document.createElement("div");
            card.classList.add("article-card");
            const generatedSlug = generateSlug(article.fields.title);
            card.innerHTML = `
              <img src="${article.fields.image}" alt="${article.fields.title}" class="article-image">
              <div class="article-content">
                <h2 class="article-title">${article.fields.title}</h2>
                <p class="article-author">By ${article.fields.authorName} - ${article.fields.dateCreate}</p>
                <p class="article-description">${article.fields.introduction}</p>
                <a href="/food-article/${generatedSlug}" class="read-more">Read More</a>
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
