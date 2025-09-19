// Geo-based resume routing
function getGeoResume() {
  // Try to get country from timezone first (most reliable)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Australia/')) {
    return '/resume/AshwanthFernando-Australia.pdf';
  }

  // Fallback to geolocation API
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        // You would need a service to convert coords to country
        // For now, default to global
        return '/resume/AshwanthFernando-Global.pdf';
      },
      function() {
        return '/resume/AshwanthFernando-Global.pdf';
      }
    );
  }

  return '/resume/AshwanthFernando-Global.pdf';
}

// Update all resume links
function updateResumeLinks() {
  const resumeUrl = getGeoResume();
  document.querySelectorAll('a[href*="resume"], a[href*="cv"]').forEach(link => {
    if (link.href.includes('resume') || link.href.includes('cv')) {
      link.href = resumeUrl;
    }
  });
}

// Run when page loads
document.addEventListener('DOMContentLoaded', updateResumeLinks);