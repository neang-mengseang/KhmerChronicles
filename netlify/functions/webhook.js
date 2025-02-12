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

  // Log the event (content creation or update)
  const logEntry = {
    event: webhookData.sys.type, // Event type (e.g., "Entry created", "Entry updated")
    contentType: webhookData.fields?.contentType || 'Unknown', // Content type of the entry
    entryId: webhookData.sys.id, // Entry ID
    timestamp: new Date().toISOString(),
    details: webhookData.fields, // Fields that were sent
  };

  // Format the log entry as a string
  const logString = `[${logEntry.timestamp}] Event: ${logEntry.event}, Content Type: ${logEntry.contentType}, Entry ID: ${logEntry.entryId}, Details: ${JSON.stringify(logEntry.details)}\n`;

  // Write the log entry to a file (can also store it in a database)
  const logFilePath = path.join(__dirname, '..', 'audit_log.txt');
  fs.appendFileSync(logFilePath, logString);

  // Respond to Contentful to acknowledge the webhook
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Webhook received and logged' }),
  };
};
