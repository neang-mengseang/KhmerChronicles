const axios = require("axios");

exports.handler = async function(event, context) {
  // API key for World News API zzzzz(replace with your actual key)
  const apiKey = process.env.WORLD_NEWS_TOKEN;
  const url = "https://worldnewsapi.com/api/v1/news"; // World News API endpoint

  // Get query parameters from the event (for filtering)
  const { country = "kh", category = "general", page = 1 } = event.queryStringParameters;

  try {
    // Make the request to the external API
    const response = await axios.get(url, {
      params: {
        country: country,
        category: category,
        page: page,
        apiKey: apiKey,
      },
    });
    console.log( JSON.stringify(response.data));
    // Return the fetched data as a response
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch news" }),
    };
  }
};
