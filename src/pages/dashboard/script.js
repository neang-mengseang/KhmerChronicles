window.addEventListener('load', () => {
    console.log(`Script.js is loading...`);
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    // Apply the saved theme on page load
    if (savedTheme === 'dark') {
        document.body.setAttribute("data-theme", "dark");
        themeToggle.checked = true; // Reflect the saved dark theme state
    } else {
        document.body.setAttribute("data-theme", "light");
        themeToggle.checked = false; // Reflect the saved light theme state
    }

    themeToggle.addEventListener('change', toggleTheme);
});

function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const isDarkTheme = themeToggle.checked;

    // Apply the theme based on checkbox state
    if (isDarkTheme) {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem('theme', 'dark'); // Save dark theme preference
    } else {
        document.body.setAttribute("data-theme", "light");
        localStorage.setItem('theme', 'light'); // Save light theme preference
    }
}
