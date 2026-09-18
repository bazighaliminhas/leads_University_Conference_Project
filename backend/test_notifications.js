const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || '+923482727605';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bazighminhas1@gmail.com';
const KAPSO_API_KEY = process.env.KAPSO_API_KEY;
const KAPSO_PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;

console.log('='.repeat(60));
console.log('🧪 LIVE NOTIFICATION TESTER');
console.log('='.repeat(60));
console.log('Admin WhatsApp:', ADMIN_WHATSAPP);
console.log('Admin Email:', ADMIN_EMAIL);
console.log('Kapso Phone Number ID:', KAPSO_PHONE_NUMBER_ID);
console.log('Kapso API Key:', KAPSO_API_KEY ? KAPSO_API_KEY.slice(0, 8) + '...' : 'MISSING');
console.log('SMTP User:', process.env.SMTP_USER);
console.log('='.repeat(60));

async function testEmail() {
  console.log('\n📧 [1/2] Testing Email Notification...');
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️ SMTP_USER or SMTP_PASS not found in .env');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Conference Portal" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🎓 [TEST] University Conference Portal Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4f46e5; border-radius: 10px;">
          <h2 style="color: #4f46e5;">🎓 Test Notification Successful!</h2>
          <p>This is a live test notification from your <strong>Lahore Leads University Conference Portal</strong>.</p>
          <hr/>
          <p><strong>Student:</strong> Demo Student (student@leads.edu.pk)</p>
          <p><strong>Action:</strong> New Article Submission & Payment Verification</p>
          <p><strong>Status:</strong> Active & Ready</p>
        </div>
      `,
      text: 'Test Notification from University Conference Portal.'
    });

    console.log('✅ Email Delivered Successfully!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Email Error:', err.message);
  }
}

async function testKapsoWhatsApp() {
  console.log('\n📱 [2/2] Testing Kapso WhatsApp Notification...');
  if (!KAPSO_API_KEY || !KAPSO_PHONE_NUMBER_ID) {
    console.log('⚠️ KAPSO_API_KEY or KAPSO_PHONE_NUMBER_ID is missing in .env');
    return;
  }

  const cleanPhone = ADMIN_WHATSAPP.replace(/[^0-9]/g, '');
  const url = `https://api.kapso.ai/meta/whatsapp/v24.0/${KAPSO_PHONE_NUMBER_ID}/messages`;

  // 1. Try sending plain text message
  try {
    console.log(`Sending text to ${cleanPhone} via ${url}...`);
    const payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'text',
      text: {
        body: '🎓 *[TEST] Lahore Leads University Portal*\n\nYour WhatsApp notifications are successfully configured and active!'
      }
    };

    const res = await axios.post(url, payload, {
      headers: {
        'X-API-Key': KAPSO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Kapso WhatsApp Text Delivered Successfully!');
    console.log('Status:', res.status);
    console.log('Response:', res.data);
    return;
  } catch (err) {
    console.warn('⚠️ Plain text send error:', err.response?.data || err.message);
  }

  // 2. Fallback to official template message
  try {
    console.log('Trying template message (hello_world)...');
    const templatePayload = {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: 'hello_world',
        language: { code: 'en_US' }
      }
    };

    const tRes = await axios.post(url, templatePayload, {
      headers: {
        'X-API-Key': KAPSO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Kapso WhatsApp Template Delivered Successfully!');
    console.log('Status:', tRes.status);
    console.log('Response:', tRes.data);
  } catch (tErr) {
    console.error('❌ Kapso Template Error:', tErr.response?.data || tErr.message);
  }
}

async function runTests() {
  await testEmail();
  await testKapsoWhatsApp();
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Tests Completed');
  console.log('='.repeat(60));
}

runTests();
