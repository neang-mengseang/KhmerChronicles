const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const logFilePath = path.join(__dirname, '..', 'audit_log.txt');

  try {
    // Read the log file content
    const data = fs.readFileSync(logFilePath, 'utf8');

    // Return the log file as a plain text response
    return {
      statusCode: 200,
      body: `<pre>${data}</pre>`,
      headers: {
        'Content-Type': 'text/html',
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
