const contentful = require("contentful-management");

exports.handler = async (event) => {
  console.log("==> Function triggered");

  // Logging environment variables for debugging
  console.log("SPACE_ID:", process.env.SPACE_ID || "Not set");
  console.log("CONTENTFUL_ENVIRONMENT:", process.env.CONTENTFUL_ENVIRONMENT || "Not set");
  console.log("CONTENT_TYPE_ID:", process.env.CONTENT_TYPE_ID || "Not set");
  console.log("CONTENTFUL_ACCESS_TOKEN:", process.env.CONTENTFUL_ACCESS_TOKEN ? "Set" : "Not set");

  // Check for missing environment variables
  if (!process.env.SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN || !process.env.CONTENTFUL_ENVIRONMENT) {
    console.error("ERROR: Missing environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing environment variables" }),
    };
  }

  try {
    console.log("==> Connecting to Contentful...");
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    });

    const space = await client.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT);
    console.log("==> Connected to Contentful successfully");

    // Parse incoming request body
    console.log("==> Parsing request body...");
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log("Request body parsed successfully:", requestBody);
    } catch (parseError) {
      console.error("ERROR: Failed to parse request body", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    if (!requestBody.title || !requestBody.image || !requestBody.contentType || !requestBody.fileName) {
      console.error("ERROR: Missing required fields in request body");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Step 1: Upload image to Contentful
    console.log("==> Uploading image to Contentful...");
    const uploadedAsset = await environment.createAssetFromFiles({
      fields: {
        title: { 'en-US': requestBody.title },
        file: {
          'en-US': {
            contentType: requestBody.contentType,
            fileName: requestBody.fileName,
            file: Buffer.from(requestBody.image, "base64"),
          },
        },
      },
    });

    console.log("==> Asset created:", uploadedAsset.sys.id);

    // Step 2: Process the image
    console.log("==> Processing image...");
    await uploadedAsset.processForAllLocales();
    const processedAsset = await environment.getAsset(uploadedAsset.sys.id);

    console.log("==> Image processed:", processedAsset.sys.id);

    // Step 3: Publish the processed asset
    await processedAsset.publish();
    console.log("==> Image published successfully:", processedAsset.sys.id);

    // Step 4: Create new content entry with the uploaded image
    console.log("==> Creating entry...");
    const entry = await environment.createEntry(process.env.CONTENT_TYPE_ID, {
      fields: {
        title: { 'en-US': requestBody.title },
        description: { 'en-US': requestBody.description || "" },
        ranking: { 'en-US': parseInt(requestBody.ranking, 10) || 0 },
        image: {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: processedAsset.sys.id,
            },
          },
        },
      },
    });

    console.log("==> Entry created:", entry.sys.id);

    // Step 5: Publish the content entry
    await entry.publish();
    console.log("==> Entry published successfully:", entry.sys.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Content created successfully!", entryId: entry.sys.id }),
    };
  } catch (error) {
    console.error("ERROR: An unexpected error occurred", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
