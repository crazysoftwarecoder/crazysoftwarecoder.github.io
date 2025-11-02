// Dark Mode Toggle - Apply theme immediately before DOM loads to prevent flash
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Get current theme from localStorage or default to light
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (themeToggle && themeIcon) {
    updateIcon(currentTheme);
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateIcon(newTheme);
    });
  }
  
  // Update icon based on current theme
  function updateIcon(theme) {
    if (!themeIcon) return;
    
    if (theme === 'dark') {
      // Show sun icon (light mode icon) when in dark mode
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zm9 9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2zM4 12a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm9-9a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1zM4 5.27l.71.71a1 1 0 0 0 1.41-1.41l-.71-.71a1 1 0 0 0-1.41 1.41zm15.98 2.44a1 1 0 0 0-1.41 0l-.71.71a1 1 0 0 0 1.41 1.41l.71-.71a1 1 0 0 0 0-1.41zM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
        </svg>
      `;
    } else {
      // Show moon icon (dark mode icon) when in light mode
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12.79 21a9 9 0 1 1 8.21-14 1 1 0 0 1-1.35 1.29 7 7 0 1 0 .24 9.49 1 1 0 1 1 1.35 1.29c-2.09 1.37-4.59 1.93-7.05 1.93z"/>
        </svg>
      `;
    }
  }
});

