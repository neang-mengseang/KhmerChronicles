const contentful = require('contentful'); // Use Contentful Delivery API

exports.handler = async function (event, context) {
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    console.error('Missing Contentful space ID or access token');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Contentful space ID or access token' }),
    };
  }

  const client = contentful.createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  try {
    const { type, id } = JSON.parse(event.body); // Parse JSON request from frontend

    if (!type) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing content type in request" }),
      };
    }

    console.log(`==> Fetching from ${type}`);

    let entries;

    if (id) {
      // Fetch a single article by ID
      entries = await client.getEntry(id);
    } else {
      // Fetch all entries for a specific content type
      entries = await client.getEntries({ content_type: type });
    }

    if (!entries || (entries.items && entries.items.length === 0)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ exists: false }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        exists: true,
        articles: id
          ? {
              // Generate URL-friendly article title for dynamic URL
              urlSlug: generateUrlSlug(entries.fields.title),
              author: {
                authorId: entries.fields.authorId,
                authorImage: entries.fields.authorImage?.fields?.file?.url,
                authorName: entries.fields.authorName,
              },
              title: entries.fields.title,
              dateCreate: entries.fields.dateCreate,
              image: entries.fields.image?.fields?.file?.url,
              introduction: entries.fields.introduction,
              content: entries.fields.content,
              tags: entries.fields.tags,
            }
          : entries.items.map((entry) => ({
              // Generate URL-friendly article title for dynamic URL
              urlSlug: generateUrlSlug(entry.fields.title),
              author: {
                authorId: entry.fields.authorId,
                authorImage: entry.fields.authorImage?.fields?.file?.url,
                authorName: entry.fields.authorName,
              },
              title: entry.fields.title,
              dateCreate: entry.fields.dateCreate,
              image: entry.fields.image?.fields?.file?.url,
              introduction: entry.fields.introduction,
              content: entry.fields.content,
              tags: entry.fields.tags,
            })),
      }),
    };
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch articles" }),
    };
  }
};

// Helper function to generate URL slug from article title
function generateUrlSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove non-alphanumeric characters except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with a single hyphen
    .trim('-'); // Trim any trailing hyphens
}
