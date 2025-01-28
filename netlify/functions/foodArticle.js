const fetch = require('node-fetch');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const spaceID = 'ntvh3j97dkce';
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;


exports.handler = async function(event, context) {
  const { entryID } = event.queryStringParameters;  // Extract entryID from query parameters

  console.log(`Fetching article with entryID: ${entryID}`);  // Log the entryID

  // Construct the URL using the entryID
  const url = `https://cdn.contentful.com/spaces/${spaceID}/entries/${entryID}?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch article. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Contentful data:', data);  // Log the response data

    // Check if the article exists
    if (!data.fields) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          functions: "Yes",
          contentID: `${spaceID} Can not be found`,
          error: 'Article not found'
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
    };


    // Path to the EJS template
    const templatePath = path.resolve(__dirname, '..', '..', 'src', 'views', 'food-articles.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    
    // Render the HTML with the article data
    const renderedHtml = ejs.render(template, { article: articleData });

    return {
      statusCode: 200,
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
