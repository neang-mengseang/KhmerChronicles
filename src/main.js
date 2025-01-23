// Initialize Contentful client
const contentful = require('contentful');

const client = contentful.createClient({
  space: 'your_space_id',  // Replace with your Space ID
  accessToken: 'your_access_token'  // Replace with your Content Delivery API Access Token
});

// Fetch Food Ranking entries from Contentful
client.getEntries({
  content_type: 'foodRanking',  // Replace with the content type ID you created in Contentful
})
.then((response) => {
  const foodRankingContainer = document.getElementById('food-ranking');

  // Loop through the entries and display them
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
