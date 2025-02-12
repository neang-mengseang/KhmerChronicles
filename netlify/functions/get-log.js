const fs = require('fs');

exports.handler = async () => {
  try {
    const logFilePath = "./data/contentful-logs.json";
    
    if (fs.existsSync(logFilePath)) {
      const logs = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
      return {
        statusCode: 200,
        body: JSON.stringify(logs),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
