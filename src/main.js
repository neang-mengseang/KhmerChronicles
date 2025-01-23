// Initialize Contentful client
const contentful = require('contentful');

const client = contentful.createClient({
    space: 'ntvh3j97dkce', // Replace with your Space ID
    accessToken: 'UC-xnFZuPk2OsBKWYLdZ8H6kwocji0aL37B5OvtH8HM' // Replace with your Access Token
});

// Fetch Food Ranking entries from Contentful
client.getEntries({
  content_type: 'foodRanking',  // Replace with the content type ID you created in Contentful
})
.then((response) => {
  const foodRankingContainer = document.getElementById('food-ranking');

  response.items.forEach(item => {
    const foodItemElement = document.createElement('div');
    foodItemElement.classList.add('food-item');

    foodItemElement.innerHTML = `
      <h2>${item.fields.title}</h2>
      <p>${item.fields.description}</p>
    `;

    foodRankingContainer.appendChild(foodItemElement);
  });
})
.catch((error) => {
  console.error('Error fetching data from Contentful:', error);
});
