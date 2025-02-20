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
    let result = {};

    // Fetch content for each type
    const fetchPromises = contentTypes.map(async (type) => {
      const response = await fetch(`${url}?content_type=${type}&include=2`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch content for type: ${type}`);

      const data = await response.json();

      // Extract assets (images) from the response
      const assetMap = {};
      if (data.includes?.Asset) {
        data.includes.Asset.forEach(asset => {
          assetMap[asset.sys.id] = `https:${asset.fields.file.url}`;
        });
      }

      // Map the entries and resolve image URLs
      result[type] = data.items.map(item => {
        let fields = { ...item.fields };

        // Resolve image fields
        if (fields.image?.sys?.id) {
          fields.image = assetMap[fields.image.sys.id] || null;
        }

        if (fields.authorImage?.sys?.id) {
          fields.authorImage = assetMap[fields.authorImage.sys.id] || null;
        }

        return {
          sys: item.sys,
          fields,
        };
      });

      result.success = true;
    });

    await Promise.all(fetchPromises);
    console.log(result);
    console.log("==> Data Returned Successfully");
    return { statusCode: 200, body: JSON.stringify(result) };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
