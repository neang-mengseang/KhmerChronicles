const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Get Contentful credentials from environment variables
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT;

  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch content", error }),
    };
  }
};
