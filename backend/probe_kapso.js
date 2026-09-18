const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.KAPSO_API_KEY;
const PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID; // 597907523413541
const RECIPIENT = '923482727605';

console.log('Testing Kapso API with:');
console.log('API_KEY:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'NONE');
console.log('PHONE_NUMBER_ID:', PHONE_NUMBER_ID);

async function testEndpoints() {
  const candidateEndpoints = [
    {
      url: `https://api.kapso.ai/v1/whatsapp/messages`,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: {
        to: RECIPIENT,
        type: 'text',
        text: { body: '🎓 Testing Kapso from University Conference Portal!' }
      }
    },
    {
      url: `https://api.kapso.ai/v1/messages`,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: {
        phone_number_id: PHONE_NUMBER_ID,
        to: RECIPIENT,
        type: 'text',
        text: { body: '🎓 Testing Kapso from University Conference Portal!' }
      }
    },
    {
      url: `https://api.kapso.ai/v1/phone_numbers/${PHONE_NUMBER_ID}/messages`,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: {
        to: RECIPIENT,
        type: 'text',
        text: { body: '🎓 Testing Kapso from University Conference Portal!' }
      }
    },
    {
      url: `https://api.kapso.ai/v1/whatsapp/phone_numbers/${PHONE_NUMBER_ID}/messages`,
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: {
        messaging_product: 'whatsapp',
        to: RECIPIENT,
        type: 'text',
        text: { body: '🎓 Testing Kapso from University Conference Portal!' }
      }
    }
  ];

  for (const ep of candidateEndpoints) {
    try {
      console.log(`\nTrying: ${ep.url}`);
      const res = await axios.post(ep.url, ep.body, { headers: ep.headers, timeout: 5000 });
      console.log(`✅ SUCCESS on ${ep.url}! Status: ${res.status}`);
      console.log('Response data:', res.data);
      return ep.url;
    } catch (err) {
      console.log(`❌ Failed on ${ep.url}: Status ${err.response?.status} - ${JSON.stringify(err.response?.data || err.message)}`);
    }
  }

  // Let's also test GET on https://api.kapso.ai/v1/phone_numbers or similar
  try {
    console.log('\nTrying GET https://api.kapso.ai/v1/phone_numbers');
    const getRes = await axios.get('https://api.kapso.ai/v1/phone_numbers', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    console.log('GET phone_numbers:', getRes.data);
  } catch (e) {
    console.log('GET phone_numbers failed:', e.response?.status, e.response?.data || e.message);
  }
}

testEndpoints();
