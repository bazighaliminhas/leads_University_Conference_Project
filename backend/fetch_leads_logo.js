const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadLogo() {
  try {
    const res = await axios.get('https://www.leads.edu.pk/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });

    const html = res.data;
    const regex = /https:\/\/[^"'>\s]+\.(?:png|jpg|jpeg|svg|webp)/gi;
    const matches = html.match(regex) || [];
    const logos = [...new Set(matches.filter(m => /logo|llu|cropped/i.test(m)))];
    console.log('Found Logos on leads.edu.pk:', logos);

    // Target the main Lahore Leads University Logo
    const targetUrl = 'https://leads.edu.pk/wp-content/uploads/2021/02/cropped-cropped-LLU-LOGOf-1.png';
    console.log('Fetching:', targetUrl);
    
    const imgRes = await axios.get(targetUrl, { responseType: 'arraybuffer' });
    const destPath = path.join(__dirname, '../frontend/public/leads-logo.png');
    fs.writeFileSync(destPath, imgRes.data);
    console.log('✅ Updated frontend/public/leads-logo.png successfully!');
  } catch (err) {
    console.error('Error fetching logo:', err.message);
  }
}

downloadLogo();
