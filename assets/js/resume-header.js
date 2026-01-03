// Password for CV access
const CV_PASSWORD = 'getcvonline';

// Store the correct resume URL globally
let correctResumeUrl = '/resume/AshwanthFernando-Global.pdf';

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
  
  // Use the globally stored correct resume URL
  const baseUrl = window.location.origin;
  const fullUrl = baseUrl + correctResumeUrl;
  
  console.log(`Opening resume: ${fullUrl}`);
  
  // Open the resume
  window.open(fullUrl, '_blank');
  return true;
}

// Detect country and set the correct resume URL
async function detectCountryAndSetResume() {
  let isAustralia = false;
  let detectionMethod = 'default';

  // Method 1: Try IP-based detection first
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      console.log('IP API response:', data);
      
      if (data.country_code === 'AU' || data.country === 'Australia') {
        isAustralia = true;
        detectionMethod = 'ipapi.co';
        console.log(`Detected Australia via IP: ${data.country} (${data.country_code})`);
      } else {
        detectionMethod = 'ipapi.co';
        console.log(`IP detection shows: ${data.country} (${data.country_code}) - not Australia`);
      }
    }
  } catch (error) {
    console.log('Primary IP detection failed:', error);
    
    // Fallback: Try alternative free API
    try {
      const altResponse = await fetch('https://ip-api.com/json/');
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('Alternative IP API response:', altData);
        
        if (altData.countryCode === 'AU' || altData.country === 'Australia') {
          isAustralia = true;
          detectionMethod = 'ip-api.com';
          console.log(`Detected Australia via alternative IP API: ${altData.country}`);
        } else {
          detectionMethod = 'ip-api.com';
          console.log(`Alternative IP API shows: ${altData.country} - not Australia`);
        }
      }
    } catch (altError) {
      console.log('Alternative IP API also failed:', altError);
      
      // Method 2: Fallback to timezone detection
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone && timezone.startsWith('Australia/')) {
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
  }

  // Set the correct resume URL based on detection
  correctResumeUrl = isAustralia 
    ? '/resume/AshwanthFernando-Australia.pdf'
    : '/resume/AshwanthFernando-Global.pdf';

  console.log(`Final decision (${detectionMethod}): Serving ${isAustralia ? 'Australian' : 'Global'} resume`);
  console.log(`Resume URL set to: ${correctResumeUrl}`);

  return isAustralia;
}

// Set up password protection on all resume links
function setupPasswordProtection() {
  // Find the main resume link
  const resumeLink = document.getElementById('resume-link');
  
  if (resumeLink) {
    // Update the href to show the correct URL (for right-click copy link, etc.)
    resumeLink.setAttribute('href', correctResumeUrl);
    
    // Remove any existing click handlers by cloning
    const newLink = resumeLink.cloneNode(true);
    newLink.setAttribute('href', correctResumeUrl);
    resumeLink.parentNode.replaceChild(newLink, resumeLink);
    
    // Add password protection click handler
    newLink.addEventListener('click', handleResumeClick);
    
    console.log(`Password protection enabled for resume link: ${correctResumeUrl}`);
  }

  // Also protect any other resume links on the page
  document.querySelectorAll('a[href*="resume"]').forEach(link => {
    if (link.id !== 'resume-link' && link.href.includes('AshwanthFernando')) {
      const currentHref = link.getAttribute('href');
      
      // Clone to remove existing handlers
      const newLink = link.cloneNode(true);
      newLink.setAttribute('href', correctResumeUrl);
      link.parentNode.replaceChild(newLink, link);
      
      // Add password protection
      newLink.addEventListener('click', handleResumeClick);
      
      console.log(`Password protection enabled for additional resume link`);
    }
  });
}

// Initialize everything
async function init() {
  console.log('Initializing resume protection...');
  
  // First, detect the country and set the correct URL
  await detectCountryAndSetResume();
  
  // Then set up password protection with the correct URL
  setupPasswordProtection();
  
  console.log('Resume protection initialized successfully');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM already loaded
  init();
}
