const contentful = require("contentful-management");

exports.handler = async (event) => {
  console.log("==> Function triggered");

  if (!process.env.SPACE_ID || !process.env.CONTENTFUL_ACCESS_TOKEN || !process.env.CONTENTFUL_ENVIRONMENT) {
    console.error("ERROR: Missing environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing environment variables" }),
    };
  }

  try {
    const client = contentful.createClient({
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    });

    const space = await client.getSpace(process.env.SPACE_ID);
    const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT);
    
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    if (!requestBody.contentType || !requestBody.fields) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields (contentType, fields)" }),
      };
    }

    const contentType = requestBody.contentType;
    const fields = requestBody.fields;

    let processedAsset;
    if (fields.image) {
      console.log("==> Uploading image to Contentful...");
      const uploadedAsset = await environment.createAssetFromFiles({
        fields: {
          title: { "en-US": fields.image.title },
          file: {
            "en-US": {
              contentType: fields.image.contentType,
              fileName: fields.image.fileName,
              file: Buffer.from(fields.image.data, "base64"),
            },
          },
        },
      });

      await uploadedAsset.processForAllLocales();
      processedAsset = await environment.getAsset(uploadedAsset.sys.id);
      await processedAsset.publish();
    }

    // Create a new content entry
    console.log(`==> Creating entry for content type: ${contentType}`);
    const entryData = {
      fields: {},
    };

    Object.keys(fields).forEach((key) => {
      if (key === "image") {
        entryData.fields[key] = {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: processedAsset ? processedAsset.sys.id : null,
            },
          },
        };
      } else {
        entryData.fields[key] = { "en-US": fields[key] };
      }
    });

    const entry = await environment.createEntry(contentType, entryData);
    await entry.publish();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Content created successfully!", entryId: entry.sys.id }),
    };
  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
