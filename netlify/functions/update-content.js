const contentful = require('contentful-management');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { id, title } = JSON.parse(event.body);

  const client = contentful.createClient({
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });

  try {
    const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT);
    const entry = await environment.getEntry(id);

    entry.fields.title['en-US'] = title;
    await entry.update();
    await entry.publish();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Content updated successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update content', error }),
    };
  }
};
