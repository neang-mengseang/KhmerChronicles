const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    const logFilePath = path.join(__dirname, 'data', 'logs.json');

  try {
    // Read the log file content
    if (!fs.existsSync(logFilePath)) {
      return {
        statusCode: 404,
        body: 'Log file not found.',
      };
    }

    const data = fs.readFileSync(logFilePath, 'utf8');

    // Return the logs as JSON
    return {
      statusCode: 200,
      body: data,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    console.error('Error reading log file:', err);
    return {
      statusCode: 500,
      body: 'Error reading the log file.',
    };
  }
};
