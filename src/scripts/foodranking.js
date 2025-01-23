console.log("Javascriping [ Main.js ] is running...");
const client = contentful.createClient({
    space: 'ntvh3j97dkce',
    accessToken: 'UC-xnFZuPk2OsBKWYLdZ8H6kwocji0aL37B5OvtH8HM' 
});

// Fetch Food Ranking entries from 
client.getEntries({
    content_type: 'foodRanking',  
  })
  .then((response) => {
    console.log('Data fetched:', response.items); 
  
    const foodRankingContainer = document.getElementById('food-ranking');
  
    // Check if there are any items
    if (response.items.length === 0) {
      foodRankingContainer.innerHTML = '<p>No food ranking data found.</p>';
      return;
    }
  
    response.items.forEach(item => {
      const foodItemElement = document.createElement('div');
      foodItemElement.classList.add('food-item');
  
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