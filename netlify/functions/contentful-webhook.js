const fs = require('fs');

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    if (!data || !data.sys) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid webhook data' }),
      };
    }

    // Check if the content type is "FoodArticle"
    const contentType = data.sys.contentType.sys.id;
    const entryId = data.sys.id;

    if (contentType === 'foodArticle') {
      const action = data.sys.type === 'EntryCreate' ? 'created' : 'updated';
      const logMessage = `Food Article with ID: ${entryId} was ${action} on ${new Date().toISOString()}`;

      // Log the content update
      await logContentUpdate(logMessage);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Webhook processed successfully' }),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Non-Food Article content, skipping' }),
      };
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};

// Function to log content update (you can store logs in a file or a database)
async function logContentUpdate(message) {
  const logFilePath = "./data/contentful-logs.json";
  
  let logs = [];
  if (fs.existsSync(logFilePath)) {
    const logsFile = fs.readFileSync(logFilePath, 'utf-8');
    logs = JSON.parse(logsFile);
  }

  // Append the new log entry
  logs.push({ timestamp: new Date().toISOString(), message });

  // Save the updated logs
  fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
}
