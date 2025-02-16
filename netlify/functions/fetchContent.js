const fetch = require("node-fetch");

exports.handler = async (event) => {
  const spaceId = process.env.SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries`;

  try {
    const { contentType } = event.queryStringParameters;

    if (!contentType) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing content type" }) };
    }

    const contentTypes = contentType.split(",").map(type => type.trim());

    // Initialize an empty object to store the results
    let result = {};

    // Fetch content for each content type and group by the type
    const fetchPromises = contentTypes.map(async (type) => {
      const response = await fetch(`${url}?content_type=${type}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch content for type: ${type}`);

      const data = await response.json();
      result.success = true;
      // Add the content to the result object under the respective type key
      result[type] = data.items.map(item => ({
        sys: item.sys,
        fields: item.fields,
      }));
    });

    // Wait for all the fetch requests to complete
    await Promise.all(fetchPromises);

    // Return the custom JSON structure
    console.log("==> Data Returned Successfully");
    return { statusCode: 200, body: JSON.stringify(result) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
