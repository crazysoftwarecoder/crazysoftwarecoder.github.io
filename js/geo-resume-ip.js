// IP-based geo detection for resume routing
async function detectCountryAndSetResume() {
  try {
    // Using ipapi.co free service (1000 requests/day)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    const resumeUrl = data.country_code === 'AU'
      ? '/resume/AshwanthFernando-Australia.pdf'
      : '/resume/AshwanthFernando-Global.pdf';

    // Update all resume links
    document.querySelectorAll('a[href*="resume"], a[href*="cv"]').forEach(link => {
      if (link.href.includes('resume') || link.href.includes('cv')) {
        link.href = resumeUrl;
      }
    });

    console.log(`Detected country: ${data.country}, serving: ${resumeUrl}`);
  } catch (error) {
    console.log('Geo detection failed, using global resume');
    // Fallback to global resume
  }
}

document.addEventListener('DOMContentLoaded', detectCountryAndSetResume);