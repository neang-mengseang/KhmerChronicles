const logsElement = document.getElementById("sync-logs");

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch logs when the page is loaded
  await displayLogs();

  const sync_content_btn = document.getElementById("sync-content");
  sync_content_btn.addEventListener("click", () => {
    logsElement.innerHTML = `
    <div class="dot-spinner">
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
    </div>
`;
    // Call displayLogs() **after** 3 seconds
    setTimeout(displayLogs, 3000);
  });
});

// Fetch and display the logs
async function displayLogs() {
  try {
    const response = await fetch("/.netlify/functions/logs");
    const logsData = await response.json();

    if (response.ok && logsData.length > 0) {
      logsElement.innerHTML = ""; // Clear previous logs
      logsData.forEach((log) => {
        const logElement = document.createElement("div");
        logElement.className = "log-item";
        logElement.innerHTML = `<p><strong>[ ${log.timestamp} ] </strong> { User: ${log.id} } <i class="fa-solid fa-diamond"></i> ${log.action || "No relevant data"}</p>`;
        logsElement.appendChild(logElement);
      });
    } else {
      console.log("No log found");
      logsElement.innerHTML = `<p><span class="timestamp">[ ${new Date().toISOString()} ] : </span>No log found!.</p>`;
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    logsElement.innerHTML = `<p class="error"><span class="timestamp>[ ${new Date().toISOString()} ] : </span>Failed to load logs.</p>`;
  }
}
