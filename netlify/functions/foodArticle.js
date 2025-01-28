const fetch = require('node-fetch');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const spaceID = 'ntvh3j97dkce';
//const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
console.log(`Access Token: ${accessToken}`);
exports.handler = async function (event, context) {
  const { entryID } = event.queryStringParameters; // Extract entryID from query parameters

  console.log(`Fetching article with entryID: ${entryID}`); // Log the entryID

  // Construct the URL using the entryID
  const url = `https://cdn.contentful.com/spaces/${spaceID}/entries/${entryID}?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch article. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Contentful data:', data); // Log the response data

    // Check if the article exists
    if (!data.fields) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          functions: 'Yes',
          contentID: `${spaceID} Cannot be found`,
          error: 'Article not found',
        }),
      };
    }

    // Extract the article data
    const articleData = {
      title: data.fields.title,
      author: data.fields.author,
      dateCreate: data.fields.dateCreate,
      introduction: data.fields.introduction,
      content: data.fields.content,
      imageUrl: '', // Initialize imageUrl
    };

    // Fetch the image URL if an image exists
    if (data.fields.image && data.fields.image.sys) {
      const imageID = data.fields.image.sys.id;
      const imageUrl = `https://cdn.contentful.com/spaces/${spaceID}/assets/${imageID}?access_token=${accessToken}`;
      const imageResponse = await fetch(imageUrl);

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        articleData.imageUrl = `https:${imageData.fields.file.url}`; // Set the image URL
      }
    }

    // Path to the EJS template
    const templatePath = path.resolve(__dirname, '..', '..', 'src', 'views', 'food-articles.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');

    // Render the HTML with the article data
    const renderedHtml = ejs.render(template, { article: articleData });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: renderedHtml,
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Article not found' }),
    };
  }
};
