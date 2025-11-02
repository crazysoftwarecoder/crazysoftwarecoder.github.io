// Update resume header link based on location
async function updateResumeHeader() {
  const resumeLink = document.getElementById('resume-link');
  if (!resumeLink) return;

  let isAustralia = false;
  let detectionMethod = 'unknown';

  // Method 1: Try timezone detection (most reliable, no API needed)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Australia/') || timezone === 'Australia/Sydney' || timezone === 'Australia/Melbourne' || timezone === 'Australia/Brisbane' || timezone === 'Australia/Perth' || timezone === 'Australia/Adelaide' || timezone === 'Australia/Darwin' || timezone === 'Australia/Hobart') {
      isAustralia = true;
      detectionMethod = 'timezone';
      console.log(`Detected Australia via timezone: ${timezone}`);
    }
  } catch (e) {
    console.log('Timezone detection failed:', e);
  }

  // Method 2: If timezone didn't detect, try IP-based detection
  if (!isAustralia) {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        console.log('IP API response:', data);
        
        if (data.country_code === 'AU' || data.country === 'Australia') {
          isAustralia = true;
          detectionMethod = 'ip-api';
          console.log(`Detected Australia via IP: ${data.country} (${data.country_code})`);
        } else {
          console.log(`IP detection shows: ${data.country} (${data.country_code})`);
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
            console.log(`Detected Australia via alternative IP API: ${altData.country}`);
          }
        }
      } catch (altError) {
        console.log('Alternative IP API also failed:', altError);
      }
    }
  }

  // Set resume URL and text based on detection
  const resumeUrl = isAustralia 
    ? '/resume/AshwanthFernando-Australia.pdf'
    : '/resume/AshwanthFernando-Global.pdf';
  
  const resumeText = isAustralia
    ? 'Download my Resume (Australia) →'
    : 'Download my Resume (Global) →';

  // Update link and text
  resumeLink.href = resumeUrl;
  resumeLink.textContent = resumeText;

  console.log(`Final decision (${detectionMethod}): ${resumeText}`);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', updateResumeHeader);

// Also run after a short delay in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateResumeHeader);
} else {
  // DOM already loaded, run immediately
  updateResumeHeader();
}
