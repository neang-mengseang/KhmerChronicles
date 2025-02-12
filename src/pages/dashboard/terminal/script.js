document.addEventListener("DOMContentLoaded", async () => {
    // Fetch logs when the page is loaded
    await displayLogs();
  });
  
  // Fetch and display the logs
  async function displayLogs() {
    const logsElement = document.getElementById("sync-logs");
    try {
      const response = await fetch("/.netlify/functions/get-logs");
      const logsData = await response.json();
  
      if (response.ok && logsData.length > 0) {
        logsElement.innerHTML = "";  // Clear previous logs
        logsData.forEach(log => {
          const logElement = document.createElement("div");
          logElement.className = "log-item";
          logElement.innerHTML = `<p><strong>${log.timestamp}</strong>: ${log.message}</p>`;
          logsElement.appendChild(logElement);
        });
      } else {
        logsElement.innerHTML = "<p>No logs found.</p>";
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      logsElement.innerHTML = "<p>Failed to load logs.</p>";
    }
  }
  