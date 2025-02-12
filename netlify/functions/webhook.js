const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Check if the method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const webhookData = JSON.parse(event.body);
  console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

  // Create the log entry
  const logEntry = {
    event: webhookData.sys.type, // Event type (e.g., "Entry created", "Entry updated")
    contentType: webhookData.fields?.contentType || 'Unknown', // Content type of the entry
    entryId: webhookData.sys.id, // Entry ID
    timestamp: new Date().toISOString(),
    details: webhookData.fields, // Fields that were sent
  };

  // Path to the JSON file where the logs will be stored
  const logFilePath = path.join(__dirname, '..', 'logs.json');

  try {
    // Read the existing logs
    let existingLogs = [];
    if (fs.existsSync(logFilePath)) {
      const data = fs.readFileSync(logFilePath, 'utf8');
      existingLogs = JSON.parse(data);
    }

    // Add the new log entry
    existingLogs.push(logEntry);

    // Write the updated logs back to the file
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2));

    // Respond to Contentful to acknowledge the webhook
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook received and logged' }),
    };
  } catch (err) {
    console.error('Error writing to log file:', err);
    return {
      statusCode: 500,
      body: 'Error saving log entry.',
    };
  }
};
