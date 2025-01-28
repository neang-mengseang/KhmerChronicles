const menu = document.querySelector('.hamburger-menu');

function toggleMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('show');
    // Add event listener to close menu when clicking outside
    document.addEventListener('click', closeMenuOutside);

    menu.classList.toggle('change');
}

function closeMenuOutside(event) {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger-menu');

    // Check if the click is outside the nav and hamburger menu
    if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
        nav.classList.remove('show'); // Close the menu
        document.removeEventListener('click', closeMenuOutside); // Remove event listener after closing
        menu.classList.toggle('change');
    }
}




document.addEventListener("DOMContentLoaded", function () {
    var acc = document.querySelectorAll(".accordion-btn");
  
    acc.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = this.nextElementSibling;
        this.classList.toggle('change');
        // Close all panels except the clicked one
        document.querySelectorAll('.accordion-panel').forEach(function (item) {
          if (item !== panel) {
            item.style.maxHeight = null;
            item.classList.remove("active");
          }
        });
  
        // Toggle the clicked panel
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null; // Close
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px"; // Open with dynamic height
        }
        
        // Toggle active class for styling
        panel.classList.toggle("show");
      });
    });
  });
  