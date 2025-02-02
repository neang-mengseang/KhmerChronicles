const contentful = require("contentful-management");
const cma_token = process.env.CONTENTFUL_CMA_TOKEN;
const spaceId = process.env.SPACE_ID;

exports.handler = async (event) => {
  console.log("==> Function triggered");

  try {
    if (!spaceId || !cma_token) {
      console.error("ERROR: Missing environment variables");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing environment variables" }),
      };
    }

    const client = contentful.createClient({
      accessToken: cma_token,
    });

    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment("master");

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
      console.log("Requested Body Detected");
    } catch (parseError) {
      console.error("ERROR parsing request body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request body" }),
      };
    }

    let entry;
    try {
      entry = await environment.getEntry(requestBody.entry_id);
      console.log(`Entry Detected: ${JSON.stringify(entry.fields)}`);
    } catch (error) {
      console.error("Error getting entry:", error);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Profile not found" }),
      };
    }

    // ✅ Update only allowed fields: username, bio, profilePic
    if (requestBody.fields.username) {
      entry.fields.username = { "en-US": requestBody.fields.username };
    }
    if (requestBody.fields.bio) {
      entry.fields.bio = { "en-US": requestBody.fields.bio };
    }

    let processedAsset;
    if (requestBody.fields.image) {
      try {
        console.log("==> Uploading/Updating profile picture...");

        const uploadedAsset = await environment.createAssetFromFiles({
          fields: {
            title: { "en-US": requestBody.fields.image.title || "Profile Picture" },
            file: {
              "en-US": {
                contentType: requestBody.fields.image.contentType,
                fileName: requestBody.fields.image.fileName,
                file: Buffer.from(requestBody.fields.image.data, "base64"),
              },
            },
          },
        });

        const publishedAsset = await uploadedAsset.processForAllLocales();
        processedAsset = await environment.getAsset(publishedAsset.sys.id);
        await processedAsset.publish();

        entry.fields.userImage = {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: processedAsset.sys.id,
            },
          },
        };
      } catch (imageError) {
        console.error("ERROR uploading profile picture:", imageError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Error uploading profile picture: " + imageError.message }),
        };
      }
    }

    const updatedEntry = await entry.update();
    await updatedEntry.publish();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Profile updated successfully!", entry, success: true }),
    };
  } catch (error) {
    console.error("ERROR in update-profile function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || error.toString() }),
    };
  }
};
