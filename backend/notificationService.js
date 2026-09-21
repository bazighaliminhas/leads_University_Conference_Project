const axios = require('axios');
const nodemailer = require('nodemailer');
let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  } catch (e) {
    // Twilio optional
  }
  return twilioClient;
}

// In-Memory Notification Audit Log (Accessible by Admin Dashboard)
const notificationHistory = [];

const DEFAULT_ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || '+923482727605';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bazighminhas1@gmail.com';

/**
 * Sends WhatsApp message (to custom recipient or Admin default) using Kapso / Twilio
 */
async function sendWhatsAppDirect(recipientPhone, messageText, metadata = {}) {
  const rawTarget = recipientPhone || DEFAULT_ADMIN_WHATSAPP;
  // Clean phone number: remove '+' and spaces for Kapso/standard international format
  const cleanPhone = rawTarget.replace(/[^0-9]/g, '');
  const formattedTwilioTo = rawTarget.startsWith('whatsapp:') ? rawTarget : `whatsapp:${rawTarget.startsWith('+') ? rawTarget : '+' + cleanPhone}`;

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  let status = 'logged_locally';
  let providerUsed = 'kapso_emulator';
  let errorDetail = null;

  // 1. Try Kapso WhatsApp Cloud API
  const kapsoApiKey = process.env.KAPSO_API_KEY;
  const kapsoPhoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
  const kapsoEndpoint = `https://api.kapso.ai/meta/whatsapp/v24.0/${kapsoPhoneNumberId}/messages`;

  if (kapsoApiKey && kapsoPhoneNumberId && cleanPhone) {
    try {
      providerUsed = 'kapso';
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: messageText }
      };

      const response = await axios.post(kapsoEndpoint, payload, {
        headers: {
          'X-API-Key': kapsoApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      status = 'delivered_kapso';
      console.log(`✅ [KAPSO WHATSAPP DELIVERED] Status: ${response.status} to ${cleanPhone}`);
    } catch (kapsoErr) {
      console.error('⚠️ [KAPSO WHATSAPP TEXT SEND FAILED]:', kapsoErr.response?.data || kapsoErr.message);

      // Template fallback
      try {
        const templatePayload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: 'hello_world',
            language: { code: 'en_US' }
          }
        };

        const tRes = await axios.post(kapsoEndpoint, templatePayload, {
          headers: {
            'X-API-Key': kapsoApiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        status = 'delivered_kapso_template';
        console.log(`✅ [KAPSO WHATSAPP TEMPLATE DELIVERED] Status: ${tRes.status} to ${cleanPhone}`);
      } catch (tErr) {
        errorDetail = tErr.response?.data || tErr.message;
        status = 'failed_kapso_attempt';
      }
    }
  }

  // 2. Twilio WhatsApp Fallback
  const activeTwilio = getTwilioClient();
  if (status !== 'delivered_kapso' && activeTwilio && process.env.TWILIO_WHATSAPP_NUMBER && cleanPhone) {
    try {
      providerUsed = 'twilio';
      const twilioRes = await activeTwilio.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: formattedTwilioTo,
        body: messageText
      });
      status = 'delivered_twilio';
      console.log(`✅ [TWILIO WHATSAPP DELIVERED] SID: ${twilioRes.sid} to ${formattedTwilioTo}`);
    } catch (twilioErr) {
      errorDetail = twilioErr.message;
      status = 'failed_twilio_attempt';
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log(`📱 [WHATSAPP DISPATCH via ${providerUsed.toUpperCase()}]`);
  console.log(`To: ${rawTarget}`);
  console.log(`Time: ${timestamp}`);
  console.log(`Status: ${status.toUpperCase()}`);
  console.log('-'.repeat(65));
  console.log(messageText);
  console.log('='.repeat(65) + '\n');

  const logEntry = {
    id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    channel: 'whatsapp',
    provider: providerUsed,
    recipient: rawTarget,
    title: metadata.title || 'WhatsApp Notification',
    content: messageText,
    metadata,
    status,
    error: errorDetail,
    timestamp: new Date().toISOString()
  };

  notificationHistory.unshift(logEntry);
  if (notificationHistory.length > 100) notificationHistory.pop();

  return logEntry;
}

/**
 * Sends WhatsApp message to Admin using Kapso (with Twilio fallback & graceful logging)
 */
async function sendAdminWhatsApp(messageText, metadata = {}) {
  return sendWhatsAppDirect(DEFAULT_ADMIN_WHATSAPP, messageText, metadata);
}

/**
 * Sends Email to custom recipient or Admin using Nodemailer
 */
async function sendEmailDirect(recipientEmail, subject, htmlBody, textBody, metadata = {}) {
  const targetEmail = recipientEmail || DEFAULT_ADMIN_EMAIL;
  let status = 'logged_locally';
  let errorDetail = null;

  if (process.env.SMTP_USER && process.env.SMTP_PASS && targetEmail) {
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

      await transporter.sendMail({
        from: `"Conference Portal - ORIC" <${process.env.SMTP_USER}>`,
        to: targetEmail,
        subject: subject,
        text: textBody,
        html: htmlBody
      });
      status = 'delivered_email';
      console.log(`✅ [EMAIL DELIVERED] Sent to ${targetEmail} | Subject: ${subject}`);
    } catch (err) {
      console.error('⚠️ [EMAIL ERROR]:', err.message);
      errorDetail = err.message;
      status = 'failed_email_attempt';
    }
  } else {
    console.log(`📧 [EMAIL NOTIFICATION SIMULATED] To: ${targetEmail} | Subject: ${subject}`);
  }

  const logEntry = {
    id: 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    channel: 'email',
    provider: 'nodemailer',
    recipient: targetEmail,
    title: subject,
    content: textBody,
    html: htmlBody,
    metadata,
    status,
    error: errorDetail,
    timestamp: new Date().toISOString()
  };

  notificationHistory.unshift(logEntry);
  if (notificationHistory.length > 100) notificationHistory.pop();

  return logEntry;
}

/**
 * Sends Email to Admin using Nodemailer
 */
async function sendAdminEmail(subject, htmlBody, textBody, metadata = {}) {
  return sendEmailDirect(DEFAULT_ADMIN_EMAIL, subject, htmlBody, textBody, metadata);
}

// -------------------------------------------------------------
// Specialized Academic Event Dispatchers
// -------------------------------------------------------------

/**
 * Event 1: Student submits a new research paper
 */
async function notifyNewArticleSubmission({ student, article, senderBank, transactionId, senderMobile }) {
  const studentName = student?.full_name || article?.student_name || 'Student Author';
  const studentEmail = student?.email || 'student@univ.edu';
  const articleTitle = article?.title || 'Untitled Research Paper';
  const category = article?.category || 'General Science & Tech';
  const tid = transactionId || article?.transaction_id || 'TID-' + Math.floor(100000 + Math.random() * 900000);
  const bank = senderBank || article?.sender_bank || 'Mobile Banking';
  const mobile = senderMobile || article?.sender_mobile || '03xx-xxxxxxx';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`🎓 *NEW ARTICLE SUBMISSION (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${studentName} (${studentEmail})
📄 *Title:* ${articleTitle}
🏷️ *Category:* ${category}
💳 *Challan TID:* ${tid}
🏦 *Payment Bank:* ${bank}
📱 *Sender Phone:* ${mobile}
📅 *Submission Date:* ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *Action Required by Admin:*
A new student has submitted their research paper with initial submission fee verification proof. 
Please review the paper abstract, evaluate plagiarism score, and allocate an academic award tier (Platinum, Gold, or Silver).

👉 *Admin Dashboard:* http://localhost:5173/admin/articles`;

  const emailSubject = `🎓 [Lahore Leads University] New Article Submission: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0 0 6px 0; font-weight: 700; letter-spacing: 0.5px;">LAHORE LEADS UNIVERSITY</h1>
        <p style="color: #93C5FD; font-size: 13px; margin: 0; font-weight: 500;">Office of Research, Innovation & Commercialization (ORIC)</p>
        <div style="display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; padding: 4px 14px; border-radius: 20px; margin-top: 14px;">
          <span style="color: #FCD34D; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🎓 New Manuscript Submitted</span>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Dear <strong>Editorial Board & System Admin</strong>,
        </p>
        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          A student researcher has submitted a new research paper along with initial fee verification proof for peer review evaluation.
        </p>

        <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; margin: 20px 0;">
          <div style="background-color: #f1f5f9; padding: 10px 16px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Student & Article Metadata</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600; width: 35%;">Author Name</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${studentName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Author Email</td>
              <td style="padding: 10px 16px; color: #2563eb;"><a href="mailto:${studentEmail}" style="color: #2563eb; text-decoration: none;">${studentEmail}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Paper Title</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${articleTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Academic Field</td>
              <td style="padding: 10px 16px; color: #0f172a;"><span style="background: #EEF2FF; color: #4338CA; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${category}</span></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Challan TID</td>
              <td style="padding: 10px 16px; color: #0f172a;"><code style="background: #FEF3C7; color: #92400E; padding: 3px 6px; border-radius: 4px; font-weight: 700; font-family: monospace;">${tid}</code></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Payment Gateway</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${bank}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Sender Mobile</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${mobile}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Submission Date</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${date}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="http://localhost:5173/admin/articles" style="background-color: #0A192F; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(10, 25, 47, 0.3);">
            Review Paper in Admin Dashboard →
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 16px; color: #94a3b8; font-size: 11px;">
        Lahore Leads University Conference & Research Portal • Automated Notification
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'submission', articleId: article?.id, studentName }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'submission', articleId: article?.id })
  ]);
}

/**
 * Event 2: Student resubmits a corrected/revised article
 */
async function notifyArticleResubmitted({ student, article }) {
  const studentName = student?.full_name || article?.student_name || 'Student Author';
  const studentEmail = student?.email || 'student@univ.edu';
  const articleTitle = article?.title || 'Research Paper';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`🔄 *REVISED ARTICLE RESUBMITTED (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${studentName} (${studentEmail})
📄 *Title:* ${articleTitle}
📅 *Resubmission Date:* ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *Context:*
The student has updated their research draft and corrected the remarks previously provided. 
Please re-evaluate the full text and proceed to tier classification.

👉 *Review Resubmission:* http://localhost:5173/admin/articles`;

  const emailSubject = `🔄 Revised Paper Resubmitted: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0284c7; margin-top: 0;">🔄 Revised Article Resubmitted</h2>
      <p>Student <strong>${studentName}</strong> has revised their paper according to your previous feedback:</p>
      <p><strong>Title:</strong> ${articleTitle}</p>
      <p><a href="http://localhost:5173/admin/articles" style="background: #0284c7; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Updated Paper</a></p>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'revision', articleId: article?.id, studentName }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'revision', articleId: article?.id })
  ]);
}

/**
 * Event 3: Student pays Publication Fee
 */
async function notifyPublicationFeePaid({ student, article, senderBank, transactionId, senderMobile }) {
  const studentName = student?.full_name || article?.student_name || 'Student Author';
  const studentEmail = student?.email || 'student@univ.edu';
  const articleTitle = article?.title || 'Research Paper';
  const tid = transactionId || article?.transaction_id || 'TID-' + Math.floor(100000 + Math.random() * 900000);
  const bank = senderBank || article?.sender_bank || 'Online Banking';
  const mobile = senderMobile || article?.sender_mobile || '03xx-xxxxxxx';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`💰 *PUBLICATION FEE PAID (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${studentName} (${studentEmail})
📄 *Title:* ${articleTitle}
🏷️ *Award Tier:* ${article?.tier || 'Approved'}
💳 *Challan TID:* ${tid}
🏦 *Bank:* ${bank}
📱 *Sender Phone:* ${mobile}
📅 *Payment Date:* ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Action Required by Admin:*
The student has submitted the official publication fee receipt proof. 
Please inspect the receipt in the Admin Dashboard and click **Publish Live** to make the research paper visible to the public gallery and venture capital investors.

👉 *Verify & Publish:* http://localhost:5173/admin/articles`;

  const emailSubject = `💰 [Lahore Leads University] Publication Fee Paid: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #065F46 0%, #047857 100%); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0 0 6px 0; font-weight: 700; letter-spacing: 0.5px;">LAHORE LEADS UNIVERSITY</h1>
        <p style="color: #A7F3D0; font-size: 13px; margin: 0; font-weight: 500;">Research Publication & Journal Editorial Board</p>
        <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid #34D399; padding: 4px 14px; border-radius: 20px; margin-top: 14px;">
          <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">💰 Publication Fee Verification Required</span>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Dear <strong>Editorial Board & System Admin</strong>,
        </p>
        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          Student researcher <strong>${studentName}</strong> has submitted official publication fee payment proof. Please verify the transaction slip and activate the paper live.
        </p>

        <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600; width: 35%;">Author Name</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${studentName} (${studentEmail})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Paper Title</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${articleTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Award Tier</td>
              <td style="padding: 10px 16px; color: #059669; font-weight: 700;">${article?.tier || 'Approved'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Challan TID</td>
              <td style="padding: 10px 16px; color: #0f172a;"><code style="background: #D1FAE5; color: #065F46; padding: 3px 6px; border-radius: 4px; font-weight: 700; font-family: monospace;">${tid}</code></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Payment Bank</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${bank}</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Payment Date</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${date}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="http://localhost:5173/admin/articles" style="background-color: #047857; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
            Verify Slip & Publish Live →
          </a>
        </div>
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'publication_fee', articleId: article?.id, studentName }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'publication_fee', articleId: article?.id })
  ]);
}

/**
 * Event 4: Student pays Conference Presentation Fee
 */
async function notifyPresentationFeePaid({ student, article, presentingList, senderBank, transactionId, senderMobile }) {
  const studentName = student?.full_name || article?.student_name || 'Student Author';
  const studentEmail = student?.email || 'student@univ.edu';
  const articleTitle = article?.title || 'Research Paper';
  const presenters = presentingList || article?.presenting_students_list || studentName;
  const tid = transactionId || article?.transaction_id || 'TID-' + Math.floor(100000 + Math.random() * 900000);
  const bank = senderBank || article?.sender_bank || 'Online Banking';
  const mobile = senderMobile || article?.sender_mobile || '03xx-xxxxxxx';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`🎤 *CONFERENCE PRESENTATION FEE PAID (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Primary Author:* ${studentName} (${studentEmail})
📄 *Research Paper:* ${articleTitle}
👥 *Presenting Student Team:* ${presenters}
💳 *Challan TID:* ${tid}
🏦 *Bank:* ${bank}
📱 *Sender Phone:* ${mobile}
📅 *Date:* ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *Action Required by Admin:*
The student has paid their conference presentation slot fee. 
Their pitch presentation is now scheduled for the live summit where venture capital investors can evaluate and fund their project!

👉 *View Conference Schedule:* http://localhost:5173/admin/conference`;

  const emailSubject = `🎤 [Lahore Leads University] Conference Presentation Fee Paid: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background-color: #f8fafc; padding: 24px; border-radius: 16px;">
      <div style="background: linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%); padding: 32px 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0 0 6px 0; font-weight: 700; letter-spacing: 0.5px;">LAHORE LEADS UNIVERSITY</h1>
        <p style="color: #DDD6FE; font-size: 13px; margin: 0; font-weight: 500;">Annual Innovation Conference & Venture Summit</p>
        <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid #A78BFA; padding: 4px 14px; border-radius: 20px; margin-top: 14px;">
          <span style="color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🎤 Presentation Slot Scheduled</span>
        </div>
      </div>
      
      <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 0;">
          Dear <strong>Conference Organizing Committee & Admin</strong>,
        </p>
        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          Student author <strong>${studentName}</strong> has paid their conference stage pitch presentation fee.
        </p>

        <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600; width: 35%;">Lead Presenter</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${studentName} (${studentEmail})</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Paper Title</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${articleTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Team / Co-Authors</td>
              <td style="padding: 10px 16px; color: #6D28D9; font-weight: 600;">${presenters}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Challan TID</td>
              <td style="padding: 10px 16px; color: #0f172a;"><code style="background: #EDE9FE; color: #5B21B6; padding: 3px 6px; border-radius: 4px; font-weight: 700; font-family: monospace;">${tid}</code></td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Bank / Mobile</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${bank} (${mobile})</td>
            </tr>
            <tr>
              <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">Date</td>
              <td style="padding: 10px 16px; color: #0f172a; font-weight: 500;">${date}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="http://localhost:5173/admin/conference" style="background-color: #6D28D9; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
            Manage Conference Schedule →
          </a>
        </div>
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'presentation_fee', articleId: article?.id, studentName }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'presentation_fee', articleId: article?.id })
  ]);
}

/**
 * Event 5: Conference Created, Updated, or Published
 */
async function notifyConferencePublished({ conference, adminUser }) {
  const confTitle = conference?.title || 'National Innovation & Research Conference';
  const confDesc = conference?.description || 'Academic research presentation & investor venture summit.';
  const eventDate = conference?.event_date || 'Upcoming';
  const eventTime = conference?.event_time || '10:00 AM - 04:00 PM';
  const venue = conference?.venue || 'University Main Auditorium & Virtual Stream';
  const streamLink = conference?.stream_link || 'Virtual Link Attached';
  const status = conference?.status || 'Upcoming Summit';
  const onsitePrice = conference?.onsite_ticket_price !== undefined ? conference.onsite_ticket_price : '500.00';
  const onlinePrice = conference?.online_ticket_price !== undefined ? conference.online_ticket_price : '200.00';
  const presentingStudents = conference?.presenting_students || 'Selected Top Student Authors';
  const attendingInvestors = conference?.attending_investors || 'Registered Venture Capitalists & Angels';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`🏛️ *CONFERENCE PUBLISHED / UPDATED (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 *Title:* ${confTitle}
📅 *Event Date:* ${eventDate} (${eventTime})
📍 *Venue:* ${venue}
🎥 *HD Stream:* ${streamLink}
📊 *Status:* ${status}
🎟️ *Tickets:* Onsite PKR ${onsitePrice} | Online PKR ${onlinePrice}
━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Presenting Student Teams:*
${presentingStudents}
━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 *Attending Investors & VCs:*
${attendingInvestors}
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Summary:*
The conference schedule, ticket availability, presenting lineup, and attending investor portfolio have been officially published live on the university portal!

👉 *Live Portal:* http://localhost:5173/gallery
👉 *Admin Schedule:* http://localhost:5173/admin/conference`;

  const emailSubject = `🏛️ Conference Published / Updated: "${confTitle}" (${eventDate})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #2563eb; margin-top: 0;">🏛️ Conference Published & Live</h2>
      <p>Hello Admin,</p>
      <p>The academic and business conference has been successfully created/updated and published live on the portal:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569; width: 35%;">Conference Title:</td><td style="padding: 10px; color: #0f172a; font-weight: 600;">${confTitle}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Event Schedule:</td><td style="padding: 10px; color: #0f172a;">${eventDate} | ${eventTime}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Physical Venue:</td><td style="padding: 10px; color: #0f172a;">${venue}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Virtual Stream Link:</td><td style="padding: 10px; color: #2563eb;"><a href="${streamLink}">${streamLink}</a></td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Status:</td><td style="padding: 10px; color: #059669; font-weight: bold;">${status}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Ticket Pricing:</td><td style="padding: 10px; color: #0f172a;">Onsite: PKR ${onsitePrice} | Online HD Stream: PKR ${onlinePrice}</td></tr>
        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px; font-weight: bold; color: #475569;">Presenters:</td><td style="padding: 10px; color: #0f172a;">${presentingStudents}</td></tr>
        <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Attending Investors:</td><td style="padding: 10px; color: #0f172a;">${attendingInvestors}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:5173/admin/conference" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Manage in Admin Dashboard</a>
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'conference_published', conferenceId: conference?.id, title: confTitle }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'conference_published', conferenceId: conference?.id })
  ]);
}

/**
 * Event 6: Admin Publishes Article to Main Portal
 */
async function notifyArticlePublished({ article, adminUser }) {
  const studentName = article?.student_name || 'Student Author';
  const articleTitle = article?.title || 'Research Paper';
  const tier = article?.tier || 'Platinum';
  const date = new Date().toLocaleDateString('en-GB');

  const whatsappMessage = 
`🌟 *ARTICLE PUBLISHED LIVE (KAPSO NOTIFICATION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Author:* ${studentName}
📄 *Title:* ${articleTitle}
🏆 *Award Tier:* ${tier}
📅 *Published Date:* ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 *Status:*
The research article has been officially verified and published live to the public showcase & gallery! Venture investors can now review and pledge funding.

👉 *View in Public Gallery:* http://localhost:5173/gallery`;

  const emailSubject = `🌟 Research Paper Published Live: "${articleTitle}" (${tier} Tier)`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #059669; margin-top: 0;">🌟 Research Article Published Live</h2>
      <p>Hello Admin,</p>
      <p>The research article has been verified and published live to the university conference portal:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Author:</td><td style="padding: 8px; color: #0f172a;">${studentName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Title:</td><td style="padding: 8px; color: #0f172a;">${articleTitle}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Tier:</td><td style="padding: 8px; color: #059669; font-weight: bold;">${tier}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:5173/gallery" style="background: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Public Gallery</a>
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'article_published', articleId: article?.id, studentName }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'article_published', articleId: article?.id })
  ]);
}

/**
 * Event 7: Attendee Books Conference Ticket Pass (Pending Verification)
 */
async function notifyTicketBooked({ ticket, conference, attendeeName, attendeeEmail, senderBank, transactionId, senderMobile }) {
  const confTitle = conference?.title || ticket?.conference_title || 'Annual Research Summit 2026';
  const name = attendeeName || ticket?.user_name || 'Conference Attendee';
  const email = attendeeEmail || ticket?.user_email || 'student@leads.edu.pk';
  const mobile = senderMobile || ticket?.sender_mobile || '0348-2727605';
  const passType = (ticket?.ticket_type || 'onsite').toUpperCase();
  const amount = ticket?.amount_paid || (passType.includes('ONSITE') ? 50 : 20);
  const ticketCode = ticket?.ticket_code || `PASS-LLU-2026-${Date.now().toString().slice(-5)}`;
  const bank = senderBank || ticket?.sender_bank || 'HBL Mobile App';
  const trx = transactionId || ticket?.transaction_id || 'TRX-CONF-PASS';
  const date = new Date().toLocaleDateString('en-GB');
  const time = new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' });

  const whatsappMessage = 
`🎟️ *NEW CONFERENCE PASS BOOKED — VERIFICATION REQUIRED*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student / Delegate:* ${name}
📧 *Email:* ${email}
📱 *Mobile:* ${mobile}
🏛️ *Conference:* ${confTitle}
🎫 *Pass Category:* ${passType === 'ONSITE' ? '🏛️ Onsite Auditorium Pass' : '🎥 Virtual Live Stream Pass'}
💰 *Fee Deposited:* PKR ${amount}
🏦 *Payment Channel:* ${bank}
🔢 *Transaction ID:* ${trx}
🏷️ *Booking Ref Code:* ${ticketCode}
📅 *Submitted At:* ${date} (${time})
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 *Action Required:*
Please log in to Admin Portal (*/admin/tickets*) to verify the uploaded payment slip and allocate the *Seat Number* (for Onsite) or *Live Stream Link* (for Virtual).`;

  const emailSubject = `🎟️ Conference Pass Booking Request: ${name} (${passType} Pass — PKR ${amount})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
      <div style="background: #0A192F; padding: 18px 24px; border-radius: 12px; text-align: center; color: white;">
        <h2 style="color: #FBBF24; margin: 0; font-size: 20px; letter-spacing: 0.5px;">LAHORE LEADS UNIVERSITY</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #94A3B8;">ORIC Directorate • Conference Pass Registration</p>
      </div>

      <div style="padding: 20px 0;">
        <h3 style="color: #d97706; margin-top: 0; font-size: 18px;">🎟️ New Conference Pass Awaiting Payment Verification</h3>
        <p style="color: #334155; font-size: 14px;">Hello Admin,</p>
        <p style="color: #334155; font-size: 14px;">A student / delegate has submitted their conference pass booking fee proof. Please verify the transaction details below:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr><td style="padding: 10px; font-weight: bold; color: #475569; width: 35%;">Delegate Name:</td><td style="padding: 10px; color: #0f172a; font-weight: bold;">${name}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Email Address:</td><td style="padding: 10px; color: #0f172a;">${email}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Mobile Number:</td><td style="padding: 10px; color: #0f172a;">${mobile}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Conference:</td><td style="padding: 10px; color: #0f172a; font-weight: bold;">${confTitle}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Pass Category:</td><td style="padding: 10px; color: #d97706; font-weight: bold;">${passType} Pass</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Amount Paid:</td><td style="padding: 10px; color: #059669; font-weight: bold; font-size: 15px;">PKR ${amount}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Bank / Method:</td><td style="padding: 10px; color: #0f172a;">${bank}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Transaction TID:</td><td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0f172a;">${trx}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Booking Ref Code:</td><td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0284c7;">${ticketCode}</td></tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:5173/admin/tickets" style="background: #0A192F; color: #FBBF24; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px; border: 1px solid #FBBF24;">
            Inspect Slip & Allocate Seat / Stream Link in Admin Portal →
          </a>
        </div>
      </div>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'ticket_booked', ticketCode, attendeeName: name, passType, amount }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'ticket_booked', ticketCode, attendeeName: name })
  ]);
}

/**
 * Event 8: Admin Verifies Pass & Allocates Seat / Stream Link (Sent to Student & Logged)
 */
async function notifyTicketVerifiedAndIssued({ ticket, conference, attendeeName, attendeeEmail, attendeeMobile, seatNumber, streamLink, venue, eventDate, eventTime }) {
  const confTitle = conference?.title || ticket?.conference_title || 'Annual Research Summit 2026';
  const name = attendeeName || ticket?.user_name || 'Conference Delegate';
  const email = attendeeEmail || ticket?.user_email || 'student@leads.edu.pk';
  const mobile = attendeeMobile || ticket?.sender_mobile || DEFAULT_ADMIN_WHATSAPP;
  const passType = (ticket?.ticket_type || 'onsite').toUpperCase();
  const ticketCode = ticket?.ticket_code || 'PASS-LLU-2026';
  const isOnsite = (ticket?.ticket_type || 'onsite').toLowerCase() === 'onsite';
  const allocatedSeat = seatNumber || ticket?.seat_number || 'Auditorium Main Hall';
  const liveLink = streamLink || ticket?.stream_link || 'https://meet.google.com/leads-conf-2026';
  const dateStr = eventDate || conference?.event_date || '2026-09-15';
  const timeStr = eventTime || conference?.event_time || '10:00 AM - 04:00 PM';
  const venueStr = venue || conference?.venue || 'Lahore Leads University Main Campus Grand Auditorium';

  const whatsappMessage = 
`🎉 *OFFICIAL CONFERENCE PASS APPROVED & ISSUED*
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ *Event:* ${confTitle}
👤 *Delegate Name:* ${name}
🎫 *Pass Category:* ${isOnsite ? '🏛️ Onsite Auditorium Delegate Pass' : '🎥 Virtual HD Live Stream Pass'}
🔢 *Official Pass Code:* ${ticketCode}
📅 *Event Date:* ${dateStr}
⏰ *Event Timings:* ${timeStr}
${isOnsite ? `💺 *Allocated Seat:* ${allocatedSeat}\n📍 *Venue:* ${venueStr}` : `🎥 *Live Stream Access Link:*\n${liveLink}`}
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Verification Status:* Payment Verified & Seat/Link Allocated
💡 *Access Note:* Please login to your Student Dashboard to view and print your entrance pass badge with QR code!`;

  const emailSubject = `🎉 Official Conference Pass Verified & Issued: ${confTitle} (${ticketCode})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
      <div style="background: #0A192F; padding: 20px; border-radius: 12px; text-align: center; color: white;">
        <h2 style="color: #FBBF24; margin: 0; font-size: 20px; letter-spacing: 0.5px;">LAHORE LEADS UNIVERSITY</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #94A3B8;">ORIC Directorate • Official Conference Entrance Pass</p>
      </div>

      <div style="padding: 20px 0;">
        <h3 style="color: #059669; margin-top: 0; font-size: 18px;">🎉 Your Conference Pass is Verified & Activated!</h3>
        <p style="color: #334155; font-size: 14px;">Dear <strong>${name}</strong>,</p>
        <p style="color: #334155; font-size: 14px;">Congratulations! Your payment slip has been verified by the conference administration. Your pass and access details are ready:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <tr><td style="padding: 10px; font-weight: bold; color: #475569; width: 35%;">Conference:</td><td style="padding: 10px; color: #0f172a; font-weight: bold;">${confTitle}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Pass Category:</td><td style="padding: 10px; color: #d97706; font-weight: bold;">${passType} Pass</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">E-Pass Code:</td><td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0284c7;">${ticketCode}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Event Date:</td><td style="padding: 10px; color: #0f172a; font-weight: bold;">${dateStr}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Event Timings:</td><td style="padding: 10px; color: #0f172a;">${timeStr}</td></tr>
          ${isOnsite ? `
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Allocated Seat:</td><td style="padding: 10px; color: #059669; font-weight: bold; font-size: 15px;">${allocatedSeat}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Venue:</td><td style="padding: 10px; color: #0f172a;">${venueStr}</td></tr>
          ` : `
          <tr><td style="padding: 10px; font-weight: bold; color: #475569;">Live Stream Access:</td><td style="padding: 10px; font-weight: bold;"><a href="${liveLink}" target="_blank" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${liveLink}</a></td></tr>
          `}
        </table>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: 10px; color: #065f46; font-size: 13px; margin: 16px 0;">
          🎟️ <strong>Digital Entrance Badge:</strong> You can print your official delegate pass with QR code directly from your student portal.
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <a href="http://localhost:5173/student" style="background: #059669; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px;">
            Open Student Portal to View & Print Pass →
          </a>
        </div>
      </div>
    </div>
  `;

  // Dispatch to Student and also notify admin audit log
  await Promise.allSettled([
    sendWhatsAppDirect(mobile, whatsappMessage, { type: 'ticket_verified', ticketCode, attendeeName: name, seatNumber: allocatedSeat, streamLink: liveLink }),
    sendEmailDirect(email, emailSubject, emailHtml, whatsappMessage, { type: 'ticket_verified', ticketCode, attendeeName: name })
  ]);
}

async function notifyReaderAccessRequested(data) {
  const { reader, article, senderBank, transactionId, senderMobile, amount = 500 } = data;
  const readerName = reader?.full_name || reader?.name || 'Student Researcher';
  const readerEmail = reader?.email || 'reader@leads.edu.pk';
  const articleTitle = article?.title || 'Academic Research Article';

  const whatsappMessage = `*Lahore Leads University — ORIC Directorate*\n\n` +
    `📖 *NEW RESEARCH PAPER READER ACCESS REQUEST*\n` +
    `----------------------------------------\n` +
    `👤 *Reader:* ${readerName} (${readerEmail})\n` +
    `📄 *Article Title:* "${articleTitle}"\n` +
    `💰 *Access Fee Deposited:* PKR ${amount}\n` +
    `🏦 *Payment Channel:* ${senderBank || 'HBL Mobile App'}\n` +
    `🔢 *TRX TID:* ${transactionId || 'N/A'}\n` +
    `📱 *Mobile Number:* ${senderMobile || '0348-2727605'}\n` +
    `📅 *Timestamp:* ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n\n` +
    `👉 *Action Required:* Please login to Admin Portal (/admin/articles) to inspect the payment slip and unlock paper reading permission for this user.`;

  const emailSubject = `📖 Research Paper Reader Access Request: ${readerName} (PKR ${amount})`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0A192F; margin-top: 0;">📖 Research Paper Access Request</h2>
      <p>Hello Admin,</p>
      <p>A student/reader has paid the reader access fee and requested full paper unlock permission:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Reader:</td><td style="padding: 8px; color: #0f172a;">${readerName} (${readerEmail})</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Article:</td><td style="padding: 8px; color: #0f172a;">${articleTitle}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Amount:</td><td style="padding: 8px; color: #059669; font-weight: bold;">PKR ${amount}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Payment Method:</td><td style="padding: 8px; color: #0f172a;">${senderBank || 'HBL Mobile App'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">TRX ID:</td><td style="padding: 8px; font-mono; font-weight: bold;">${transactionId || 'N/A'}</td></tr>
      </table>
      <p style="color: #64748b; font-size: 12px;">Please log in to your Admin Dashboard to verify the attached deposit slip and approve access.</p>
    </div>
  `;

  await Promise.allSettled([
    sendAdminWhatsApp(whatsappMessage, { type: 'reader_access_request', readerName, articleTitle }),
    sendAdminEmail(emailSubject, emailHtml, whatsappMessage, { type: 'reader_access_request', readerName })
  ]);
}

module.exports = {
  DEFAULT_ADMIN_WHATSAPP,
  DEFAULT_ADMIN_EMAIL,
  notificationHistory,
  sendWhatsAppDirect,
  sendAdminWhatsApp,
  sendEmailDirect,
  sendAdminEmail,
  notifyNewArticleSubmission,
  notifyArticleResubmitted,
  notifyPublicationFeePaid,
  notifyPresentationFeePaid,
  notifyConferencePublished,
  notifyArticlePublished,
  notifyTicketBooked,
  notifyTicketVerifiedAndIssued,
  notifyReaderAccessRequested
};
