// Password for CV access
const CV_PASSWORD = 'getcvonline';

// Check if user has already authenticated in this session
function isAuthenticated() {
  return sessionStorage.getItem('cv_authenticated') === 'true';
}

// Prompt for password and verify
function promptPassword() {
  const password = prompt('Please enter the password to access the CV:');
  if (password === CV_PASSWORD) {
    sessionStorage.setItem('cv_authenticated', 'true');
    return true;
  } else if (password !== null) {
    alert('Incorrect password. Please try again.');
    return false;
  }
  return false;
}

// Handle resume link clicks with password protection
function handleResumeClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Check if already authenticated
  if (!isAuthenticated()) {
    if (!promptPassword()) {
      return false;
    }
  }
  
  // Get the resume URL from the clicked link
  let resumeUrl = e.currentTarget.getAttribute('href');
  
  // If href is relative, make it absolute
  if (resumeUrl && !resumeUrl.startsWith('http')) {
    const baseUrl = window.location.origin;
    resumeUrl = baseUrl + (resumeUrl.startsWith('/') ? resumeUrl : '/' + resumeUrl);
  }
  
  console.log(`Opening resume: ${resumeUrl}`);
  
  // Allow the download
  window.open(resumeUrl, '_blank');
  return true;
}

// Set up password protection for resume links
function setupResumePasswordProtection() {
  // Find all resume links
  const allResumeLinks = document.querySelectorAll('a[href*="resume"], a[href*="cv"], a[id="resume-link"]');
  
  allResumeLinks.forEach(link => {
    // Check if it's a resume link
    const hrefAttr = link.getAttribute('href');
    if (hrefAttr && (hrefAttr.includes('AshwanthFernando') || hrefAttr.includes('resume') || link.id === 'resume-link')) {
      // Store the href attribute (relative URL) before cloning
      const currentHref = hrefAttr;
      
      console.log(`Setting up protection for link with href: ${currentHref}`);
      
      // Remove existing listeners by cloning the node
      const newLink = link.cloneNode(true);
      // Ensure the href attribute is preserved (use setAttribute to keep relative URL)
      newLink.setAttribute('href', currentHref);
      link.parentNode.replaceChild(newLink, link);
      
      // Add click handler for password protection
      newLink.addEventListener('click', handleResumeClick, true);
      
      console.log(`Protected resume link: ${newLink.getAttribute('href')}`);
    }
  });
}

// Update resume header link based on location
async function updateResumeHeader() {
  const resumeLink = document.getElementById('resume-link');
  if (!resumeLink) return;

  let isAustralia = false;
  let detectionMethod = 'unknown';
  let ipDetected = false;

  // Method 1: Try IP-based detection first (works with VPN, more accurate for actual location)
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      console.log('IP API response:', data);
      
      if (data.country_code === 'AU' || data.country === 'Australia') {
        isAustralia = true;
        detectionMethod = 'ip-api';
        ipDetected = true;
        console.log(`Detected Australia via IP: ${data.country} (${data.country_code})`);
      } else {
        isAustralia = false;
        detectionMethod = 'ip-api';
        ipDetected = true;
        console.log(`IP detection shows: ${data.country} (${data.country_code}) - not Australia`);
      }
    }
  } catch (error) {
    console.log('IP-based geo detection failed:', error);
    
    // Fallback: Try alternative free API
    try {
      const altResponse = await fetch('https://ip-api.com/json/');
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Alternative IP API response:', altData);
        
        if (altData.countryCode === 'AU' || altData.country === 'Australia') {
          isAustralia = true;
          detectionMethod = 'ip-api-alt';
          ipDetected = true;
          console.log(`Detected Australia via alternative IP API: ${altData.country}`);
        } else {
          isAustralia = false;
          detectionMethod = 'ip-api-alt';
          ipDetected = true;
          console.log(`Alternative IP API shows: ${altData.country} - not Australia`);
        }
      }
    } catch (altError) {
      console.log('Alternative IP API also failed:', altError);
    }
  }

  // Method 2: If IP detection failed, fallback to timezone detection
  if (!ipDetected) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('Australia/') || timezone === 'Australia/Sydney' || timezone === 'Australia/Melbourne' || timezone === 'Australia/Brisbane' || timezone === 'Australia/Perth' || timezone === 'Australia/Adelaide' || timezone === 'Australia/Darwin' || timezone === 'Australia/Hobart') {
        isAustralia = true;
        detectionMethod = 'timezone';
        console.log(`Fallback: Detected Australia via timezone: ${timezone}`);
      } else {
        console.log(`Fallback: Timezone shows ${timezone} - not Australia`);
      }
    } catch (e) {
      console.log('Timezone detection failed:', e);
    }
  }

  // Set resume URL based on detection
  const resumeUrl = isAustralia 
    ? '/resume/AshwanthFernando-Australia.pdf'
    : '/resume/AshwanthFernando-Global.pdf';
  
  // Update main header link
  if (resumeLink) {
    resumeLink.href = resumeUrl;
    console.log(`Updated resume link to: ${resumeUrl} (Australia: ${isAustralia})`);
  }

  // Update any other resume links on the page
  document.querySelectorAll('a[href*="resume"], a[href*="cv"]').forEach(link => {
    if (link.href.includes('AshwanthFernando') || link.href.includes('resume') || link.id === 'resume-link') {
      link.href = resumeUrl;
      console.log(`Updated additional resume link to: ${resumeUrl}`);
    }
  });

  // Set up password protection after URL is updated
  // Use a longer delay to ensure DOM updates are complete
  setTimeout(() => {
    setupResumePasswordProtection();
  }, 300);

  console.log(`Final decision (${detectionMethod}): Serving ${isAustralia ? 'Australian' : 'Global'} resume - URL: ${resumeUrl}`);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait for geo-detection to complete before setting up protection
  updateResumeHeader().then(() => {
    // Protection will be set up inside updateResumeHeader after URL is set
  }).catch(() => {
    // If geo-detection fails, still set up protection with default URL
    setTimeout(() => {
      setupResumePasswordProtection();
    }, 500);
  });
});

// Also run after a short delay in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateResumeHeader().then(() => {
      // Protection will be set up inside updateResumeHeader
    }).catch(() => {
      setTimeout(() => {
        setupResumePasswordProtection();
      }, 500);
    });
  });
} else {
  // DOM already loaded, run immediately
  updateResumeHeader().then(() => {
    // Protection will be set up inside updateResumeHeader
  }).catch(() => {
    setTimeout(() => {
      setupResumePasswordProtection();
    }, 500);
  });
}
