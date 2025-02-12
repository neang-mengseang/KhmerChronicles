const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  try {
    const logFilePath = path.join(__dirname, 'logs.json'); // Ensure this path is correct
    const timestamp = new Date().toISOString();
    
    const body = JSON.parse(event.body);
    const logEntry = {
      timestamp,
      action: body.action, // e.g., "create", "edit", "delete"
      contentType: body.contentType, // e.g., "foodArticle"
      contentId: body.contentId, // Unique ID of content
      user: body.user, // Username or User ID
    };

    // Read existing logs
    let logs = [];
    if (fs.existsSync(logFilePath)) {
      const fileData = fs.readFileSync(logFilePath, 'utf-8');
      logs = JSON.parse(fileData);
    }

    // Append new log entry
    logs.push(logEntry);

    // Write updated logs back to the file
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), 'utf-8');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Log saved successfully', logEntry }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error saving log', details: error.message }),
    };
  }
};
