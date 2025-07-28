const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  const statusCode = parseInt(event.queryStringParameters?.code || "404", 10);
  const message = event.queryStringParameters?.msg || "Page Not Found";

    const html = ejs.render(fs.readFileSync("src/views/error.ejs", "utf-8"), {
    statusCode,
    message,
    });

  return {
    statusCode,
    headers: { "Content-Type": "text/html" },
    body: html,
  };
};
