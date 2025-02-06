const fetch = require('node-fetch');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer'); // Import rich text renderer
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const spaceID = process.env.SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

// Function to generate slug
function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // Remove special characters
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');       // Remove leading & trailing hyphens
}

exports.handler = async function(event, context) {
  const { slug } = event.queryStringParameters;
  console.log(`Fetching article with slug: ${slug}`);

  // Construct Contentful API URL for fetching articles
  const url = `https://cdn.contentful.com/spaces/${spaceID}/entries?access_token=${accessToken}&content_type=travelArticles&include=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the article that matches the slug
    const articleEntry = data.items.find(item => {
      const generatedSlug = generateSlug(item.fields.title);
      console.log(`Comparing: `);
      console.log(`${generatedSlug}`);
      console.log(`${slug}`);
      return generatedSlug === slug;
    });

    if (!articleEntry) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Article not found' }),
      };
    }


    const contentHtml = documentToHtmlString(articleEntry.fields.content);
    // Extract article fields
    const articleData = {
      title: articleEntry.fields.title,
      authorId: articleEntry.fields.authorId || 'Unknown Author',
      authorName: articleEntry.fields.authorName || 'Unknown Author',
      authorImage: "/src/assets/img/user.svg",
      dateCreate: articleEntry.fields.dateCreate || 'Unknown Date',
      introduction: articleEntry.fields.introduction || 'No introduction available.',
      content: contentHtml,
      imageUrl: null,  // Default to null
    };

    // Extract image if available
    if (articleEntry.fields.image && articleEntry.fields.image.sys) {
      const imageID = articleEntry.fields.image.sys.id;

      // Look for the image asset in `includes.Asset`
      const imageAsset = data.includes?.Asset?.find(asset => asset.sys.id === imageID);
      if (imageAsset && imageAsset.fields.file.url) {
        articleData.imageUrl = `https:${imageAsset.fields.file.url}`;
      }
    }

    if (articleEntry.fields.authorImage && articleEntry.fields.authorImage.sys) {
      const authorImgId = articleEntry.fields.authorImage.sys.id;

      // Look for the image asset in `includes.Asset`
      const authorImgAsset = data.includes?.Asset?.find(asset => asset.sys.id === authorImgId);
      if (authorImgAsset && authorImgAsset.fields.file.url) {
        articleData.authorImage = `https:${authorImgAsset.fields.file.url}`;
      }
    }
    

    // Path to the EJS template
    const templatePath = path.resolve(__dirname, '..', '..', 'src', 'views', 'article-template.ejs');
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
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
