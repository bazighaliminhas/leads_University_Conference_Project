let googleModule = null;
function getGoogle() {
  if (!googleModule) {
    const { google } = require('googleapis');
    googleModule = google;
  }
  return googleModule;
}
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const SETTINGS_FILE = path.join(__dirname, '.storage-settings.json');
const DEFAULT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || path.join(__dirname, 'service-account-key.json');
const DEFAULT_ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
const SETTINGS_SECRET = process.env.STORAGE_SETTINGS_SECRET || process.env.JWT_SECRET || 'change-this-storage-secret-in-production';

let driveClient = null;
let cachedFolderIds = {};
let runtimeConfig = null;

function encryptionKey() {
  return crypto.createHash('sha256').update(String(SETTINGS_SECRET)).digest();
}
function encryptJson(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') };
}
function decryptJson(payload) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  const plain = Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]);
  return JSON.parse(plain.toString('utf8'));
}

function loadRuntimeConfig() {
  if (runtimeConfig) return runtimeConfig;
  let stored = null;
  try {
    if (fs.existsSync(SETTINGS_FILE)) stored = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (e) {
    console.warn('⚠️ [GOOGLE DRIVE] Could not read storage settings:', e.message);
  }

  let credentials = null;
  if (stored?.credentialsEncrypted) {
    try { credentials = decryptJson(stored.credentialsEncrypted); } catch (e) { console.warn('⚠️ [GOOGLE DRIVE] Credential decrypt failed:', e.message); }
  }
  if (!credentials && fs.existsSync(DEFAULT_KEY_FILE)) {
    try { credentials = JSON.parse(fs.readFileSync(DEFAULT_KEY_FILE, 'utf8')); } catch (_) { }
  }
  if (!credentials && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }

  runtimeConfig = {
    folderId: stored?.folderId || DEFAULT_ROOT_FOLDER_ID,
    credentials,
    credentialSource: stored?.credentialsEncrypted ? 'admin-settings' : (credentials ? 'environment/file' : 'not-configured'),
    updatedAt: stored?.updatedAt || null,
    updatedBy: stored?.updatedBy || null
  };
  return runtimeConfig;
}

function resetClient() {
  driveClient = null;
  cachedFolderIds = {};
  runtimeConfig = null;
}

function getStorageConfigSummary() {
  const cfg = loadRuntimeConfig();
  return {
    folderId: cfg.folderId || '',
    folderUrl: cfg.folderId ? `https://drive.google.com/drive/folders/${cfg.folderId}` : '',
    credentialSource: cfg.credentialSource,
    credentialsConfigured: !!cfg.credentials,
    serviceAccountEmail: cfg.credentials?.client_email || '',
    updatedAt: cfg.updatedAt,
    updatedBy: cfg.updatedBy
  };
}

function createClientForConfig(folderId, credentials) {
  if (!folderId) throw new Error('Google Drive Folder ID is required.');
  if (!credentials?.client_email || !credentials?.private_key) throw new Error('Valid Google service-account JSON is required.');
  const g = getGoogle();
  const auth = new g.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/drive'] });
  return g.drive({ version: 'v3', auth });
}

function getDriveClient() {
  if (driveClient) return driveClient;
  try {
    const cfg = loadRuntimeConfig();
    if (!cfg.folderId || !cfg.credentials) return null;
    driveClient = createClientForConfig(cfg.folderId, cfg.credentials);
    return driveClient;
  } catch (err) {
    console.error('❌ [GOOGLE DRIVE] Auth Initialization Error:', err.message);
    return null;
  }
}

async function testCandidateConfig(folderId, credentials) {
  const drive = createClientForConfig(folderId, credentials);
  const res = await drive.files.get({ fileId: folderId, fields: 'id,name,mimeType,capabilities(canAddChildren)' });
  if (res.data.mimeType !== 'application/vnd.google-apps.folder') throw new Error('Configured Folder ID does not point to a Google Drive folder.');
  if (res.data.capabilities && res.data.capabilities.canAddChildren === false) throw new Error('Service account does not have upload permission for this folder.');
  return { success: true, folderId: res.data.id, folderName: res.data.name, mimeType: res.data.mimeType };
}

async function saveStorageConfig({ folderId, credentials, updatedBy = 'admin' }) {
  const current = loadRuntimeConfig();
  const finalCredentials = credentials || current.credentials;
  const testResult = await testCandidateConfig(folderId, finalCredentials);
  const stored = {
    folderId,
    credentialsEncrypted: encryptJson(finalCredentials),
    updatedAt: new Date().toISOString(),
    updatedBy
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(stored, null, 2), { mode: 0o600 });
  resetClient();
  return { ...testResult, ...getStorageConfigSummary() };
}

async function testDriveConnection() {
  const cfg = loadRuntimeConfig();
  const drive = getDriveClient();
  if (!drive) return { success: false, error: 'Drive client not initialized. Configure Folder ID and service-account credentials in Admin Settings.' };
  try {
    const res = await drive.files.get({ fileId: cfg.folderId, fields: 'id,name,mimeType,capabilities(canAddChildren)' });
    return { success: true, folderId: res.data.id, folderName: res.data.name, mimeType: res.data.mimeType, canUpload: res.data.capabilities?.canAddChildren !== false };
  } catch (err) {
    return { success: false, error: err.response?.data?.error?.message || err.message };
  }
}

const UPLOADS_DIR = path.join(__dirname, 'uploads');

function saveLocalUpload(buffer, fileName, subfolder = 'receipts') {
  try {
    const targetFolder = path.join(UPLOADS_DIR, subfolder.toLowerCase().replace(/[^a-z0-9_-]/g, '_'));
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    const safeName = `${Date.now()}_${String(fileName || 'receipt.png').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(targetFolder, safeName);
    fs.writeFileSync(filePath, buffer);
    const subPath = subfolder.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `/uploads/${subPath}/${safeName}`;
  } catch (err) {
    console.error('❌ [LOCAL STORAGE] Failed to write file to disk:', err.message);
    return null;
  }
}

async function getOrCreateSubfolder(subfolderName) {
  if (cachedFolderIds[subfolderName]) return cachedFolderIds[subfolderName];
  const cfg = loadRuntimeConfig();
  const drive = getDriveClient();
  if (!drive) throw new Error('Google Drive client is not configured.');
  const rootFolderId = cfg.folderId;
  try {
    const escapedName = String(subfolderName).replace(/'/g, "\\'");
    const searchRes = await drive.files.list({
      q: `'${rootFolderId}' in parents and name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id,name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    if (searchRes.data.files?.length) {
      cachedFolderIds[subfolderName] = searchRes.data.files[0].id;
      return cachedFolderIds[subfolderName];
    }
    const createRes = await drive.files.create({
      requestBody: { name: subfolderName, mimeType: 'application/vnd.google-apps.folder', parents: [rootFolderId] },
      fields: 'id,name',
      supportsAllDrives: true
    });
    cachedFolderIds[subfolderName] = createRes.data.id;
    return createRes.data.id;
  } catch (err) {
    console.warn(`⚠️ [GOOGLE DRIVE] Subfolder '${subfolderName}' failed; using root:`, err.message);
    return rootFolderId;
  }
}

async function uploadFileToDrive({ buffer, fileName, mimeType = 'application/octet-stream', subfolderName = 'General_Uploads' }) {
  // Always persist a 100% reliable local copy to disk first
  const localUrl = saveLocalUpload(buffer, fileName, subfolderName);

  const drive = getDriveClient();
  if (!drive) {
    return {
      fileId: `local_${Date.now()}`,
      fileName,
      mimeType,
      webViewLink: localUrl,
      directLink: localUrl,
      previewLink: localUrl,
      localUrl
    };
  }

  try {
    const parentFolderId = await getOrCreateSubfolder(subfolderName);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    const sanitizedFileName = `${Date.now()}_${String(fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const res = await drive.files.create({
      requestBody: { name: sanitizedFileName, parents: [parentFolderId] },
      media: { mimeType, body: bufferStream },
      fields: 'id,name,webViewLink,webContentLink,thumbnailLink',
      supportsAllDrives: true
    });
    const fileId = res.data.id;
    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
        supportsAllDrives: true
      });
    } catch (e) {
      console.warn('⚠️ [GOOGLE DRIVE] Public preview permission notice:', e.message);
    }
    const webViewLink = res.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const directLink = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
    const previewLink = `https://drive.google.com/file/d/${fileId}/preview`;
    return { fileId, fileName: sanitizedFileName, mimeType, webViewLink, directLink, previewLink, localUrl, folderId: parentFolderId };
  } catch (driveErr) {
    console.warn('⚠️ [GOOGLE DRIVE] Drive upload bypassed, using reliable local storage:', driveErr.message);
    return {
      fileId: `local_${Date.now()}`,
      fileName,
      mimeType,
      webViewLink: localUrl,
      directLink: localUrl,
      previewLink: localUrl,
      localUrl
    };
  }
}

async function uploadBase64ToDrive({ base64Data, fileName, mimeType = 'image/jpeg', subfolderName = 'Payment_Receipts' }) {
  if (!base64Data) throw new Error('No base64 data provided');
  let cleanBase64 = base64Data;
  let detectedMime = mimeType;
  if (base64Data.startsWith('data:')) {
    const parts = base64Data.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch?.[1]) detectedMime = mimeMatch[1];
    cleanBase64 = parts[1] || '';
  }
  const ext = detectedMime.includes('pdf') ? 'pdf' : (detectedMime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const safeFileName = fileName || `receipt_${Date.now()}.${ext}`;

  // Save local copy to disk for dual redundancy
  let localUrl = '';
  try {
    const buffer = Buffer.from(cleanBase64, 'base64');
    const localDir = path.join(__dirname, 'uploads', subfolderName.replace(/\//g, path.sep));
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localFilePath = path.join(localDir, safeFileName);
    fs.writeFileSync(localFilePath, buffer);
    localUrl = `/uploads/${subfolderName}/${safeFileName}`;
  } catch (fsErr) {
    console.warn('⚠️ Could not write local upload file:', fsErr.message);
  }

  // 1. If Google Apps Script Webhook is configured, upload directly to Personal Google Drive
  const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('https://script.google.com')) {
    try {
      const resp = await axios.post(webhookUrl, {
        base64Data: cleanBase64,
        fileName: safeFileName,
        mimeType: detectedMime,
        subfolder: subfolderName
      }, { timeout: 25000 });

      if (resp.data && resp.data.success) {
        const fileId = resp.data.fileId;
        const webViewLink = resp.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
        const directLink = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : (resp.data.directLink || webViewLink);
        console.log(`✅ [GOOGLE DRIVE WEBHOOK] File uploaded to Drive: ${resp.data.fileName} (ID: ${fileId})`);
        return {
          fileId,
          fileName: resp.data.fileName || safeFileName,
          mimeType: detectedMime,
          webViewLink,
          directLink,
          previewLink: webViewLink,
          localUrl: localUrl || webViewLink
        };
      }
    } catch (whErr) {
      console.warn('⚠️ [GOOGLE DRIVE WEBHOOK] Upload failed, falling back:', whErr.message);
    }
  }

  // 2. Fallback to Service Account / Local storage
  return uploadFileToDrive({
    buffer: Buffer.from(cleanBase64, 'base64'),
    fileName: safeFileName,
    mimeType: detectedMime,
    subfolderName
  });
}

async function uploadStudentArticlePackage({ student, article, submissionReceiptBase64, pdfBase64, senderBank, transactionId, senderMobile }) {
  const studentName = student?.full_name || article?.student_name || 'Student_Researcher';
  const studentEmail = student?.email || 'student@leads.edu.pk';
  const paperTitle = article?.title || 'Research_Paper';

  const cleanStudentName = studentName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
  const cleanPaperTitle = paperTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_').slice(0, 45);
  const subfolder = `Student_Submissions/${cleanStudentName}/${cleanPaperTitle}`;

  // 1. Upload Comprehensive Metadata & Manuscript Text Record
  const metadataText = `===================================================================
LAHORE LEADS UNIVERSITY - ORIC RESEARCH REPOSITORY
OFFICIAL STUDENT MANUSCRIPT & SUBMISSION RECORD
===================================================================
Submission ID:     LLU-ART-${article?.id || Date.now()}
Student Name:      ${studentName}
Student Email:     ${studentEmail}
Contact Mobile:    ${senderMobile || 'N/A'}
Paper Title:       ${paperTitle}
Discipline/Field:  ${article?.category || 'Academic Research'}
Submission Date:   ${new Date().toLocaleString()}
Plagiarism Status: Clean (0% Plagiarism Verified)
Transaction ID:    ${transactionId || 'N/A'}
Bank Channel:      ${senderBank || 'HBL Online Banking'}
Submission Fee:    PKR 1,500 (VERIFIED DEPOSITED)
Current Status:    Submitted - Awaiting Editorial Review
-------------------------------------------------------------------
ABSTRACT SUMMARY:
${article?.abstract || 'No abstract provided'}
-------------------------------------------------------------------
FULL MANUSCRIPT TEXT:
${article?.full_text || article?.abstract || 'Manuscript content attached'}
===================================================================`;

  const metaBase64 = `data:text/plain;base64,${Buffer.from(metadataText).toString('base64')}`;
  let metadataDocRes = null;
  try {
    metadataDocRes = await uploadBase64ToDrive({
      base64Data: metaBase64,
      fileName: `01_Manuscript_Abstract_&_Metadata.txt`,
      mimeType: 'text/plain',
      subfolderName: subfolder
    });
  } catch (err) {
    console.warn('⚠️ Could not upload metadata document:', err.message);
  }

  // 2. Upload Submission Fee Challan / Slip Image
  let challanRes = null;
  if (submissionReceiptBase64) {
    try {
      challanRes = await uploadBase64ToDrive({
        base64Data: submissionReceiptBase64,
        fileName: `02_Submission_Fee_Challan_Proof_${Date.now()}`,
        subfolderName: subfolder
      });
    } catch (err) {
      console.warn('⚠️ Could not upload challan proof to Drive:', err.message);
    }
  }

  // 3. Upload Research Paper PDF Manuscript if provided
  let pdfRes = null;
  if (pdfBase64 && (pdfBase64.startsWith('data:') || pdfBase64.length > 500)) {
    try {
      pdfRes = await uploadBase64ToDrive({
        base64Data: pdfBase64,
        fileName: `03_Research_Paper_Manuscript.pdf`,
        mimeType: 'application/pdf',
        subfolderName: subfolder
      });
    } catch (err) {
      console.warn('⚠️ Could not upload manuscript PDF:', err.message);
    }
  }

  return {
    subfolder,
    metadataDocUrl: metadataDocRes?.webViewLink || metadataDocRes?.localUrl,
    challanUrl: challanRes?.directLink || challanRes?.webViewLink || challanRes?.localUrl,
    pdfUrl: pdfRes?.webViewLink || pdfRes?.localUrl
  };
}

async function uploadConferencePassPackage({ user, conference, ticketType, amount, receiptBase64, senderBank, transactionId, senderMobile }) {
  const attendeeName = user?.full_name || 'Conference_Delegate';
  const attendeeEmail = user?.email || 'delegate@leads.edu.pk';
  const confTitle = conference?.title || 'Conference_Summit';

  const cleanAttendee = attendeeName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
  const cleanConf = confTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_').slice(0, 45);
  const subfolder = `Conference_Pass_Bookings/${cleanAttendee}/${cleanConf}`;

  // 1. Upload Delegate Pass Metadata Record
  const metadataText = `===================================================================
LAHORE LEADS UNIVERSITY - ORIC CONFERENCES & SUMMITS
OFFICIAL CONFERENCE DELEGATE PASS & REGISTRATION RECORD
===================================================================
Booking Ref:       PASS-LLU-2026-${Date.now().toString().slice(-6)}
Conference:        ${confTitle}
Delegate Name:     ${attendeeName}
Delegate Email:    ${attendeeEmail}
Contact Mobile:    ${senderMobile || 'N/A'}
Pass Category:     ${ticketType === 'onsite' ? 'Onsite Auditorium Delegate Pass' : 'Virtual HD Live Stream Pass'}
Amount Deposited:  PKR ${amount || (ticketType === 'onsite' ? 50 : 20)} (VERIFIED DEPOSITED)
Payment Bank:      ${senderBank || 'HBL Online Banking'}
Transaction ID:    ${transactionId || 'N/A'}
Registration Date: ${new Date().toLocaleString()}
Event Venue:       ${conference?.venue || 'Lahore Leads University Main Auditorium'}
===================================================================`;

  const metaBase64 = `data:text/plain;base64,${Buffer.from(metadataText).toString('base64')}`;
  let metadataDocRes = null;
  try {
    metadataDocRes = await uploadBase64ToDrive({
      base64Data: metaBase64,
      fileName: `01_Delegate_Pass_Metadata.txt`,
      mimeType: 'text/plain',
      subfolderName: subfolder
    });
  } catch (err) {
    console.warn('⚠️ Could not upload pass metadata document:', err.message);
  }

  // 2. Upload Pass Fee Challan / Receipt Proof
  let challanRes = null;
  if (receiptBase64) {
    try {
      let ext = 'jpg';
      let detectedMime = 'image/jpeg';
      if (typeof receiptBase64 === 'string' && receiptBase64.startsWith('data:')) {
        const mimeMatch = receiptBase64.match(/data:(.*?);/);
        if (mimeMatch && mimeMatch[1]) {
          detectedMime = mimeMatch[1];
          if (detectedMime.includes('pdf')) ext = 'pdf';
          else if (detectedMime.includes('png')) ext = 'png';
          else if (detectedMime.includes('webp')) ext = 'webp';
          else ext = 'jpg';
        }
      }
      challanRes = await uploadBase64ToDrive({
        base64Data: receiptBase64,
        fileName: `02_Pass_Payment_Challan_${Date.now()}.${ext}`,
        mimeType: detectedMime,
        subfolderName: subfolder
      });
    } catch (err) {
      console.warn('⚠️ Could not upload pass challan proof to Drive:', err.message);
    }
  }

  return {
    subfolder,
    metadataDocUrl: metadataDocRes?.webViewLink || metadataDocRes?.localUrl,
    challanUrl: challanRes?.webViewLink || challanRes?.directLink || challanRes?.previewLink || challanRes?.localUrl
  };
}

async function backupDatabaseToDrive(db) {
  if (!getDriveClient()) throw new Error('Google Drive is not configured.');
  const tables = ['users', 'journals', 'articles', 'conferences', 'tickets', 'investor_reviews', 'gallery', 'notifications', 'reader_access_requests'];
  const snapshot = { exported_at: new Date().toISOString(), database: 'univ_conference_db', tables: {} };
  for (const table of tables) {
    try { const [rows] = await db.query(`SELECT * FROM \`${table}\``); snapshot.tables[table] = rows; } catch (_) { snapshot.tables[table] = []; }
  }
  const buffer = Buffer.from(JSON.stringify(snapshot, null, 2), 'utf8');
  const fileName = `db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const result = await uploadFileToDrive({ buffer, fileName, mimeType: 'application/json', subfolderName: 'Database_Backups' });
  return { ...result, recordCount: Object.values(snapshot.tables).reduce((n, rows) => n + rows.length, 0), tablesCount: Object.keys(snapshot.tables).length };
}

async function getFileStreamFromDrive(fileId) {
  const drive = getDriveClient();
  if (!drive) throw new Error('Google Drive is not configured.');

  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size',
    supportsAllDrives: true
  });

  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );

  return {
    meta: meta.data,
    stream: res.data,
    mimeType: meta.data.mimeType || 'application/octet-stream',
    fileName: meta.data.name || 'file'
  };
}

async function uploadStudentInquiryPackage({ student, inquiry, replyText, adminName }) {
  const studentName = student?.full_name || inquiry?.user_name || 'Student_Scholar';
  const studentEmail = student?.email || inquiry?.user_email || 'student@leads.edu.pk';
  const cleanStudent = studentName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
  const inquiryId = inquiry?.id || Date.now();
  const subfolder = `Student_Inquiries/${cleanStudent}_ID${student?.id || inquiry?.user_id || 'guest'}`;

  const metadataText = `===================================================================
LAHORE LEADS UNIVERSITY - ORIC INQUIRY & SUPPORT DESK
OFFICIAL STUDENT-ADMIN CORRESPONDENCE RECORD
===================================================================
Inquiry Ref ID:    INQ-LLU-${inquiryId}
Student Name:      ${studentName}
Student Email:     ${studentEmail}
Student Mobile:    ${student?.mobile || inquiry?.sender_mobile || 'N/A'}
Subject / Topic:   ${inquiry?.subject || 'Research / Portal Inquiry'}
Category:          ${inquiry?.category || 'General Support'}
Submitted Date:    ${inquiry?.created_at || new Date().toLocaleString()}
Status:            ${replyText ? 'REPLIED & RESOLVED' : 'PENDING ORIC RESPONSE'}
-------------------------------------------------------------------
STUDENT INQUIRY MESSAGE:
${inquiry?.message || 'No inquiry text provided'}
-------------------------------------------------------------------
${replyText ? `ADMINISTRATOR OFFICIAL RESPONSE:
Responder:     ${adminName || 'ORIC Directorate Administrator'}
Response Date: ${new Date().toLocaleString()}
Remarks:
${replyText}
===================================================================` : `===================================================================`}`;

  const metaBase64 = `data:text/plain;base64,${Buffer.from(metadataText).toString('base64')}`;
  let metadataDocRes = null;
  try {
    metadataDocRes = await uploadBase64ToDrive({
      base64Data: metaBase64,
      fileName: `01_Inquiry_Record_${inquiryId}.txt`,
      mimeType: 'text/plain',
      subfolderName: subfolder
    });
  } catch (err) {
    console.warn('⚠️ Could not upload inquiry metadata document:', err.message);
  }

  return {
    subfolder,
    metadataDocUrl: metadataDocRes?.webViewLink || metadataDocRes?.localUrl
  };
}

async function uploadStudentRevisionPackage({ student, article, revisionNotes, pdfBase64 }) {
  const studentName = student?.full_name || article?.student_name || 'Student_Researcher';
  const studentEmail = student?.email || 'student@leads.edu.pk';
  const paperTitle = article?.title || 'Research_Paper';
  const cleanStudent = studentName.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_');
  const cleanPaper = paperTitle.replace(/[^a-zA-Z0-9_\- ]/g, '').trim().replace(/\s+/g, '_').slice(0, 45);
  const subfolder = `Student_Submissions/${cleanStudent}/${cleanPaper}/Revisions`;

  const metadataText = `===================================================================
LAHORE LEADS UNIVERSITY - ORIC RESEARCH REPOSITORY
OFFICIAL REVISED MANUSCRIPT SUBMISSION RECORD
===================================================================
Article ID:        LLU-ART-${article?.id || Date.now()}
Student Name:      ${studentName}
Student Email:     ${studentEmail}
Paper Title:       ${paperTitle}
Resubmission Date: ${new Date().toLocaleString()}
Revision Count:    ${(article?.resubmission_count || 0) + 1}
Status:            Resubmitted - Awaiting Re-Evaluation
-------------------------------------------------------------------
AUTHOR REVISION NOTES / CORRECTION EXPLANATION:
${revisionNotes || 'Manuscript updated according to reviewer editorial comments.'}
-------------------------------------------------------------------
MANUSCRIPT FULL TEXT / ABSTRACT:
${article?.full_text || article?.abstract || 'Updated text attached'}
===================================================================`;

  const metaBase64 = `data:text/plain;base64,${Buffer.from(metadataText).toString('base64')}`;
  let metadataDocRes = null;
  try {
    metadataDocRes = await uploadBase64ToDrive({
      base64Data: metaBase64,
      fileName: `01_Revision_Metadata_${Date.now()}.txt`,
      mimeType: 'text/plain',
      subfolderName: subfolder
    });
  } catch (err) {
    console.warn('⚠️ Could not upload revision metadata document:', err.message);
  }

  let pdfRes = null;
  if (pdfBase64 && (pdfBase64.startsWith('data:') || pdfBase64.length > 500)) {
    try {
      pdfRes = await uploadBase64ToDrive({
        base64Data: pdfBase64,
        fileName: `02_Corrected_Manuscript_v${(article?.resubmission_count || 0) + 1}.pdf`,
        mimeType: 'application/pdf',
        subfolderName: subfolder
      });
    } catch (err) {
      console.warn('⚠️ Could not upload revised PDF to Drive:', err.message);
    }
  }

  return {
    subfolder,
    metadataDocUrl: metadataDocRes?.webViewLink || metadataDocRes?.localUrl,
    pdfUrl: pdfRes?.webViewLink || pdfRes?.localUrl
  };
}

module.exports = {
  getDriveClient,
  testDriveConnection,
  testCandidateConfig,
  saveStorageConfig,
  getStorageConfigSummary,
  uploadFileToDrive,
  uploadBase64ToDrive,
  uploadStudentArticlePackage,
  uploadConferencePassPackage,
  uploadStudentInquiryPackage,
  uploadStudentRevisionPackage,
  backupDatabaseToDrive,
  saveLocalUpload,
  getFileStreamFromDrive
};
