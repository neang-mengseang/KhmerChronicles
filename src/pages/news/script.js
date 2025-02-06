// news.js - Frontend for fetching and displaying news with filtering

let newsData = [];
const CACHE_KEY = "news_cache";
const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 minutes

// Fetch news from Netlify serverless function
async function fetchNews() {
    try {
      const response = await fetch("/.netlify/functions/fetchNews");
      const data = await response.json();
  
      // Check if data contains articles, otherwise handle the error
      if (!data || !Array.isArray(data.articles)) {
        console.error("Invalid data format:", data);
        return;
      }
  
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(`${CACHE_KEY}_time`, Date.now());
      newsData = data.articles;
      displayNews(newsData);
  
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }
  

function displayNews(data) {
    console.log(data); // Log the data to check if it's an array
    const newsContainer = document.getElementById("news-container");
    newsContainer.innerHTML = "";
  
    // If data is an object, use data.articles to access the array
    const articles = Array.isArray(data) ? data : data.articles;
  
    articles.forEach(article => {
      const newsCard = document.createElement("div");
      newsCard.classList.add("news-card");
      newsCard.innerHTML = `
        <img src="${article.urlToImage}" alt="News Image">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <span class="category">${article.category}</span>
        <span class="date">${new Date(article.publishedAt).toDateString()}</span>
      `;
      newsContainer.appendChild(newsCard);
    });
  }
  

// Filtering function
function filterNews() {
  const category = document.getElementById("filter-category").value;
  const searchQuery = document.getElementById("search-query").value.toLowerCase();

  const filteredData = newsData.filter(article => 
    (category === "all" || article.category === category) &&
    (article.title.toLowerCase().includes(searchQuery) || 
    article.description.toLowerCase().includes(searchQuery))
  );

  displayNews(filteredData);
}

// Event listeners
document.getElementById("filter-category").addEventListener("change", filterNews);
document.getElementById("search-query").addEventListener("input", filterNews);

// Fetch news on load
fetchNews();
