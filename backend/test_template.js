const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.KAPSO_API_KEY;
const PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;
const RECIPIENT = '923482727605';

async function sendTemplate() {
  console.log('Sending hello_world template to:', RECIPIENT);
  const url = `https://api.kapso.ai/meta/whatsapp/v24.0/${PHONE_NUMBER_ID}/messages`;

  const templatePayload = {
    messaging_product: 'whatsapp',
    to: RECIPIENT,
    type: 'template',
    template: {
      name: 'hello_world',
      language: { code: 'en_US' }
    }
  };

  try {
    const res = await axios.post(url, templatePayload, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Template API response:', res.status, res.data);
  } catch (err) {
    console.error('❌ Template Error:', err.response?.data || err.message);
  }
}

sendTemplate();
