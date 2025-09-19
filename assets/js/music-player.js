// Cyberpunk Music Player
document.addEventListener('DOMContentLoaded', function() {
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const audio = document.getElementById('cyberpunk-audio');

  let isPlaying = false;
  let hasUserInteracted = false;

  // Check if user has previous preference - default to playing for fresh users
  const musicPreference = localStorage.getItem('cyberpunk-music');
  if (musicPreference === 'muted') {
    isPlaying = false;
    updateIcon(false);
  } else {
    // Default to playing for fresh users or users who had it playing
    isPlaying = true;
    updateIcon(true);
    // Set default preference for fresh users
    if (!musicPreference) {
      localStorage.setItem('cyberpunk-music', 'playing');
    }
  }

  // Handle user interaction requirement for autoplay
  function handleUserInteraction() {
    if (!hasUserInteracted) {
      hasUserInteracted = true;
      if (isPlaying && audio.paused) {
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    }
  }

  // Add event listeners for user interaction
  document.addEventListener('click', handleUserInteraction, { once: true });
  document.addEventListener('keydown', handleUserInteraction, { once: true });

  // Toggle music when button is clicked
  musicToggle.addEventListener('click', function() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      localStorage.setItem('cyberpunk-music', 'muted');
      updateIcon(false);
    } else {
      audio.play().catch(e => console.log('Audio play failed:', e));
      isPlaying = true;
      localStorage.setItem('cyberpunk-music', 'playing');
      updateIcon(true);
    }
  });

  // Update icon based on current state
  function updateIcon(playing) {
    if (playing) {
      // Music playing icon - speaker with sound waves
      musicIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      `;
    } else {
      // Music muted icon - speaker with X
      musicIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;
    }
  }

  // Handle audio events
  audio.addEventListener('canplaythrough', function() {
    if (isPlaying && hasUserInteracted) {
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  });

  audio.addEventListener('play', function() {
    isPlaying = true;
    updateIcon(true);
  });

  audio.addEventListener('pause', function() {
    isPlaying = false;
    updateIcon(false);
  });

  // Set initial volume
  audio.volume = 0.3;
});