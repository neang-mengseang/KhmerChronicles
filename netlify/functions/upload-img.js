
const Busboy = require('busboy');
const contentful = require('contentful-management');

exports.handler = async (event) => {
  return new Promise((resolve, reject) => {
    const bb = new Busboy({ headers: event.headers });
    let file;
    let fileName;
    let contentType;

    bb.on('file', (fieldname, stream, filename, encoding, mimetype) => {
      console.log(`File [${filename}] found.`);
      fileName = filename;
      contentType = mimetype;
      file = stream;
    });

    bb.on('finish', async () => {
      if (!file) {
        return resolve({
          statusCode: 400,
          body: JSON.stringify({ error: "No file uploaded" }),
        });
      }

      try {
        const client = contentful.createClient({
          accessToken: process.env.CONTENTFUL_CMA_TOKEN,
        });

        const space = await client.getSpace(process.env.SPACE_ID);
        const environment = await space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT || "master");

        const asset = await environment.createAsset({
          fields: {
            title: { "en-US": fileName },
            file: {
              "en-US": {
                contentType: contentType,
                fileName: fileName,
                file: file,
              },
            },
          },
        });

        const processedAsset = await asset.processForAllLocales();
        const publishedAsset = await processedAsset.publish();

        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true, assetId: publishedAsset.sys.id, assetUrl: publishedAsset.fields.file["en-US"].url }),
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        if (error.response) {
          console.error("Contentful API Error Details:", error.response.data);
        }
        resolve({
          statusCode: 500,
          body: JSON.stringify({ success: false, message: error.message }),
        });
      }
    });

    bb.on('error', (err) => {
      console.error("Busboy error:", err);
      reject({
        statusCode: 500,
        body: JSON.stringify({ success: false, message: err.message }),
      });
    });

    event.isBase64Encoded ? bb.end(Buffer.from(event.body, 'base64')) : bb.end(event.body);
  });
};