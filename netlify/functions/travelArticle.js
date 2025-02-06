const fetch = require('node-fetch');
const { documentToHtmlString } = require('@contentful/rich-text-html-renderer');
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
  console.log('Event:', event); // Log the full event object for inspection

  const { path } = event;
  console.log('Incoming path:', path);

  // Extract slug from the path (after `/travel-articles/`)
  const slug = path.split('/').pop().split('?')[0]; // Handle query parameters
  console.log('Extracted slug:', slug);

  // Construct Contentful API URL for fetching articles
  const url = `https://cdn.contentful.com/spaces/${spaceID}/entries?access_token=${accessToken}&content_type=travelArticles&include=1`;

  // Define templatePath above to avoid access before initialization error
  const templatePath = 'src/views/article-template.ejs';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles. Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Find the article that matches the slug
    const articleEntry = data.items.find(item => {
      const generatedSlug = generateSlug(item.fields.title).toLowerCase();
      const targetSlug = slug.toLowerCase();
      console.log(`Comparing generatedSlug: '${generatedSlug}' with slug: '${targetSlug}'`);
      return generatedSlug === targetSlug;
    });

    if (!articleEntry) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Article not found' }),
      };
    }

    // Extract article fields and render it
    const contentHtml = documentToHtmlString(articleEntry.fields.content);
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
      const imageAsset = data.includes?.Asset?.find(asset => asset.sys.id === imageID);
      if (imageAsset && imageAsset.fields.file.url) {
        articleData.imageUrl = `https:${imageAsset.fields.file.url}`;
      }
    }

        // Extract image if available
    if (articleEntry.fields.authorImage && articleEntry.fields.authorImage.sys) {
      const authorImageID = articleEntry.fields.authorImage.sys.id;
      const authorImageAsset = data.includes?.Asset?.find(asset => asset.sys.id === authorImageID);
      if (authorImageAsset && authorImageAsset.fields.file.url) {
        articleData.authorImage = `https:${authorImageAsset.fields.file.url}`;
      }
    }

    // Read template and render it
    const template = fs.readFileSync(templatePath, 'utf-8');
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
