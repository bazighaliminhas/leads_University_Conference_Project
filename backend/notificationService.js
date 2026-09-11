const axios = require('axios');
const nodemailer = require('nodemailer');
let twilioClient = null;

try {
  const twilio = require('twilio');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  // Twilio optional
}

// In-Memory Notification Audit Log (Accessible by Admin Dashboard)
const notificationHistory = [];

const DEFAULT_ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || '+923482727605';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bazighminhas1@gmail.com';

/**
 * Sends WhatsApp message to Admin using Kapso (with Twilio fallback & graceful logging)
 */
async function sendAdminWhatsApp(messageText, metadata = {}) {
  const rawTarget = DEFAULT_ADMIN_WHATSAPP;
  // Clean phone number: remove '+' and spaces for Kapso/standard international format
  const cleanPhone = rawTarget.replace(/[^0-9]/g, '');
  const formattedTwilioTo = rawTarget.startsWith('whatsapp:') ? rawTarget : `whatsapp:${rawTarget.startsWith('+') ? rawTarget : '+' + cleanPhone}`;

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  let status = 'logged_locally';
  let providerUsed = 'kapso_emulator';
  let errorDetail = null;

  // 1. Try Kapso WhatsApp Cloud API (Primary requested engine)
  const kapsoApiKey = process.env.KAPSO_API_KEY;
  const kapsoPhoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID;
  const kapsoEndpoint = `https://api.kapso.ai/meta/whatsapp/v24.0/${kapsoPhoneNumberId}/messages`;

  if (kapsoApiKey && kapsoPhoneNumberId) {
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

      // If 24-hour customer window is closed, send template message
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
        console.error('⚠️ [KAPSO TEMPLATE FAILED TOO]:', tErr.response?.data || tErr.message);
        errorDetail = tErr.response?.data || tErr.message;
        status = 'failed_kapso_attempt';
      }
    }
  }

  // 2. Twilio WhatsApp Fallback if Kapso didn't send & Twilio is configured
  if (status !== 'delivered_kapso' && twilioClient && process.env.TWILIO_WHATSAPP_NUMBER) {
    try {
      providerUsed = 'twilio';
      const twilioRes = await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER, // e.g. 'whatsapp:+14155238886'
        to: formattedTwilioTo,
        body: messageText
      });
      status = 'delivered_twilio';
      console.log(`✅ [TWILIO WHATSAPP DELIVERED] SID: ${twilioRes.sid} to ${formattedTwilioTo}`);
    } catch (twilioErr) {
      console.error('⚠️ [TWILIO WHATSAPP ERROR]:', twilioErr.message);
      errorDetail = twilioErr.message;
      status = 'failed_twilio_attempt';
    }
  }

  // High-visibility terminal output (Simulated live feed for terminal monitoring)
  console.log('\n' + '='.repeat(65));
  console.log(`📱 [WHATSAPP DISPATCH via ${providerUsed.toUpperCase()}]`);
  console.log(`To Admin Phone: ${rawTarget}`);
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
  // Keep only last 100 entries
  if (notificationHistory.length > 100) notificationHistory.pop();

  return logEntry;
}

/**
 * Sends Email to Admin using Nodemailer
 */
async function sendAdminEmail(subject, htmlBody, textBody, metadata = {}) {
  const adminEmail = DEFAULT_ADMIN_EMAIL;
  let status = 'logged_locally';
  let errorDetail = null;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
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
        from: `"Conference Portal" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: subject,
        text: textBody,
        html: htmlBody
      });
      status = 'delivered_email';
      console.log(`✅ [EMAIL DELIVERED] Sent to ${adminEmail} | Subject: ${subject}`);
    } catch (err) {
      console.error('⚠️ [EMAIL ERROR]:', err.message);
      errorDetail = err.message;
      status = 'failed_email_attempt';
    }
  } else {
    console.log(`📧 [EMAIL NOTIFICATION SIMULATED] To: ${adminEmail} | Subject: ${subject}`);
  }

  const logEntry = {
    id: 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    channel: 'email',
    provider: 'nodemailer',
    recipient: adminEmail,
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

  const emailSubject = `🎓 New Research Paper Submitted: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">🎓 New Academic Article Submission</h2>
      <p>Hello Admin,</p>
      <p>A university student has submitted a new research paper for academic peer review and evaluation.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Student Name:</td><td style="padding: 8px; color: #0f172a;">${studentName}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Student Email:</td><td style="padding: 8px; color: #0f172a;">${studentEmail}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Paper Title:</td><td style="padding: 8px; color: #0f172a;">${articleTitle}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Category:</td><td style="padding: 8px; color: #0f172a;">${category}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Challan TID:</td><td style="padding: 8px; color: #0f172a;"><code>${tid}</code></td></tr>
        <tr><td style="padding: 8px; font-weight: bold; color: #475569;">Bank & Phone:</td><td style="padding: 8px; color: #0f172a;">${bank} (${mobile})</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="http://localhost:5173/admin/articles" style="background: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
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

  const emailSubject = `💰 Publication Fee Paid: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #10b981; margin-top: 0;">💰 Publication Fee Submitted</h2>
      <p>Student <strong>${studentName}</strong> has paid the publication fee for:</p>
      <p><strong>Title:</strong> ${articleTitle}</p>
      <p><strong>Transaction TID:</strong> ${tid} (${bank})</p>
      <p>Please review the payment proof and publish the article.</p>
      <p><a href="http://localhost:5173/admin/articles" style="background: #10b981; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify & Publish Article</a></p>
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

  const emailSubject = `🎤 Conference Presentation Fee Paid: "${articleTitle}" by ${studentName}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #8b5cf6; margin-top: 0;">🎤 Conference Presentation Fee Paid</h2>
      <p>Student <strong>${studentName}</strong> has paid the conference stage presentation fee for:</p>
      <p><strong>Title:</strong> ${articleTitle}</p>
      <p><strong>Presenters:</strong> ${presenters}</p>
      <p><strong>Transaction TID:</strong> ${tid} (${bank})</p>
      <p><a href="http://localhost:5173/admin/conference" style="background: #8b5cf6; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Conference Schedule</a></p>
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

module.exports = {
  DEFAULT_ADMIN_WHATSAPP,
  DEFAULT_ADMIN_EMAIL,
  notificationHistory,
  sendAdminWhatsApp,
  sendAdminEmail,
  notifyNewArticleSubmission,
  notifyArticleResubmitted,
  notifyPublicationFeePaid,
  notifyPresentationFeePaid,
  notifyConferencePublished,
  notifyArticlePublished
};
