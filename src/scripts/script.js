
// Dark mode toggle functionality
const themeToggleButton = document.querySelector('.theme-toggle');

themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('.header').classList.toggle('dark-mode');
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
});

// Load stored theme preference on page load
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.querySelector('.header').classList.add('dark-mode');
  }
});
