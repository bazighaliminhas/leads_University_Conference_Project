const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.KAPSO_API_KEY;
const PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;

async function checkNumberDetails() {
  const url = `https://api.kapso.ai/meta/whatsapp/v24.0/${PHONE_NUMBER_ID}`;
  try {
    const res = await axios.get(url, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Phone number details:', res.data);
  } catch (err) {
    console.error('Error fetching details:', err.response?.data || err.message);
  }
}

checkNumberDetails();
