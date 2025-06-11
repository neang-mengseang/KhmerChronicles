const API_KEY = "0a298266397a4879b101e6f93bac8d8b"; // Replace with your NewsAPI key

async function fetchNews() {
    const sortBy = document.getElementById("sortByFilter").value;
    const query = document.getElementById("searchInput").value;

    let url = `/.netlify/functions/fetchNews?sortBy=${sortBy || "relevancy"}`;

    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
    }

    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "block";

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById("loadingSpinner").style.display = "none";

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}


function displayNoResults() {
    document.getElementById("newsList").innerHTML = "<p>No news found. Please try a different search or filter.</p>";
}

function displayNews(articles) {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = ""; // Clear previous articles

    articles.forEach(article => {
        const newsItem = document.createElement("li");
        newsItem.classList.add("news-item");

        const imageUrl = article.urlToImage || "https://via.placeholder.com/150"; // Fallback image
        newsItem.innerHTML = `
            <img src="${imageUrl}" alt="News Image">
            <div>
                <h3>${article.title}</h3>
                <p class="ellipsis-text">${article.description || "No description available."}</p>
                <p><a href="${article.url}" target="_blank">Read more</a></p>
            </div>
        `;

        newsList.appendChild(newsItem);
    });
}

// Event Listeners
document.getElementById("searchButton").addEventListener("click", fetchNews);
document.getElementById("searchInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        fetchNews();
    }
});

// Initial fetch on page load
fetchNews();
