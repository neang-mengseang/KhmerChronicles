document.querySelectorAll(".delete_btn").forEach((button) => {
    button.addEventListener("click", async function () {
        console.log("Delete Button Clicked");
        const entryId = this.getAttribute("data-id");
        const row = this.closest("tr"); // Get the row to remove after deletion

        if (!entryId) return;

        // Disable button and show loading state
        this.disabled = true;
        this.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting...`;

        try {
            const response = await fetch("/.netlify/functions/deleteContent", {
                method: "DELETE",
                body: JSON.stringify({ entryId }),
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();
            if (response.ok) {
                this.innerHTML = `<i class="fa-regular fa-trash-can"></i> Deleted`;
                this.style.background = "#ccc"; // Optional: Gray out button

                // ✅ Remove the deleted row from UI
                setTimeout(() => {
                    row.remove();
                }, 500);
            } else {
                throw new Error(data.error || "Failed to delete content.");
            }
        } catch (error) {
            console.error(error);
            this.innerHTML = `<i class="fa-regular fa-trash-can"></i> Delete`;
            this.disabled = false;

            // ✅ Show a toast message instead of an alert
            showToast("Error: " + error.message, "error");
        }
    });
});

// ✅ Function to show a toast message (replace with your own UI notification system)
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
