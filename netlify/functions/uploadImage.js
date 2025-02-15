const contentful = require("contentful-management");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { imageName, imageType, imageBase64 } = JSON.parse(event.body);

    if (!imageBase64 || !imageName || !imageType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required image data" }),
      };
    }

    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_CMA_TOKEN,
    });

    const space = await client.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment("master");

    console.log("📤 Uploading image to Contentful...");

    // Convert Base64 string to Buffer
    const buffer = Buffer.from(imageBase64, "base64");

    // Create asset in Contentful
    const asset = await environment.createAssetFromFiles({
      fields: {
        title: { "en-US": imageName },
        file: {
          "en-US": {
            contentType: imageType,
            fileName: imageName,
            file: buffer, // Directly uploading image buffer
          },
        },
      },
    });

    console.log("✅ Image asset created:", asset.sys.id);

    // Process the asset for all locales
    await asset.processForAllLocales();

    // Fetch the asset again to ensure it's the latest version
    const latestAsset = await environment.getAsset(asset.sys.id);
    console.log("✅ Fetched the latest version of the asset:", latestAsset.sys.id);

    // Publish the asset to make it publicly available
    await latestAsset.publish();
    console.log("✅ Image asset published:", latestAsset.sys.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image uploaded and published successfully",
        assetId: latestAsset.sys.id,
      }),
    };
  } catch (error) {
    console.error("❌ Image upload error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to upload image" }),
    };
  }
};
