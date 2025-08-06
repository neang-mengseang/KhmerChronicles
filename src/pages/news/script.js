const IS_DEV_MODE = true;
const pageSize = 24;
let currentPage = 1;
let totalPages = 1;

// DOM references
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const topicButtons = document.querySelectorAll('.topic-btn');
const sortByFilter = document.getElementById('sortByFilter');
const loadingIndicator = document.getElementById('loadingIndicator');
const newsGrid = document.getElementById('newsGrid');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const noResults = document.getElementById('noResults');

document.addEventListener('DOMContentLoaded', () => {
  fetchNews("breaking");

  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = getSearchQuery();
    if (query) fetchNews(query);
  });

  topicButtons?.forEach(button => {
    button.addEventListener('click', () => {
      const topic = button.dataset.topic;
      searchInput.value = topic === 'breaking' ? '' : topic;
      fetchNews(topic);
    });
  });

  sortByFilter?.addEventListener('change', () => {
    fetchNews(getSearchQuery() || "cambodia", sortByFilter.value, 1);
  });

  // Pagination handlers
  ["Top", "Bottom"].forEach(position => {
    ["next", "prev"].forEach(direction => {
      const button = document.getElementById(`${direction}Btn${position}`);
      if (button) {
        button.addEventListener("click", () => {
          const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
          if (nextPage >= 1 && nextPage <= totalPages) {
            fetchNews(getSearchQuery() || "cambodia", sortByFilter.value, nextPage);
            if (position === "Bottom") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }
        });
      }
    });
  });
});

function getSearchQuery() {
  return searchInput?.value.trim();
}

async function fetchNews(query, sortBy = "relevancy", page = 1) {
  if (!newsGrid) return;

  // Reset UI
  loadingIndicator?.classList.remove('hidden');
  errorMessage?.classList.add('hidden');
  noResults?.classList.add('hidden');
  newsGrid.innerHTML = '';

  try {
    let data;
    if (IS_DEV_MODE) {
      await delay(1000);
      const response = await fetch('/src/pages/news/data.json');
      data = await response.json();
    } else {
      let url = buildNewsUrl(query, sortBy, page);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      data = await response.json();
    }

    if (data?.status === "ok" && data.articles?.length) {
      displayNews(data.articles);
      currentPage = page;
      totalPages = Math.ceil(data.totalResults / pageSize);
    } else {
      noResults?.classList.remove('hidden');
      currentPage = totalPages = 1;
    }

    updatePaginationUI();

  } catch (err) {
    errorText.textContent = err.message || "Something went wrong.";
    errorMessage?.classList.remove('hidden');
  } finally {
    loadingIndicator?.classList.add('hidden');
  }
}

function buildNewsUrl(query, sortBy, page) {
  const baseUrl = '/.netlify/functions/fetchNews';
  const params = new URLSearchParams({
    sortBy,
    page,
    pageSize
  });

  if (query && query !== 'breaking') {
    params.append('q', query);
  }

  return `${baseUrl}?${params.toString()}`;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updatePaginationUI() {
  const indicators = [
    { indicator: "pageIndicatorTop", prev: "prevBtnTop", next: "nextBtnTop" },
    { indicator: "pageIndicatorBottom", prev: "prevBtnBottom", next: "nextBtnBottom" },
  ];

  indicators.forEach(({ indicator, prev, next }) => {
    const ind = document.getElementById(indicator);
    const prevBtn = document.getElementById(prev);
    const nextBtn = document.getElementById(next);

    if (ind) ind.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  });
}

function displayNews(articles) {
  newsGrid.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'news-card';

    const imageUrl = article.urlToImage;
    const source = article.source?.name || 'Unknown';
    const date = new Date(article.publishedAt).toLocaleDateString();

    card.innerHTML = `
      <div class="${imageUrl ? '' : 'placeholder-img'}">
        ${imageUrl 
          ? `<img src="${imageUrl}" alt="${article.title}" loading="lazy">`
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
