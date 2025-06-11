document.addEventListener("DOMContentLoaded", () => {
    const teamCards = document.querySelectorAll(".team-member");
    const modal = document.getElementById("teamModal");
    const closeModal = document.querySelector(".close");
    const modalName = document.getElementById("modalName");
    const modalRole = document.getElementById("modalRole");
    const modalImage = document.getElementById("modalImage");
  
    // Handle team member click
    teamCards.forEach(card => {
      card.addEventListener("click", function () {
        const teamId = this.getAttribute("data-id");
  
        // Fetch data for the clicked team member
        fetch(`/.netlify/functions/get-user?id=${teamId}`)
          .then(response => response.json())
          .then(data => {
            // Populate modal with the fetched data
            modalName.textContent = data.name;
            modalRole.textContent = data.role;
            modalImage.src = `https:${data.image}`;
            modal.style.display = "block";
          })
          .catch(error => console.error("Error fetching team data:", error));
      });
    });
  
    // Close modal
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    // Close modal if clicked outside of modal content
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  });
  