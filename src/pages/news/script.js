const API_KEY = "0a298266397a4879b101e6f93bac8d8b";  // Replace with your NewsAPI key

async function fetchNews() {
    const sortBy = document.getElementById("sortByFilter").value; // Get sort by selection (e.g., popularity, relevancy, etc.)
    const query = document.getElementById("searchInput").value; // Get search query



    let url = `https://newsapi.org/v2/everything?language=en&apiKey=${API_KEY}`;


        // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "block";
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";  // Clear previous news
    


    // Append sortBy filter to URL if provided
    if (sortBy) {
        url += `&sortBy=${sortBy}`;
    }

    // Append search query if there is input
    if (query) {
        url += `&q=${encodeURIComponent(query)}`;
    }else{
        url += `&q=cambodia`;

    }

    console.log("Fetching URL:", url); // Log the constructed URL for debugging

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("API Response:", data); // Log the full API response

        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            displayNoResults(); // Show message if no articles are found
        }
    } catch (error) {
        console.error("Error fetching news:", error);
    }
}

function displayNoResults() {
    const newsList = document.getElementById("newsList");
    document.getElementById("loadingSpinner").style.display = "none";
    newsList.innerHTML = "<p>No news found. Please try a different search or filter.</p>";
}

function displayNews(articles) {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = ""; // Clear previous articles

    articles.forEach(article => {
        const newsItem = document.createElement("li");
        newsItem.classList.add("news-item");

        const imageUrl = article.urlToImage || "https://via.placeholder.com/150";  // Fallback image
        newsItem.innerHTML = `
            <img src="${imageUrl}" alt="News Image">
            <div>
                <h3>${article.title}</h3>
                <p class="ellipsis-text">${article.description || "No description available."}</p>
                <p><a href="${article.url}" target="_blank">Read more</a></p>
            </div>
        `;

        newsList.appendChild(newsItem);
        document.getElementById("loadingSpinner").style.display = "none"; 
    });
}

// Fetch news when the search button is clicked
document.getElementById("searchButton").addEventListener("click", fetchNews);

// Optionally, trigger fetchNews when the user presses "Enter" in the search input
document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        fetchNews();
    }
});

// Initial fetch on page load
fetchNews();
