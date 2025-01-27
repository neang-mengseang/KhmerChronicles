const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  // Example: Fetch user data from Contentful using Content Delivery API
  const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
  const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

  const url = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries?content_type=users&fields.email=${email}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    // Check user credentials (password check should be done securely)
    if (data.items.length > 0 && data.items[0].fields.password === password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Login successful', user: data.items[0].fields }),
      };
    } else {
      return { statusCode: 401, body: JSON.stringify({ message: 'Invalid credentials' }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Server error', error }) };
  }
};
