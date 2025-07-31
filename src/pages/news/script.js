const IS_DEV_MODE = true; // toggle dev mode
let currentPage = 1;
let totalPages = 1;
const pageSize = 24;

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const topicButtons = document.querySelectorAll('.topic-btn');
  const sortByFilter = document.getElementById('sortByFilter');

  // Initial fetch
  fetchNews('breaking');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (query) fetchNews(query);
  });

  topicButtons.forEach(button => {
    button.addEventListener('click', () => {
      const topic = button.dataset.topic;
      document.getElementById('searchInput').value = topic === 'breaking' ? '' : topic;
      fetchNews(topic);
    });
  });

  sortByFilter.addEventListener('change', () => {
    const query = document.getElementById('searchInput').value.trim() || "cambodia";
    fetchNews(query, sortByFilter.value, 1);
  });

  // Pagination buttons
  ["Top", "Bottom"].forEach(pos => {
    const nextBtn = document.getElementById(`nextBtn${pos}`);
    const prevBtn = document.getElementById(`prevBtn${pos}`);

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPages) {
          const query = document.getElementById('searchInput').value.trim() || "cambodia";
          fetchNews(query, sortByFilter.value, currentPage + 1);

          // Scroll to top on bottom pagination
          if (pos === "Bottom") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          const query = document.getElementById('searchInput').value.trim() || "cambodia";
          fetchNews(query, sortByFilter.value, currentPage - 1);

          if (pos === "Bottom") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      });
    }
  });
});

async function fetchNews(query, sortBy = "relevancy", page = 1) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const newsGrid = document.getElementById('newsGrid');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const noResults = document.getElementById('noResults');

  loadingIndicator.classList.remove('hidden');
  newsGrid.innerHTML = '';
  errorMessage.classList.add('hidden');
  noResults.classList.add('hidden');

  try {
    let data;

    if (IS_DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('/src/pages/news/data.json');
      data = await response.json();

    } else {
      let url = `/.netlify/functions/fetchNews?sortBy=${sortBy}&page=${page}&pageSize=${pageSize}`;
      if (query && query !== 'breaking') {
        url += `&q=${encodeURIComponent(query)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      data = await response.json();
    }

    if (data.status === "ok") {
      console.log('News data fetched successfully');
    }

    if (data.articles && data.articles.length > 0) {
      loadingIndicator.classList.add('hidden');
      displayNews(data.articles);
      totalPages = Math.ceil(data.totalResults / pageSize);
      currentPage = page;
      updatePaginationUI();
    } else {
      loadingIndicator.classList.add('hidden');
      noResults.classList.remove('hidden');
      totalPages = 1;
      currentPage = 1;
      updatePaginationUI();
    }
  } catch (error) {
    if (errorText) errorText.textContent = error.message || 'Failed to fetch news.';
    if (errorMessage) errorMessage.classList.remove('hidden');
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

function updatePaginationUI() {
  const pageIndicatorTop = document.getElementById("pageIndicatorTop");
  const pageIndicatorBottom = document.getElementById("pageIndicatorBottom");
  const prevBtnTop = document.getElementById("prevBtnTop");
  const nextBtnTop = document.getElementById("nextBtnTop");
  const prevBtnBottom = document.getElementById("prevBtnBottom");
  const nextBtnBottom = document.getElementById("nextBtnBottom");

  if (pageIndicatorTop) pageIndicatorTop.textContent = `Page ${currentPage} of ${totalPages}`;
  if (pageIndicatorBottom) pageIndicatorBottom.textContent = `Page ${currentPage} of ${totalPages}`;

  if (prevBtnTop) prevBtnTop.disabled = currentPage <= 1;
  if (nextBtnTop) nextBtnTop.disabled = currentPage >= totalPages;
  if (prevBtnBottom) prevBtnBottom.disabled = currentPage <= 1;
  if (nextBtnBottom) nextBtnBottom.disabled = currentPage >= totalPages;
}

function displayNews(articles) {
  const newsGrid = document.getElementById('newsGrid');
  newsGrid.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card';

    const imageUrl = article.urlToImage;
    const source = article.source?.name || 'Unknown';
    const date = new Date(article.publishedAt).toLocaleDateString();

    card.innerHTML = `
      <div class="${imageUrl ? '' : 'placeholder-img'}">
        ${imageUrl ? `<img src="${imageUrl}" alt="${article.title}" loading="lazy">`
                  : '<i class="fas fa-image"></i>'}
      </div>
      <div class="content">
        <div class="meta">
          <span>${source}</span>
          <span>${date}</span>
        </div>
        <h3>${article.title}</h3>
        <p>${article.description || ''}</p>
        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
          Read more <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;

    newsGrid.appendChild(card);
  });
}
