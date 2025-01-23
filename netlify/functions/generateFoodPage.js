const contentful = require('contentful');
const fs = require('fs');
const path = require('path');

// Set up Contentful client
const client = contentful.createClient({
    space: 'ntvh3j97dkce', // Replace with your Space ID
    accessToken: 'UC-xnFZuPk2OsBKWYLdZ8H6kwocji0aL37B5OvtH8HM' // Replace with your Access Token
});

exports.handler = async (event, context) => {
  try {
    // Fetch the content from Contentful
    const foodItems = await client.getEntries({
      content_type: 'foodRanking'
    });

    // Loop through food items and generate a static HTML file for each
    for (const item of foodItems.items) {
      const foodItem = item.fields;

      // Create a unique URL for each food item
      const foodSlug = foodItem.slug;

      // Generate HTML content for the food item
      const foodHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${foodItem.title}</title>
            <link rel="stylesheet" href="/src/css/style.css">
        </head>
        <body>
            <header>
                <h1>${foodItem.title}</h1>
            </header>
            <section>
                <img src="${foodItem.image.fields.file.url}" alt="${foodItem.title}">
                <p>${foodItem.description}</p>
            </section>
        </body>
        </html>
      `;

      // Create a file for this food item
      const filePath = path.join(__dirname, `../dist/foodranking/${foodSlug}.html`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true }); // Create directories if they don't exist
      fs.writeFileSync(filePath, foodHTML); // Write the content to the file
    }

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Food pages generated successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while generating food pages' })
    };
  }
};
