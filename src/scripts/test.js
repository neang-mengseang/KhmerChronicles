document.addEventListener('DOMContentLoaded', async () => {
    const articlesContainer = document.getElementById('articles-container');
    const pageTitle = document.getElementById('page-title');
    const carouselIndicators = document.getElementById('carouselIndicators');

    const urlParams = new URLSearchParams(window.location.search);
    const contentType = urlParams.get('contentType') || 'foodArticle';

    if (contentType === 'foodArticle') {
        pageTitle.innerHTML = '🍽️ Food Articles';
    } else {
        pageTitle.innerHTML = '✈️ Travel Articles';
    }

    try {
        const response = await fetch(`/.netlify/functions/fetchContent?contentType=${contentType}`);
        const data = await response.json();
        const articles = data[contentType];

        articles.forEach((article, index) => {
            const card = document.createElement('div');
            card.className = 'featured-card';

            card.innerHTML = `
                <div class="featured-image">
                    <img src="${article.fields.image}" alt="${article.fields.title}">
                </div>
                <div class="featured-content">
                    <h2>${article.fields.title}</h2>
                    <p>${article.fields.introduction}</p>
                    <a href="#" class="btn">Read More</a>
                </div>
            `;
            articlesContainer.appendChild(card);

            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.dataset.index = index;
            indicator.addEventListener('click', () => {
                articlesContainer.scrollTo({
                    left: card.offsetLeft,
                    behavior: 'smooth'
                });
            });
            carouselIndicators.appendChild(indicator);
        });

        articlesContainer.addEventListener('scroll', () => {
            const scrollPosition = articlesContainer.scrollLeft;
            const cardWidth = articlesContainer.children[0].offsetWidth;
            const currentIndex = Math.round(scrollPosition / cardWidth);

            document.querySelectorAll('.indicator').forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
    }
});