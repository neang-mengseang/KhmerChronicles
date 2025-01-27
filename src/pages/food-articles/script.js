document.addEventListener('DOMContentLoaded', function() {
    // Fetch the list of articles from Contentful
    fetch('/.netlify/functions/foodArticleList')
      .then(response => response.json())
      .then(data => {
        const articleList = document.getElementById('article-list');
        data.items.forEach(item => {
          const articleElement = document.createElement('li');
          articleElement.classList.add('article-item');
          
          const link = document.createElement('a');
          link.href = `/article.html?slug=${item.fields.slug}`;
          link.textContent = item.fields.title;
          
          articleElement.appendChild(link);
          articleList.appendChild(articleElement);
        });
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
      });
  });
  