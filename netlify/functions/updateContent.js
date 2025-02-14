const contentful = require("contentful-management");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    console.log("🔹 Received update request:", event.body);

    const { entryId, updates } = JSON.parse(event.body);

    if (!entryId || !updates) {
      console.error("❌ Missing required fields: entryId or updates");
      return { statusCode: 400, body: "Missing required fields" };
    }

    const spaceId = process.env.SPACE_ID;
    const accessToken = process.env.CONTENTFUL_CMA_TOKEN;
    const environmentId = "master"; // Adjust if using different environments

    const client = contentful.createClient({
      accessToken: accessToken,
      debug: true,
    });

    // Fetch the space and environment
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment(environmentId);

    // Fetch the entry by entryId
    const entry = await environment.getEntry(entryId);
    console.log(`🔹 Fetched entry: ${entry.sys.id}`);


    // If an image is included, handle the asset upload
    if (updates.image) {
      console.log("🔹 Image Detected! ")
      try {
        // Create asset from file
        const uploadedAsset = await environment.createAssetFromFiles({
          fields: {
            title: {
              "en-US": updates.image.title || "Profile Picture",
            },
            file: {
              "en-US": {
                contentType: updates.image.contentType,
                fileName: updates.image.fileName,
                file: Buffer.from(updates.image.data, "base64"), // Convert to buffer
              },
            },
          },
        });

        // Process the asset and publish
        const publishedAsset = await uploadedAsset.processForAllLocales();
        const processedAsset = await environment.getAsset(publishedAsset.sys.id);
        await processedAsset.publish();
        console.log("✅ Upload Asset successfully");
        // Update the entry with the new image asset link
        entry.fields.image = {
          "en-US": {
            sys: { type: "Link", linkType: "Asset", id: processedAsset.sys.id },
          },
        };

      } catch (imageError) {
        console.error("ERROR uploading profile picture:", imageError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "Error uploading profile picture: " + imageError.message,
          }),
        };
      }
    }

    // Loop through updates and apply them to the entry fields
    Object.keys(updates).forEach((key) => {
      if (key !== "image") {  // Skip the image field since it's already handled
        entry.fields[key] = { "en-US": updates[key] };
      }
    });

        console.log("🔍 Updating entry...");
        const updatedEntry = await entry.update();
        console.log("🔍 Checking entry version before publishing:", updatedEntry.sys.version);
        console.log("✅ Entry updated successfully!", updatedEntry);
    
        if (!updatedEntry) {
            throw new Error("❌ Updated entry is undefined!");
        }
    
        console.log("🔍 Publishing entry...");
        await updatedEntry.publish();
        console.log("✅ Entry published successfully!");


    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Entry updated and published successfully" }),
    };
  } catch (error) {
    console.error("Error details:", error); // Log the entire error object
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
