// Initialize Contentful client
const contentful = require('contentful');

const client = contentful.createClient({
    space: 'ntvh3j97dkce', // Replace with your Space ID
    accessToken: 'UC-xnFZuPk2OsBKWYLdZ8H6kwocji0aL37B5OvtH8HM' // Replace with your Access Token
});

// Fetch Food Ranking entries from Contentful
client.getEntries({
    content_type: 'foodRanking',  // This is the content type ID you defined
  })
  .then((response) => {
    const foodRankingContainer = document.getElementById('food-ranking');
  
    // Loop through the entries and display them
    response.items.forEach(item => {
      const foodItemElement = document.createElement('div');
      foodItemElement.classList.add('food-item');
  
      // Get the image URL (if available)
      const imageUrl = item.fields.image ? item.fields.image.fields.file.url : '';
  
      foodItemElement.innerHTML = `
        <h2>${item.fields.title}</h2>
        <p>Ranking: ${item.fields.ranking}</p>
        ${imageUrl ? `<img src="https:${imageUrl}" alt="${item.fields.title}" />` : ''}
        <p>${item.fields.description}</p>
      `;
  
      foodRankingContainer.appendChild(foodItemElement);
    });
  })
  .catch((error) => {
    console.error('Error fetching data from Contentful:', error);
  });