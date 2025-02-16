const fetch = require("node-fetch");

const spaceId = process.env.SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
exports.handler = async function (event) {
  try {
    const assetId = event.queryStringParameters.assetId;
    if (!assetId) {
      return { statusCode: 400, body: JSON.stringify({ message: "Asset ID is required" }) };
    }

    const url = `https://cdn.contentful.com/spaces/${spaceId}/assets/${assetId}?access_token=${accessToken}`;
    const response = await fetch(url);
    const assetData = await response.json();

    if (!assetData.fields || !assetData.fields.file || !assetData.fields.file.url) {
      return { statusCode: 404, body: JSON.stringify({ message: "Asset not found" }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: `https:${assetData.fields.file.url}` }),
    };
  } catch (error) {
    console.error("Error fetching asset:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error fetching asset" }),
    };
  }
};
