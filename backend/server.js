const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const {
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
  notifyArticlePublished,
  notifyTicketBooked,
  notifyTicketVerifiedAndIssued,
  notifyReaderAccessRequested
} = require('./notificationService');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const {
  testDriveConnection,
  uploadFileToDrive,
  uploadBase64ToDrive,
  uploadStudentArticlePackage,
  uploadConferencePassPackage,
  backupDatabaseToDrive,
  saveStorageConfig,
  saveLocalUpload,
  getStorageConfigSummary
} = require('./googleDriveService');

// Helper to auto-upload base64/receipts with zero-failure local disk + Google Drive dual storage
async function resolveDriveUrl(urlOrBase64, subfolderName = 'General_Uploads', defaultFileName = 'file') {
  if (!urlOrBase64) return urlOrBase64;
  if (typeof urlOrBase64 === 'string' && (urlOrBase64.startsWith('data:') || urlOrBase64.length > 500)) {
    try {
      let ext = 'jpg';
      let mimeType = 'image/jpeg';
      if (urlOrBase64.startsWith('data:')) {
        const mimeMatch = urlOrBase64.match(/data:(.*?);/);
        if (mimeMatch && mimeMatch[1]) {
          mimeType = mimeMatch[1];
          if (mimeType.includes('pdf')) ext = 'pdf';
          else if (mimeType.includes('png')) ext = 'png';
          else if (mimeType.includes('webp')) ext = 'webp';
          else if (mimeType.includes('svg')) ext = 'svg';
          else ext = 'jpg';
        }
      }
      const driveRes = await uploadBase64ToDrive({
        base64Data: urlOrBase64,
        fileName: `${defaultFileName}_${Date.now()}.${ext}`,
        mimeType,
        subfolderName
      });
      if (driveRes) {
        return driveRes.directLink || driveRes.webViewLink || driveRes.localUrl || urlOrBase64;
      }
    } catch (e) {
      console.warn('⚠️ Storage upload warning, preserving raw string:', e.message);
      return urlOrBase64;
    }
  }
  return urlOrBase64;
}

const app = express();
app.use(cors());
// Increased body limit to support base64 proof image uploads smoothly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving for 100% reliable local slip & receipt inspection
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = process.env.JWT_SECRET || 'univ_conference_secret_key_2026';

// Database Connection Config (Prefer 127.0.0.1 to avoid IPv6 ::1 ECONNREFUSED on Windows)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'univ_conference_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000
};

// Database Connection Pool
const pool = mysql.createPool(dbConfig);
const db = pool.promise();

let isDbConnected = false;

// Helper to safely add column if missing
async function ensureColumn(table, column, definition) {
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
    if (cols.length === 0) {
      await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`✅ Migration: Added column '${column}' to '${table}' table`);
    }
  } catch (err) {
    // ignore
  }
}

// Persistent in-portal notification helper. Database is primary; memory fallback keeps demo mode functional.
let mockPortalNotifications = [];
async function createPortalNotification({ userId = null, roleTarget = null, type = 'info', title, message, link = null }) {
  const payload = { id: Date.now() + Math.floor(Math.random() * 1000), user_id: userId, role_target: roleTarget, type, title, message, link, is_read: false, created_at: new Date().toISOString() };
  if (isDbConnected) {
    try {
      const [result] = await db.query(
        'INSERT INTO notifications (user_id, role_target, type, title, message, link, is_read) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
        [userId, roleTarget, type, title, message, link]
      );
      payload.id = result.insertId;
      return payload;
    } catch (e) { console.warn('Portal notification DB warning:', e.message); }
  }
  mockPortalNotifications.unshift(payload);
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  return payload;
}

async function notifyAllStudents({ type = 'conference', title, message, link }) {
  if (isDbConnected) {
    try {
      const [students] = await db.query("SELECT id FROM users WHERE role = 'student'");
      await Promise.all(students.map(u => createPortalNotification({ userId: u.id, type, title, message, link })));
      return;
    } catch (e) { console.warn('Student broadcast warning:', e.message); }
  }
  await createPortalNotification({ roleTarget: 'student', type, title, message, link });
}

// Initialize Database & Tables automatically if MySQL is running
async function initDatabase() {
  try {
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 2000
    }).promise();

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`full_name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'student', 'investor', 'attendee') DEFAULT 'student',
        \`organization\` VARCHAR(255) DEFAULT 'University',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NULL,
        \`role_target\` VARCHAR(50) NULL,
        \`type\` VARCHAR(100) DEFAULT 'info',
        \`title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`link\` VARCHAR(500) NULL,
        \`is_read\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_user (user_id, is_read),
        INDEX idx_notifications_role (role_target, is_read)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`articles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`student_id\` INT NOT NULL,
        \`student_name\` VARCHAR(255) DEFAULT '',
        \`title\` VARCHAR(500) NOT NULL,
        \`abstract\` TEXT NOT NULL,
        \`full_text\` LONGTEXT,
        \`category\` VARCHAR(255) DEFAULT 'General Science & Tech',
        \`plagiarism_score\` INT DEFAULT 5,
        \`reviewer_notes\` TEXT,
        \`tier\` VARCHAR(50) DEFAULT 'None',
        \`submission_fee_paid\` BOOLEAN DEFAULT TRUE,
        \`publication_fee_paid\` BOOLEAN DEFAULT FALSE,
        \`presentation_fee_paid\` BOOLEAN DEFAULT FALSE,
        \`is_published\` BOOLEAN DEFAULT FALSE,
        \`admin_unread\` BOOLEAN DEFAULT TRUE,
        \`student_unread\` BOOLEAN DEFAULT FALSE,
        \`status\` VARCHAR(50) DEFAULT 'Submitted - Awaiting Review',
        \`created_at\` VARCHAR(50)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`conferences\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`event_date\` VARCHAR(100),
        \`venue\` VARCHAR(255),
        \`stream_link\` VARCHAR(255),
        \`onsite_ticket_price\` DECIMAL(10,2) DEFAULT 500.00,
        \`online_ticket_price\` DECIMAL(10,2) DEFAULT 200.00,
        \`status\` VARCHAR(50) DEFAULT 'Upcoming'
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`tickets\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`user_name\` VARCHAR(255) DEFAULT '',
        \`conference_id\` INT DEFAULT 1,
        \`ticket_type\` VARCHAR(50) DEFAULT 'online',
        \`amount_paid\` DECIMAL(10,2) DEFAULT 20.00,
        \`ticket_code\` VARCHAR(100) UNIQUE NOT NULL,
        \`payment_status\` VARCHAR(50) DEFAULT 'Paid',
        \`booked_at\` VARCHAR(50)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`investor_reviews\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`investor_id\` INT NOT NULL,
        \`investor_name\` VARCHAR(255) DEFAULT '',
        \`article_id\` INT NOT NULL,
        \`article_title\` VARCHAR(500) DEFAULT '',
        \`decision\` VARCHAR(100) DEFAULT 'Interested to Invest',
        \`benefit_for_country\` VARCHAR(100) DEFAULT 'High Impact',
        \`comments\` TEXT,
        \`created_at\` VARCHAR(50)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`gallery\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`conference_id\` INT DEFAULT 1,
        \`title\` VARCHAR(255) NOT NULL,
        \`image_url\` TEXT,
        \`featured_article_id\` INT,
        \`investor_name\` VARCHAR(255),
        \`description\` TEXT
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`journals\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`short_code\` VARCHAR(50) NOT NULL,
        \`slug\` VARCHAR(100) UNIQUE NOT NULL,
        \`description\` TEXT,
        \`cover_image\` TEXT,
        \`banner_image\` TEXT,
        \`issn_print\` VARCHAR(50) DEFAULT '2709-1234',
        \`issn_online\` VARCHAR(50) DEFAULT '2709-5678',
        \`category\` VARCHAR(100) DEFAULT 'Artificial Intelligence & Computer Science',
        \`chief_editor\` VARCHAR(255) DEFAULT 'Prof. Dr. M. Arshad (Dean of Research)',
        \`current_volume\` INT DEFAULT 1,
        \`current_issue\` INT DEFAULT 1,
        \`current_issue_title\` VARCHAR(255) DEFAULT 'Vol. 1 No. 1 (2026): Spring Issue',
        \`call_for_papers_title\` VARCHAR(255) DEFAULT 'Call for Papers Volume 1 Issue 1 Spring 2026',
        \`call_for_papers_deadline\` VARCHAR(100) DEFAULT '2026-10-30',
        \`call_for_papers_image\` TEXT,
        \`scope_keywords\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS \`article_access_requests\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`article_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`user_name\` VARCHAR(255) DEFAULT '',
        \`user_email\` VARCHAR(255) DEFAULT '',
        \`article_title\` VARCHAR(500) DEFAULT '',
        \`amount_paid\` DECIMAL(10,2) DEFAULT 500.00,
        \`receipt_url\` LONGTEXT,
        \`sender_bank\` VARCHAR(100) DEFAULT 'HBL Mobile App',
        \`transaction_id\` VARCHAR(100) DEFAULT '',
        \`sender_mobile\` VARCHAR(50) DEFAULT '0348-2727605',
        \`status\` VARCHAR(50) DEFAULT 'Pending Admin Verification',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure missing columns
    await ensureColumn('articles', 'student_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('articles', 'journal_id', "INT DEFAULT 1");
    await ensureColumn('articles', 'volume', "INT DEFAULT 1");
    await ensureColumn('articles', 'issue', "INT DEFAULT 1");
    await ensureColumn('articles', 'page_numbers', "VARCHAR(50) DEFAULT '1-15'");
    await ensureColumn('articles', 'views_count', "INT DEFAULT 120");
    await ensureColumn('articles', 'admin_revision_notes', "TEXT");
    await ensureColumn('articles', 'resubmission_count', "INT DEFAULT 0");
    await ensureColumn('articles', 'full_text', 'LONGTEXT');
    await ensureColumn('articles', 'is_published', 'BOOLEAN DEFAULT FALSE');
    await ensureColumn('articles', 'admin_unread', 'BOOLEAN DEFAULT TRUE');
    await ensureColumn('articles', 'student_unread', 'BOOLEAN DEFAULT FALSE');
    await ensureColumn('articles', 'pdf_url', "VARCHAR(500) DEFAULT 'research_paper_v1.pdf'");
    await ensureColumn('articles', 'submission_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'publication_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'presentation_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'approved_readers', 'LONGTEXT');
    await ensureColumn('articles', 'sender_bank', "VARCHAR(100) DEFAULT 'HBL Mobile App'");
    await ensureColumn('articles', 'transaction_id', "VARCHAR(100) DEFAULT 'TID-84920194'");
    await ensureColumn('articles', 'sender_mobile', "VARCHAR(50) DEFAULT '0300-1234567'");
    await ensureColumn('articles', 'presenting_students_list', 'TEXT');
    await ensureColumn('articles', 'doi', "VARCHAR(255) DEFAULT '10.5281/leads.2026.0101'");
    await ensureColumn('conferences', 'event_time', "VARCHAR(100) DEFAULT '10:00 AM - 04:00 PM'");
    await ensureColumn('conferences', 'cover_image', 'TEXT');
    await ensureColumn('conferences', 'presenting_students', 'TEXT');
    await ensureColumn('tickets', 'user_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('tickets', 'user_email', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('tickets', 'seat_number', "VARCHAR(100) DEFAULT 'Seat Row A - #01'");
    await ensureColumn('tickets', 'stream_link', "VARCHAR(500) DEFAULT ''");
    await ensureColumn('tickets', 'receipt_url', "LONGTEXT");
    await ensureColumn('tickets', 'sender_bank', "VARCHAR(100) DEFAULT 'HBL Mobile App'");
    await ensureColumn('tickets', 'transaction_id', "VARCHAR(100) DEFAULT ''");
    await ensureColumn('tickets', 'sender_mobile', "VARCHAR(50) DEFAULT ''");
    await ensureColumn('tickets', 'event_date', 'VARCHAR(100)');
    await ensureColumn('tickets', 'event_time', 'VARCHAR(100)');
    await ensureColumn('tickets', 'venue', 'VARCHAR(255)');
    await ensureColumn('investor_reviews', 'investor_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('investor_reviews', 'article_title', "VARCHAR(500) DEFAULT ''");
    // Seed default admin and initial sample records into MySQL if empty
    const [journalRows] = await db.query('SELECT COUNT(*) AS count FROM journals');
    if (journalRows[0].count === 0) {
      await db.query(`
        INSERT INTO journals (id, title, short_code, slug, description, cover_image, banner_image, issn_print, issn_online, category, chief_editor, current_volume, current_issue, current_issue_title, call_for_papers_title, call_for_papers_deadline, call_for_papers_image, scope_keywords) VALUES
        (1, 'Leads Journal of Computer & Computing Sciences', 'LJCCS', 'ljccs', 'Official flagship journal of Lahore Leads University dedicated to publishing peer-reviewed research in Artificial Intelligence, Cloud Computing, Cybersecurity, Robotics, and Data Sciences.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', '2708-6283', '2708-6291', 'Computer Science & Artificial Intelligence', 'Prof. Dr. M. Arshad (Dean FoCS, Lahore Leads University)', 1, 2, 'Vol. 1 No. 2 (2026): Fall Issue', 'Call for Papers Volume 1 Issue 2 Fall 2026', '2026-11-15', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 'Machine Learning, Deep Learning, Cognitive Robotics, Computer Vision, Reinforcement Learning, Human-Robot Interaction, Natural Language Processing, Autonomous Agents, AI in Healthcare'),
        (2, 'Leads International Journal of Economics & Business', 'LIJEB', 'lijeb', 'A double-blind peer-reviewed journal publishing high-impact research in management sciences, corporate finance, Islamic banking, entrepreneurship, and econometric modeling.', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', '2709-8422', '2709-8430', 'Business, Economics & Management', 'Dr. Farooq Tariq (Director ORIC, Lahore Leads University)', 11, 1, 'Vol. 11 No. 1 (2026): Spring Issue', 'Call for Papers Vol 11 Issue 1 2026', '2026-10-30', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 'Strategic Leadership, Venture Finance, Digital Marketing, Corporate Governance, Supply Chain Analytics, Behavioral Economics'),
        (3, 'Leads Journal of Engineering & Applied Sciences', 'LJEAS', 'ljeas', 'A recognized journal covering electrical engineering, mechanical systems, renewable solar technology, civil infrastructure, and mathematical modeling.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80', '2616-5600', '2616-5619', 'Engineering & Applied Sciences', 'Prof. Dr. Tahir Mahmood (Dean Engineering, Lahore Leads University)', 8, 1, 'Vol. 8 No. 1 (2026): General Issue', 'Call for Papers in Applied Optimization', '2026-11-20', 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80', 'Power Systems, Renewable Energy, Smart Grids, Computational Fluid Dynamics, Structural Engineering, Fuzzy Optimization'),
        (4, 'Leads Journal of Law & Social Policy', 'LJLSP', 'ljlsp', 'Advancing scholarly jurisprudence, constitutional law, human rights advocacy, international arbitration, and comparative legal frameworks in South Asia.', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80', '2521-8972', '2521-8980', 'Law & Social Policy', 'Justice (R) Dr. M. Khan (Dean Faculty of Law, Lahore Leads University)', 7, 1, 'Vol. 7 No. 1 (2026): Constitutional Law Edition', 'Submissions open for Cyber Law & Digital Rights', '2026-11-30', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80', 'Constitutional Law, Cyber Crime Jurisprudence, Human Rights, International Trade Law, Environmental Legislation'),
        (5, 'Leads Journal of Humanities & Education', 'LJHE', 'ljhe', 'Promoting interdisciplinary research in applied linguistics, English language pedagogy, educational technology, curriculum development, and cultural studies.', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1579165466791-788226ab77b6?auto=format&fit=crop&w=1200&q=80', '2409-109X', '2410-5716', 'Humanities & Education', 'Dr. Nadia Anwar (Head Department of Humanities, Lahore Leads University)', 10, 2, 'Vol. 10 No. 2 (2026): Autumn Edition', 'Special Issue on Digital Humanities & Pedagogy', '2026-12-01', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80', 'Applied Linguistics, Critical Discourse Analysis, Educational Leadership, Modern Pedagogy, Sociolinguistics'),
        (6, 'Leads Journal of Media & Communication Studies', 'LJMCS', 'ljmcs', 'Explores the transformative role of digital journalism, social media ethics, broadcast media, PR strategy, and algorithmic communications.', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80', '2663-1288', '2663-1296', 'Media & Communication Studies', 'Dr. Aslam Dogar (Media Studies Dept, Lahore Leads University)', 6, 1, 'Vol. 6 No. 1 (2026): Spring Edition', 'Submissions open for AI in Journalism & Media Ethics', '2026-11-05', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', 'Digital Journalism, Media Law, Misinformation Tracking, Political Communication, AI Generated Media, Strategic PR');
      `);
    }

    const [userRows] = await db.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      await db.query(`
        INSERT INTO users (id, full_name, email, password, role, organization) VALUES
        (1, 'System Admin', 'admin@leads.edu.pk', 'password123', 'admin', 'Lahore Leads University Board'),
        (2, 'Ali Ahmed', 'student@leads.edu.pk', 'password123', 'student', 'Lahore Leads University CS Dept'),
        (3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Apex Tech Capital'),
        (4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self'),
        (5, 'Bazigh Minhas', 'bazighminhas1@gmail.com', 'password123', 'student', 'Lahore Leads University Innovation Lab'),
        (6, 'Dr. Sarah Vance', 'sarah@biohealthvc.com', 'password123', 'investor', 'BioHealth VC'),
        (7, 'Hamza Qureshi', 'hamza@fintechangels.com', 'password123', 'investor', 'FinTech Angels');
      `);
    }

    const [confRows] = await db.query('SELECT COUNT(*) AS count FROM conferences');
    if (confRows[0].count === 0) {
      await db.query(`
        INSERT INTO conferences (id, title, description, cover_image, event_date, event_time, venue, stream_link, onsite_ticket_price, online_ticket_price, presenting_students, attending_investors, status) VALUES
        (1, 'Lahore Leads University National Innovation & Research Summit 2026', 'Annual flagship summit showcasing top student research presentations to venture capital investors and national industries.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', '2026-09-15', '10:00 AM - 04:00 PM', 'Lahore Leads University Main Campus Grand Auditorium (Kamahan Road) & HD Live Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Biocompatible Nanoparticles), Ali Ahmed (Agri Drones)', 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com), Hamza Qureshi (FinTech Angels - hamza@fintechangels.com)', 'Upcoming'),
        (2, 'Global AI & Clean Energy Summit 2026', 'Premier international summit showcasing renewable energy research and deep learning models.', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', '2026-11-20', '09:00 AM - 05:00 PM', 'Lahore Leads University City Campus Hall A & Live Stream', 'https://meet.google.com/ai-clean-energy', 75.00, 30.00, 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)', 'John Malik (Apex Tech Capital - investor@venture.com), Silicon Venture Partners', 'Upcoming');
      `);
    }

    const [artRows] = await db.query('SELECT COUNT(*) AS count FROM articles');
    if (artRows[0].count === 0) {
      await db.query(`
        INSERT INTO articles (id, student_id, student_name, journal_id, volume, issue, page_numbers, views_count, title, abstract, full_text, category, pdf_url, submission_receipt_url, publication_receipt_url, presentation_receipt_url, plagiarism_score, reviewer_notes, admin_revision_notes, resubmission_count, tier, submission_fee_paid, publication_fee_paid, presentation_fee_paid, is_published, admin_unread, student_unread, status, created_at) VALUES
        (1, 2, 'Ali Ahmed', 1, 1, 2, '1-26', 342, 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments with smart micro-grids.', '1. ABSTRACT & INTRODUCTION:\nRenewable energy integration in modern municipal infrastructures poses complex intermittency challenges. This paper implements an attention-based Transformer model forecasting solar radiation with 98.4% accuracy.\n\n2. METHODOLOGY & DATASET:\nCollected 4-year continuous telemetry from 120 photovoltaic stations in Lahore and Islamabad.\n\n3. RESULTS & COMMERCIALIZATION:\nDecreased grid strain by 34.2% during peak sunlight hours. Seed capital will be utilized for municipal hardware testing.', 'Artificial Intelligence & Clean Energy', 'solar_grid_ai.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 4, 'Excellent novelty, methodology is rigorously validated by external academic peer review. Awarded Platinum Tier.', 'Paper is accepted in Vol 1 Issue 2 after thorough mathematical verification.', 0, 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-25'),
        (2, 2, 'Ali Ahmed', 5, 10, 2, '27-46', 218, 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted tumor cells without damaging surrounding tissue.', '1. ABSTRACT:\nTargeted oncological therapy using functionalized gold-lipid core nanoparticles.\n\n2. EXPERIMENTAL FINDINGS:\nAchieved 82% tumor localization in in-vitro assays with zero off-target hepatic degradation.', 'Biotechnology & Healthcare', 'nanoparticles.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', '', 6, 'Good article. Excellent experimental validation in cellular models. Awarded Gold Tier.', 'Approved for Volume 10 Issue 2 publication.', 0, 'Gold', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, 'Published', '2026-08-28'),
        (3, 5, 'Bazigh Minhas', 1, 1, 2, '47-65', 495, 'Quantum Cryptography for Next-Gen Financial Banking', 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.', '1. EXECUTIVE ABSTRACT:\nQuantum computing threatens RSA-2048 encryption protocols. This research delivers Kyber-512 lattice key exchanges with sub-millisecond handshake latency.\n\n2. SECURITY PROOF:\nResistant against Shor algorithm attacks on post-quantum simulators.', 'Cybersecurity & Quantum Computing', 'quantum_banking.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 3, 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.', 'Volume 1 Issue 2 feature article.', 0, 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-29'),
        (4, 2, 'Ali Ahmed', 1, 1, 2, '66-89', 184, 'Autonomous Agricultural Drones for Crop Yield Optimization', 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.', '1. ABSTRACT:\nCombines YOLOv8 with multispectral NDVI camera sensors to detect early stage pest infestations.\n\n2. AGRONOMIC TESTING:\nValidated over 500+ agricultural acres with 28% reduction in chemical pesticide wastage.', 'Robotics & AgriTech', 'agri_drones.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 5, 'Identified minor errors in section 2 dataset. Please expand sample size and resubmit.', 'Please expand the experimental dataset to 1000 acres as requested by peer reviewer.', 1, 'None', TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Needs Revision', '2026-08-30');
      `);
    }

    try {
      const [revRows] = await db.query('SELECT COUNT(*) AS count FROM investor_reviews');
      if (revRows[0].count === 0) {
        const [existingArts] = await db.query('SELECT id FROM articles LIMIT 3');
        if (existingArts.length > 0) {
          await db.query(`
            INSERT IGNORE INTO investor_reviews (id, investor_id, investor_name, article_id, article_title, decision, benefit_for_country, comments, created_at) VALUES
            (1, 3, 'John Malik (Apex Tech Capital)', ?, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Economic Impact', 'Great potential for municipal grid deployment. Willing to fund seed round of $50,000.', '2026-08-30')
          `, [existingArts[0].id]);
        }
      }
    } catch (revErr) {
      console.warn('⚠️ Investor reviews seed skipped:', revErr.message);
    }

    try {
      const [galRows] = await db.query('SELECT COUNT(*) AS count FROM gallery');
      if (galRows[0].count === 0) {
        await db.query(`
          INSERT IGNORE INTO gallery (id, conference_id, title, image_url, investor_name, description) VALUES
          (1, 1, 'Solar Grid AI Awarded Top Platinum Tier at Leads Summit', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', 'John Malik (Apex Tech Capital)', 'Lahore Leads University student Ali Ahmed received $50,000 seed investment pledge during the live pitch session.'),
          (2, 1, 'Target Drug Delivery Nanomedicine Breakthrough', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80', 'Dr. Sarah Vance (BioHealth VC)', 'Awarded Gold Tier for pioneering targeted drug delivery system reducing oncology side effects.');
        `);
      }
    } catch (galErr) {
      console.warn('⚠️ Gallery seed skipped:', galErr.message);
    }

    isDbConnected = true;
    console.log('✅ CONNECTED TO MYSQL DATABASE & ALL TABLES INITIALIZED SUCCESSFULLY! (univ_conference_db)');
  } catch (err) {
    isDbConnected = false;
    console.log('ℹ️ MySQL database notice:', err.message, '- running seamlessly in high-resilience memory mode.');
  }
}

// Run DB Initialization
initDatabase();

// In-Memory Storage Fallback (Always synchronized and 100% functional)
let mockJournals = [
  {
    id: 1,
    title: 'Leads Journal of Artificial Intelligence & Machine Learning',
    short_code: 'LJ-AIML',
    slug: 'lj-aiml',
    description: 'Official flagship research journal of Lahore Leads University dedicated to publishing peer-reviewed research in Deep Learning, Computer Vision, Generative AI, LLMs, and Cognitive Robotics.',
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2708-6283',
    issn_online: '2708-6291',
    category: 'Artificial Intelligence & Robotics',
    chief_editor: 'Prof. Dr. M. Arshad (Dean FoCS, Lahore Leads University)',
    current_volume: 1,
    current_issue: 2,
    current_issue_title: 'Vol. 1 No. 2 (2026): Summer AI Edition',
    call_for_papers_title: 'Call for Papers Volume 1 Issue 2 Fall 2026',
    call_for_papers_deadline: '2026-11-15',
    call_for_papers_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Deep Learning, LLMs, Computer Vision, Autonomous Robotics, NLP, Generative AI',
    created_at: '2026-01-01'
  },
  {
    id: 2,
    title: 'Leads Journal of Robotics & Automation',
    short_code: 'LJ-ROBOT',
    slug: 'lj-robot',
    description: 'Dedicated to advanced mechatronics, autonomous unmanned systems, robotic manipulation, cyber-physical systems, and industrial automation.',
    cover_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2710-3341',
    issn_online: '2710-335X',
    category: 'Artificial Intelligence & Robotics',
    chief_editor: 'Dr. Usman Farooq (Head Mechatronics, Lahore Leads University)',
    current_volume: 3,
    current_issue: 1,
    current_issue_title: 'Vol. 3 No. 1 (2026): Autonomous Systems',
    call_for_papers_title: 'Special Issue on Drone Navigation & Industrial Cobots',
    call_for_papers_deadline: '2026-11-20',
    call_for_papers_image: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Robotic Kinematics, UAVs, SLAM, Industrial Automation, Cobots',
    created_at: '2026-01-01'
  },
  {
    id: 3,
    title: 'Leads Journal of Pakistan Studies & National Heritage',
    short_code: 'LJ-PAKSTUDIES',
    slug: 'lj-pakstudies',
    description: 'Scholarly investigations into constitutional history, geo-strategic affairs, public policy, national economy, and sociocultural heritage of Pakistan.',
    cover_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2789-4012',
    issn_online: '2789-4020',
    category: 'Pakistan Studies & Social Sciences',
    chief_editor: 'Dr. M. Tariq Javed (Dept of Social Sciences, Lahore Leads University)',
    current_volume: 5,
    current_issue: 1,
    current_issue_title: 'Vol. 5 No. 1 (2026): Geo-Strategic Policy',
    call_for_papers_title: 'Submissions Open on Regional Economic Corridors & Heritage',
    call_for_papers_deadline: '2026-12-05',
    call_for_papers_image: 'https://images.unsplash.com/photo-1569974498991-d3c12a504f95?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Pakistan Movement, Foreign Policy, Geo-Economics, Constitutional Law, Cultural Heritage',
    created_at: '2026-01-01'
  },
  {
    id: 4,
    title: 'Leads Journal of Islamic Studies & Shariah Jurisprudence',
    short_code: 'LJ-ISLAMIAT',
    slug: 'lj-islamiat',
    description: 'A distinguished quarterly journal promoting research in Islamic jurisprudence, Quranic sciences, Hadith scholarship, Islamic finance, and contemporary ethics.',
    cover_image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2790-8811',
    issn_online: '2790-882X',
    category: 'Islamic Studies & Shariah Jurisprudence',
    chief_editor: 'Prof. Dr. Hafiz Abdul Rehman (Faculty of Islamic Studies, Leads Univ)',
    current_volume: 8,
    current_issue: 2,
    current_issue_title: 'Vol. 8 No. 2 (2026): Contemporary Fiqh & Ethics',
    call_for_papers_title: 'Submissions Invited for Islamic FinTech & Modern Banking',
    call_for_papers_deadline: '2026-11-25',
    call_for_papers_image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Shariah Law, Islamic Finance, Quranic Hermeneutics, Islamic Bioethics',
    created_at: '2026-01-01'
  },
  {
    id: 5,
    title: 'Leads Journal of Computer & Computing Sciences',
    short_code: 'LJCCS',
    slug: 'ljccs',
    description: 'Peer-reviewed research in Software Architecture, Distributed Cloud Systems, High Performance Computing, and Database Technologies.',
    cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2708-6283',
    issn_online: '2708-6291',
    category: 'Computer Science & Software Engineering',
    chief_editor: 'Dr. M. Haris (Head Computer Science, Lahore Leads University)',
    current_volume: 4,
    current_issue: 1,
    current_issue_title: 'Vol. 4 No. 1 (2026): Cloud & Microservices',
    call_for_papers_title: 'Call for Papers on Scalable Software Architecture',
    call_for_papers_deadline: '2026-10-31',
    call_for_papers_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Software Engineering, Cloud Computing, Distributed Databases, DevOps, Microservices',
    created_at: '2026-01-01'
  },
  {
    id: 6,
    title: 'Leads Journal of Cyber Security & Digital Forensics',
    short_code: 'LJ-CYBER',
    slug: 'lj-cyber',
    description: 'High-impact findings in Cryptography, Threat Intelligence, Network Defense, Penetration Testing, Zero Trust Architecture, and Incident Response.',
    cover_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2811-9214',
    issn_online: '2811-9222',
    category: 'Cyber Security & Forensics',
    chief_editor: 'Dr. Shahzad Akram (Cyber Center, Lahore Leads University)',
    current_volume: 2,
    current_issue: 1,
    current_issue_title: 'Vol. 2 No. 1 (2026): Zero Trust Defense',
    call_for_papers_title: 'Submissions Open: AI-Driven Malware Detection',
    call_for_papers_deadline: '2026-12-10',
    call_for_papers_image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Threat Modeling, Cryptography, Blockchain Security, Network Forensics, Zero Trust',
    created_at: '2026-01-01'
  },
  {
    id: 7,
    title: 'Leads International Journal of Economics & Business',
    short_code: 'LIJEB',
    slug: 'lijeb',
    description: 'A double-blind peer-reviewed journal publishing high-impact research in management sciences, corporate finance, Islamic banking, entrepreneurship, and econometric modeling.',
    cover_image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2709-8422',
    issn_online: '2709-8430',
    category: 'Business, Economics & Management',
    chief_editor: 'Dr. Farooq Tariq (Director ORIC, Lahore Leads University)',
    current_volume: 11,
    current_issue: 1,
    current_issue_title: 'Vol. 11 No. 1 (2026): Spring Issue',
    call_for_papers_title: 'Call for Papers Vol 11 Issue 1 2026',
    call_for_papers_deadline: '2026-10-30',
    call_for_papers_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Strategic Leadership, Venture Finance, Digital Marketing, Corporate Governance, Behavioral Economics',
    created_at: '2026-01-01'
  },
  {
    id: 8,
    title: 'Leads Journal of Engineering & Applied Sciences',
    short_code: 'LJEAS',
    slug: 'ljeas',
    description: 'A recognized journal covering electrical engineering, mechanical systems, renewable solar technology, civil infrastructure, and mathematical modeling.',
    cover_image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2616-5600',
    issn_online: '2616-5619',
    category: 'Engineering & Applied Sciences',
    chief_editor: 'Prof. Dr. Tahir Mahmood (Dean Engineering, Lahore Leads University)',
    current_volume: 8,
    current_issue: 1,
    current_issue_title: 'Vol. 8 No. 1 (2026): General Issue',
    call_for_papers_title: 'Call for Papers in Applied Optimization',
    call_for_papers_deadline: '2026-11-20',
    call_for_papers_image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Power Systems, Renewable Energy, Smart Grids, CFD, Structural Engineering',
    created_at: '2026-01-01'
  },
  {
    id: 9,
    title: 'Leads Journal of Law & Social Policy',
    short_code: 'LJLSP',
    slug: 'ljlsp',
    description: 'Advancing scholarly jurisprudence, constitutional law, human rights advocacy, international arbitration, and comparative legal frameworks in South Asia.',
    cover_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2521-8972',
    issn_online: '2521-8980',
    category: 'Law & Social Policy',
    chief_editor: 'Justice (R) Dr. M. Khan (Dean Faculty of Law, Lahore Leads University)',
    current_volume: 7,
    current_issue: 1,
    current_issue_title: 'Vol. 7 No. 1 (2026): Constitutional Law Edition',
    call_for_papers_title: 'Submissions open for Cyber Law & Digital Rights',
    call_for_papers_deadline: '2026-11-30',
    call_for_papers_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Constitutional Law, Cyber Crime Jurisprudence, Human Rights, International Trade Law',
    created_at: '2026-01-01'
  },
  {
    id: 10,
    title: 'Leads Journal of Humanities & Education',
    short_code: 'LJHE',
    slug: 'ljhe',
    description: 'Promoting interdisciplinary research in applied linguistics, English language pedagogy, educational technology, curriculum development, and cultural studies.',
    cover_image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1579165466791-788226ab77b6?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2409-109X',
    issn_online: '2410-5716',
    category: 'Humanities & Education',
    chief_editor: 'Dr. Nadia Anwar (Head Dept of Humanities, Lahore Leads University)',
    current_volume: 10,
    current_issue: 2,
    current_issue_title: 'Vol. 10 No. 2 (2026): Autumn Edition',
    call_for_papers_title: 'Special Issue on Digital Humanities & Pedagogy',
    call_for_papers_deadline: '2026-12-01',
    call_for_papers_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Applied Linguistics, Critical Discourse Analysis, Educational Leadership, Modern Pedagogy',
    created_at: '2026-01-01'
  },
  {
    id: 11,
    title: 'Leads Journal of Media & Communication Studies',
    short_code: 'LJMCS',
    slug: 'ljmcs',
    description: 'Explores the transformative role of digital journalism, social media ethics, broadcast media, PR strategy, and algorithmic communications.',
    cover_image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2663-1288',
    issn_online: '2663-1296',
    category: 'Media & Communication Studies',
    chief_editor: 'Dr. Aslam Dogar (Media Studies Dept, Lahore Leads University)',
    current_volume: 6,
    current_issue: 1,
    current_issue_title: 'Vol. 6 No. 1 (2026): Spring Edition',
    call_for_papers_title: 'Submissions open for AI in Journalism & Media Ethics',
    call_for_papers_deadline: '2026-11-05',
    call_for_papers_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Digital Journalism, Media Law, Misinformation Tracking, Political Communication, AI Generated Media',
    created_at: '2026-01-01'
  },
  {
    id: 12,
    title: 'Leads Journal of Pharmacy & Medical Biotechnology',
    short_code: 'LJ-PHARM',
    slug: 'lj-pharm',
    description: 'Peer-reviewed research in pharmacology, molecular therapeutics, clinical formulations, vaccine design, pharmacokinetics, and herbal medicine standardization.',
    cover_image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    banner_image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    issn_print: '2958-3011',
    issn_online: '2958-302X',
    category: 'Pharmacy & Medical Biotechnology',
    chief_editor: 'Prof. Dr. Kashif Ali (Faculty of Pharmacy, Lahore Leads University)',
    current_volume: 2,
    current_issue: 1,
    current_issue_title: 'Vol. 2 No. 1 (2026): Targeted Drug Delivery',
    call_for_papers_title: 'Call for Papers in Nanomedicine & Drug Delivery Systems',
    call_for_papers_deadline: '2026-12-15',
    call_for_papers_image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    scope_keywords: 'Pharmacokinetics, Drug Formulation, Nanomedicine, Pharmacology, Biotechnology',
    created_at: '2026-01-01'
  }
];

let mockUsers = [
  { id: 1, full_name: 'System Admin', email: 'admin@leads.edu.pk', password: 'password123', role: 'admin', organization: 'Lahore Leads University Board' },
  { id: 2, full_name: 'Ali Ahmed', email: 'student@leads.edu.pk', password: 'password123', role: 'student', organization: 'Lahore Leads University CS Dept' },
  { id: 3, full_name: 'John Malik', email: 'investor@venture.com', password: 'password123', role: 'investor', organization: 'Apex Tech Capital' },
  { id: 4, full_name: 'Sara Khan', email: 'attendee@gmail.com', password: 'password123', role: 'attendee', organization: 'Self' },
  { id: 5, full_name: 'Bazigh Minhas', email: 'bazighminhas1@gmail.com', password: 'password123', role: 'student', organization: 'Lahore Leads University Innovation Lab' },
  { id: 6, full_name: 'Bazigh Ali Minhas', email: 'bazighminhas2@gmail.com', password: 'password1234', role: 'student', organization: 'Department of Computer Science' },
  { id: 7, full_name: 'Dr. Sarah Vance', email: 'sarah@biohealthvc.com', password: 'password123', role: 'investor', organization: 'BioHealth VC' },
  { id: 8, full_name: 'Hamza Qureshi', email: 'hamza@fintechangels.com', password: 'password123', role: 'investor', organization: 'FinTech Angels' }
];

let mockArticles = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Ali Ahmed',
    journal_id: 1,
    volume: 1,
    issue: 2,
    page_numbers: '1-26',
    views_count: 342,
    title: 'AI Driven Solar Grid Optimization for Smart Cities',
    abstract: 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments with smart micro-grids.',
    full_text: '1. ABSTRACT & INTRODUCTION:\nRenewable energy integration in modern municipal infrastructures poses complex intermittency challenges. This paper implements an attention-based Transformer model forecasting solar radiation with 98.4% accuracy.\n\n2. METHODOLOGY & DATASET:\nCollected 4-year continuous telemetry from 120 photovoltaic stations in Lahore and Islamabad.\n\n3. RESULTS & COMMERCIALIZATION:\nDecreased grid strain by 34.2% during peak sunlight hours. Seed capital will be utilized for municipal hardware testing.',
    category: 'Artificial Intelligence & Clean Energy',
    pdf_url: 'solar_grid_ai.pdf',
    submission_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    publication_receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    presentation_receipt_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    plagiarism_score: 4,
    reviewer_notes: 'Excellent novelty, methodology is rigorously validated by external academic peer review. Awarded Platinum Tier.',
    admin_revision_notes: 'Paper is accepted in Vol 1 Issue 2 after thorough mathematical verification.',
    resubmission_count: 0,
    tier: 'Platinum',
    submission_fee_paid: true,
    publication_fee_paid: true,
    presentation_fee_paid: true,
    is_published: true,
    admin_unread: false,
    student_unread: false,
    status: 'Published',
    created_at: '2026-08-25'
  },
  {
    id: 2,
    student_id: 2,
    student_name: 'Ali Ahmed',
    journal_id: 5,
    volume: 5,
    issue: 2,
    page_numbers: '27-46',
    views_count: 218,
    title: 'Biocompatible Nanoparticles for Target Drug Delivery',
    abstract: 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted tumor cells without damaging surrounding tissue.',
    full_text: '1. ABSTRACT:\nTargeted oncological therapy using functionalized gold-lipid core nanoparticles.\n\n2. EXPERIMENTAL FINDINGS:\nAchieved 82% tumor localization in in-vitro assays with zero off-target hepatic degradation.',
    category: 'Biotechnology & Healthcare',
    pdf_url: 'nanoparticles.pdf',
    submission_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    publication_receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    presentation_receipt_url: '',
    plagiarism_score: 6,
    reviewer_notes: 'Good article. Excellent experimental validation in cellular models. Awarded Gold Tier.',
    admin_revision_notes: 'Approved for Volume 5 Issue 2 publication.',
    resubmission_count: 0,
    tier: 'Gold',
    submission_fee_paid: true,
    publication_fee_paid: true,
    presentation_fee_paid: false,
    is_published: true,
    admin_unread: false,
    student_unread: false,
    status: 'Published',
    created_at: '2026-08-28'
  },
  {
    id: 3,
    student_id: 5,
    student_name: 'Bazigh Minhas',
    journal_id: 1,
    volume: 1,
    issue: 2,
    page_numbers: '47-65',
    views_count: 495,
    title: 'Quantum Cryptography for Next-Gen Financial Banking',
    abstract: 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.',
    full_text: '1. EXECUTIVE ABSTRACT:\nQuantum computing threatens RSA-2048 encryption protocols. This research delivers Kyber-512 lattice key exchanges with sub-millisecond handshake latency.\n\n2. SECURITY PROOF:\nResistant against Shor algorithm attacks on post-quantum simulators.',
    category: 'Cybersecurity & Quantum Computing',
    pdf_url: 'quantum_banking.pdf',
    submission_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    publication_receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    presentation_receipt_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    plagiarism_score: 3,
    reviewer_notes: 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.',
    admin_revision_notes: 'Volume 1 Issue 2 feature article.',
    resubmission_count: 0,
    tier: 'Platinum',
    submission_fee_paid: true,
    publication_fee_paid: true,
    presentation_fee_paid: true,
    is_published: true,
    admin_unread: false,
    student_unread: false,
    status: 'Published',
    created_at: '2026-08-29'
  },
  {
    id: 4,
    student_id: 2,
    student_name: 'Ali Ahmed',
    journal_id: 1,
    volume: 1,
    issue: 2,
    page_numbers: '66-89',
    views_count: 184,
    title: 'Autonomous Agricultural Drones for Crop Yield Optimization',
    abstract: 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.',
    full_text: '1. ABSTRACT:\nCombines YOLOv8 with multispectral NDVI camera sensors to detect early stage pest infestations.\n\n2. AGRONOMIC TESTING:\nValidated over 500+ agricultural acres with 28% reduction in chemical pesticide wastage.',
    category: 'Robotics & AgriTech',
    pdf_url: 'agri_drones.pdf',
    submission_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    publication_receipt_url: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
    presentation_receipt_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
    plagiarism_score: 5,
    reviewer_notes: 'Identified minor errors in section 2 dataset. Please expand sample size and resubmit.',
    admin_revision_notes: 'Please expand the experimental dataset to 1000 acres as requested by peer reviewer.',
    resubmission_count: 1,
    tier: 'None',
    submission_fee_paid: true,
    publication_fee_paid: false,
    presentation_fee_paid: false,
    is_published: false,
    admin_unread: false,
    student_unread: true,
    status: 'Needs Revision',
    created_at: '2026-08-30'
  }
];

let mockConferences = [
  {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual summit bringing together university student innovators, academic evaluation boards, and venture capital investors.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium & Global HD Live Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 500.00,
    online_ticket_price: 200.00,
    presenting_students: 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Biocompatible Nanoparticles), Ali Ahmed (Agri Drones)',
    attending_investors: 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com), Hamza Qureshi (FinTech Angels - hamza@fintechangels.com)',
    status: 'Upcoming'
  }
];

let mockTickets = [
  {
    id: 1,
    user_id: 4,
    user_name: 'Sara Khan',
    conference_id: 1,
    ticket_type: 'onsite',
    seat_number: 'Row B - Seat #14',
    amount_paid: 50.00,
    ticket_code: 'TCK-ON-892147',
    event_date: '2026-09-15',
    event_time: '10:00 AM - 04:00 PM',
    venue: 'University Main Auditorium',
    payment_status: 'Paid',
    booked_at: '2026-08-30'
  }
];

let mockInvestorReviews = [
  {
    id: 1,
    investor_id: 3,
    investor_name: 'John Malik (Apex Tech Capital)',
    article_id: 1,
    article_title: 'AI Driven Solar Grid Optimization for Smart Cities',
    decision: 'Interested to Invest',
    benefit_for_country: 'High Economic Impact',
    comments: 'Great potential for municipal grid deployment. Willing to fund seed round of $50,000.',
    created_at: '2026-08-30'
  },
  {
    id: 2,
    investor_id: 6,
    investor_name: 'Dr. Sarah Vance (BioHealth VC)',
    article_id: 2,
    article_title: 'Biocompatible Nanoparticles for Target Drug Delivery',
    decision: 'Interested to Invest',
    benefit_for_country: 'Global Healthcare Advancement',
    comments: 'Highly scalable nanomedicine platform. Pledged $40,000 for clinical phase trial testing.',
    created_at: '2026-08-31'
  },
  {
    id: 3,
    investor_id: 7,
    investor_name: 'Hamza Qureshi (FinTech Angels)',
    article_id: 3,
    article_title: 'Quantum Cryptography for Next-Gen Financial Banking',
    decision: 'Interested to Invest',
    comments: 'Critical infrastructure protection for modern banking. Funding seed pledge of $35,000 approved.',
    created_at: '2026-09-01'
  }
];
let mockReviews = mockInvestorReviews;

let mockGallery = [
  {
    id: 1,
    conference_id: 1,
    title: 'Solar Grid AI Awarded Top Platinum Tier',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    featured_article_id: 1,
    investor_name: 'John Malik (Apex Tech Capital)',
    description: 'Student Ali Ahmed received $50,000 seed investment pledge during the live pitch session.'
  },
  {
    id: 2,
    conference_id: 1,
    title: 'Target Drug Delivery Nanomedicine Breakthrough',
    image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    featured_article_id: 2,
    investor_name: 'Dr. Sarah Vance (BioHealth VC)',
    description: 'Awarded Gold Tier for pioneering targeted drug delivery system reducing oncology side effects.'
  },
  {
    id: 3,
    conference_id: 1,
    title: 'Quantum Encryption for Next-Gen Banking',
    image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    featured_article_id: 3,
    investor_name: 'Hamza Qureshi (FinTech Angels)',
    description: 'Student Bazigh Minhas secured $35,000 seed funding for lattice quantum encryption algorithms.'
  },
  {
    id: 4,
    conference_id: 1,
    title: 'Autonomous Drone Crop Yield Optimization',
    image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    featured_article_id: 4,
    investor_name: 'GreenAgri Ventures Fund',
    description: 'Awarded Platinum Tier for computer vision autonomous drones optimizing crop yield across 500+ acres.'
  }
];

// Permanent Local Data Store (Ensures 100% data persistence even without MySQL)
const DATA_STORE_FILE = path.join(__dirname, '.data-store.json');

function loadPersistentDataStore() {
  try {
    if (fs.existsSync(DATA_STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DATA_STORE_FILE, 'utf8'));
      if (Array.isArray(parsed.mockArticles) && parsed.mockArticles.length > 0) mockArticles = parsed.mockArticles;
      if (Array.isArray(parsed.mockConferences) && parsed.mockConferences.length > 0) mockConferences = parsed.mockConferences;
      if (Array.isArray(parsed.mockUsers) && parsed.mockUsers.length > 0) mockUsers = parsed.mockUsers;
      if (Array.isArray(parsed.mockJournals) && parsed.mockJournals.length > 0) mockJournals = parsed.mockJournals;
      if (Array.isArray(parsed.mockTickets) && parsed.mockTickets.length > 0) mockTickets = parsed.mockTickets;
      if (Array.isArray(parsed.mockInvestorReviews) && parsed.mockInvestorReviews.length > 0) mockInvestorReviews = parsed.mockInvestorReviews;
      if (Array.isArray(parsed.mockPortalNotifications)) mockPortalNotifications = parsed.mockPortalNotifications;
      console.log('✅ [PERSISTENT STORE] Successfully loaded all saved articles, conferences & users from disk!');
    }
  } catch (e) {
    console.warn('⚠️ [PERSISTENT STORE] Load failed:', e.message);
  }
}

function savePersistentDataStore() {
  try {
    const data = {
      saved_at: new Date().toISOString(),
      mockArticles,
      mockConferences,
      mockUsers,
      mockJournals,
      mockTickets,
      mockInvestorReviews,
      mockPortalNotifications
    };
    fs.writeFileSync(DATA_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn('⚠️ [PERSISTENT STORE] Save failed:', e.message);
  }
}

// Auto-load existing saved data on server startup
loadPersistentDataStore();

// Helper Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}
function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!String(stored).startsWith('scrypt$')) return String(password) === String(stored); // legacy records
  try {
    const [, salt, expected] = String(stored).split('$');
    const actual = crypto.scryptSync(String(password), salt, 64);
    return crypto.timingSafeEqual(actual, Buffer.from(expected, 'hex'));
  } catch (_) { return false; }
}

// ================= AUTHENTICATION ENDPOINTS =================

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, role, organization } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password;
  const userRole = role || 'student';
  const userOrg = organization || 'University';

  if (isDbConnected) {
    try {
      const [existing] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const [result] = await db.query(
        'INSERT INTO users (full_name, email, password, role, organization) VALUES (?, ?, ?, ?, ?)',
        [full_name.trim(), cleanEmail, hashPassword(cleanPass), userRole, userOrg]
      );

      const userId = result.insertId;
      const token = jwt.sign({ id: userId, email: cleanEmail, role: userRole, full_name: full_name.trim() }, JWT_SECRET, { expiresIn: '1d' });

      // Keep mock synchronized
      mockUsers.push({ id: userId, full_name: full_name.trim(), email: cleanEmail, password: hashPassword(cleanPass), role: userRole, organization: userOrg });

      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: { id: userId, full_name: full_name.trim(), email: cleanEmail, role: userRole, organization: userOrg }
      });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  // Seamless Memory Fallback
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newUser = {
    id: mockUsers.length + 1,
    full_name: full_name.trim(),
    email: cleanEmail,
    password: hashPassword(cleanPass),
    role: userRole,
    organization: userOrg
  };

  mockUsers.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name }, JWT_SECRET, { expiresIn: '1d' });

  res.status(201).json({
    message: 'User registered successfully!',
    token,
    user: { id: newUser.id, full_name: newUser.full_name, email: newUser.email, role: newUser.role, organization: newUser.organization }
  });
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (rows.length > 0 && verifyPassword(cleanPass, rows[0].password)) {
        const user = rows[0];
        // Transparently upgrade legacy plain-text passwords after a successful login.
        if (!String(user.password || '').startsWith('scrypt$')) {
          db.query('UPDATE users SET password = ? WHERE id = ?', [hashPassword(cleanPass), user.id]).catch(() => {});
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization }
        });
      }
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  // Seamless Memory Fallback
  const user = mockUsers.find(u => u.email.toLowerCase() === cleanEmail && verifyPassword(cleanPass, u.password));
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '1d' });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization }
  });
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT id, full_name, email, role, organization FROM users WHERE id = ?', [req.user.id]);
      if (rows.length > 0) return res.json(rows[0]);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const user = mockUsers.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization });
});

// ================= JOURNALS ENDPOINTS =================

// Get all journals
app.get('/api/journals', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM journals ORDER BY id ASC');
      return res.json(rows);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }
  res.json(mockJournals);
});

// Get specific journal with articles
app.get('/api/journals/:identifier', async (req, res) => {
  const { identifier } = req.params;
  let journal = null;

  if (isDbConnected) {
    try {
      const isNum = !isNaN(identifier);
      let query = isNum ? 'SELECT * FROM journals WHERE id = ?' : 'SELECT * FROM journals WHERE LOWER(slug) = ? OR LOWER(short_code) = ?';
      let params = isNum ? [identifier] : [identifier.toLowerCase(), identifier.toLowerCase()];
      const [jRows] = await db.query(query, params);
      if (jRows.length > 0) {
        journal = jRows[0];
        const [artRows] = await db.query('SELECT * FROM articles WHERE journal_id = ? AND is_published = TRUE ORDER BY id DESC', [journal.id]);
        return res.json({ ...journal, articles: artRows });
      }
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  journal = mockJournals.find(j => j.id == identifier || j.slug.toLowerCase() === identifier.toLowerCase() || j.short_code.toLowerCase() === identifier.toLowerCase());
  if (!journal) {
    // Fallback to first journal if not found
    journal = mockJournals[0];
  }
  const publishedArts = mockArticles.filter(a => a.journal_id == journal.id && a.is_published);
  res.json({ ...journal, articles: publishedArts });
});

// Admin: Create New Journal
app.post('/api/admin/journals', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can create university journals' });
  }

  const {
    title, short_code, slug, description, cover_image, banner_image,
    issn_print, issn_online, category, chief_editor, current_volume, current_issue,
    current_issue_title, call_for_papers_title, call_for_papers_deadline, call_for_papers_image, scope_keywords
  } = req.body;

  if (!title || !short_code) {
    return res.status(400).json({ message: 'Journal title and short code are required' });
  }

  const generatedSlug = (slug || short_code).toLowerCase().replace(/[^a-z0-9]/g, '-');
  const now = new Date().toISOString().split('T')[0];

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO journals (title, short_code, slug, description, cover_image, banner_image, issn_print, issn_online, category, chief_editor, current_volume, current_issue, current_issue_title, call_for_papers_title, call_for_papers_deadline, call_for_papers_image, scope_keywords, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, short_code, generatedSlug, description || '', cover_image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
          banner_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          issn_print || '2709-1000', issn_online || '2709-2000', category || 'General Science', chief_editor || req.user.full_name,
          current_volume || 1, current_issue || 1, current_issue_title || 'Vol. 1 No. 1 (2026)',
          call_for_papers_title || `Call for Papers ${title} Vol 1 2026`, call_for_papers_deadline || '2026-12-31',
          call_for_papers_image || '', scope_keywords || '', now
        ]
      );
      const newJournal = {
        id: result.insertId, title, short_code, slug: generatedSlug, description, cover_image, banner_image,
        issn_print, issn_online, category, chief_editor, current_volume: current_volume || 1, current_issue: current_issue || 1,
        current_issue_title, call_for_papers_title, call_for_papers_deadline, call_for_papers_image, scope_keywords, created_at: now
      };
      mockJournals.push(newJournal);
      return res.status(201).json({ message: 'Journal created successfully!', journal: newJournal });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const newJournal = {
    id: Date.now(),
    title,
    short_code,
    slug: generatedSlug,
    description: description || '',
    cover_image: cover_image || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    banner_image: banner_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    issn_print: issn_print || '2709-1000',
    issn_online: issn_online || '2709-2000',
    category: category || 'General Science',
    chief_editor: chief_editor || req.user.full_name,
    current_volume: current_volume || 1,
    current_issue: current_issue || 1,
    current_issue_title: current_issue_title || 'Vol. 1 No. 1 (2026)',
    call_for_papers_title: call_for_papers_title || `Call for Papers ${title} Vol 1 2026`,
    call_for_papers_deadline: call_for_papers_deadline || '2026-12-31',
    call_for_papers_image: call_for_papers_image || '',
    scope_keywords: scope_keywords || '',
    created_at: now
  };

  mockJournals.push(newJournal);
  res.status(201).json({ message: 'Journal created successfully!', journal: newJournal });
});

// Admin: Update Journal
app.put('/api/admin/journals/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can modify university journals' });
  }

  const journalId = req.params.id;
  const updates = req.body;

  if (isDbConnected) {
    try {
      const keys = Object.keys(updates).filter(k => k !== 'id' && k !== 'articles');
      if (keys.length > 0) {
        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const values = keys.map(k => updates[k]);
        values.push(journalId);
        await db.query(`UPDATE journals SET ${setClause} WHERE id = ?`, values);
        const [updatedRows] = await db.query('SELECT * FROM journals WHERE id = ?', [journalId]);
        return res.json({ message: 'Journal updated successfully!', journal: updatedRows[0] });
      }
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const journal = mockJournals.find(j => j.id == journalId);
  if (!journal) return res.status(404).json({ message: 'Journal not found' });
  Object.assign(journal, updates);
  res.json({ message: 'Journal updated successfully!', journal });
});

// Admin: Delete Journal
app.delete('/api/admin/journals/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only administrators can delete journals' });
  }

  const journalId = req.params.id;
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM journals WHERE id = ?', [journalId]);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }
  const idx = mockJournals.findIndex(j => j.id == journalId);
  if (idx !== -1) mockJournals.splice(idx, 1);
  res.json({ message: 'Journal deleted successfully!' });
});

// ================= ARTICLE & REVIEW ENDPOINTS =================

// Get Articles (with optional student_id and journal_id filters)
app.get('/api/articles', async (req, res) => {
  const { student_id, journal_id } = req.query;

  if (isDbConnected) {
    try {
      let query = `
        SELECT a.*, j.title AS journal_title, j.short_code AS journal_code, j.slug AS journal_slug
        FROM articles a
        LEFT JOIN journals j ON a.journal_id = j.id
      `;
      let conditions = [];
      let params = [];
      if (student_id) {
        conditions.push('a.student_id = ?');
        params.push(student_id);
      }
      if (journal_id) {
        conditions.push('a.journal_id = ?');
        params.push(journal_id);
      }
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY a.id DESC';
      const [rows] = await db.query(query, params);
      return res.json(rows);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  let list = mockArticles.map(art => {
    const j = mockJournals.find(item => item.id == art.journal_id);
    return {
      ...art,
      journal_title: j ? j.title : 'Robotics and Artificial Intelligence Review',
      journal_code: j ? j.short_code : 'RAIR',
      journal_slug: j ? j.slug : 'rair'
    };
  });

  if (student_id) {
    list = list.filter(a => a.student_id == student_id);
  }
  if (journal_id) {
    list = list.filter(a => a.journal_id == journal_id);
  }
  res.json(list);
});

// Google Drive Image Stream Proxy Endpoint (Bypasses any browser CORS / auth blockers)
app.get('/api/drive-proxy/:fileId', async (req, res) => {
  const { fileId } = req.params;
  if (!fileId) return res.status(400).send('File ID is required');

  try {
    // 1. First attempt: High-speed Google UserContent CDN
    const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}`;
    const response = await axios.get(lh3Url, { responseType: 'stream', timeout: 10000 });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return response.data.pipe(res);
  } catch (err) {
    console.warn(`[DRIVE PROXY] lh3 attempt failed for ${fileId}:`, err.message);
    try {
      // 2. Second attempt: Google Drive export view
      const ucUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      const response = await axios.get(ucUrl, { responseType: 'stream', timeout: 10000 });
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      return response.data.pipe(res);
    } catch (err2) {
      console.warn(`[DRIVE PROXY] uc attempt failed for ${fileId}:`, err2.message);
      try {
        // 3. Third attempt: Google Drive thumbnail
        const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
        const response = await axios.get(thumbUrl, { responseType: 'stream', timeout: 10000 });
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        return response.data.pipe(res);
      } catch (err3) {
        console.warn(`[DRIVE PROXY] thumbnail attempt failed for ${fileId}:`, err3.message);
        return res.status(404).send('Drive image not found or restricted');
      }
    }
  }
});

// Submit New Article (Student) - Linked to Journal
app.post('/api/articles', authenticateToken, async (req, res) => {
  const { journal_id, title, abstract, full_text, category, pdf_url, submission_receipt_url, sender_bank, transaction_id, sender_mobile } = req.body;
  if (!title || !abstract) return res.status(400).json({ message: 'Title and abstract are required' });

  const selectedJournalId = journal_id || 1;
  const plagiarism_score = null; // No fake score: integrate a real plagiarism provider before populating this field.
  const created_at = new Date().toISOString().split('T')[0];
  const text = full_text || abstract;

  // Upload complete student manuscript & challan package to student-named Google Drive folder
  const drivePkg = await uploadStudentArticlePackage({
    student: req.user,
    article: { title, abstract, full_text: text, category },
    submissionReceiptBase64: submission_receipt_url,
    pdfBase64: pdf_url,
    senderBank: sender_bank,
    transactionId: transaction_id,
    senderMobile: sender_mobile
  });

  const cleanReceipt = drivePkg.challanUrl || submission_receipt_url || '';
  const cleanPdf = drivePkg.pdfUrl || pdf_url || 'default.pdf';

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO articles (student_id, student_name, journal_id, volume, issue, page_numbers, views_count, title, abstract, full_text, category, pdf_url, submission_receipt_url, sender_bank, transaction_id, sender_mobile, plagiarism_score, reviewer_notes, admin_revision_notes, resubmission_count, tier, submission_fee_paid, publication_fee_paid, presentation_fee_paid, is_published, admin_unread, student_unread, status, created_at)
         VALUES (?, ?, ?, 1, 1, '1-10', 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Under review by journal committee.', '', 0, 'None', TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Submitted - Awaiting Review', ?)`,
        [req.user.id, req.user.full_name, selectedJournalId, title, abstract, text, category || 'General', cleanPdf || 'default.pdf', cleanReceipt, sender_bank, transaction_id, sender_mobile, plagiarism_score, created_at]
      );
      
      const [insertedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [result.insertId]);
      const newArticle = (insertedRows && insertedRows.length > 0) ? insertedRows[0] : {
        id: result.insertId, student_id: req.user.id, student_name: req.user.full_name, journal_id: selectedJournalId,
        volume: 1, issue: 1, page_numbers: '1-10', views_count: 1, title, abstract, full_text: text, category: category || 'General',
        pdf_url: cleanPdf || 'default.pdf', submission_receipt_url: cleanReceipt, submission_fee_paid: true, plagiarism_score,
        status: 'Submitted - Awaiting Review', created_at, sender_bank, transaction_id, sender_mobile
      };

      
      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyNewArticleSubmission({
        student: req.user,
        article: newArticle,
        senderBank: sender_bank,
        transactionId: transaction_id,
        senderMobile: sender_mobile
      }).catch(err => console.error('Notification dispatch error:', err));
      createPortalNotification({ roleTarget: 'admin', type: 'article_submitted', title: 'New article submitted', message: `${req.user.full_name} submitted “${newArticle.title}” with payment proof.`, link: `/admin/review/${newArticle.id}` });
      createPortalNotification({ userId: req.user.id, type: 'article_submitted', title: 'Submission received', message: `Your article “${newArticle.title}” was submitted successfully and is awaiting admin review.`, link: `/student/paper/${newArticle.id}` });

      return res.status(201).json({ message: 'Article submitted to Journal with challan payment proof!', article: newArticle });
    } catch (err) {
      console.error('MySQL insert error:', err);
      console.error('DB operation error:', err.message);
    }
  }

  const newArticle = {
    id: Date.now(),
    student_id: req.user.id,
    student_name: req.user.full_name,
    journal_id: Number(selectedJournalId),
    volume: 1,
    issue: 1,
    page_numbers: '1-10',
    views_count: 1,
    title,
    abstract,
    full_text: text,
    category: category || 'General',
    pdf_url: cleanPdf || 'default.pdf',
    submission_receipt_url: cleanReceipt,
    sender_bank,
    transaction_id,
    sender_mobile,
    plagiarism_score,
    reviewer_notes: 'Under review by journal editorial board.',
    admin_revision_notes: '',
    resubmission_count: 0,
    tier: 'None',
    submission_fee_paid: true,
    publication_fee_paid: false,
    presentation_fee_paid: false,
    is_published: false,
    admin_unread: true,
    student_unread: false,
    status: 'Submitted - Awaiting Review',
    created_at
  };

  mockArticles.unshift(newArticle);
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();

  createPortalNotification({ roleTarget: 'admin', type: 'article_submitted', title: 'New article submitted', message: `${req.user.full_name || 'Student'} submitted “${newArticle.title}” with payment proof.`, link: `/admin/review/${newArticle.id}` });
  createPortalNotification({ userId: req.user.id, type: 'article_submitted', title: 'Submission received', message: `Your article “${newArticle.title}” was submitted successfully and is awaiting admin review.`, link: `/student/paper/${newArticle.id}` });

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyNewArticleSubmission({
    student: req.user,
    article: newArticle,
    senderBank: sender_bank,
    transactionId: transaction_id,
    senderMobile: sender_mobile
  }).catch(err => console.error('Notification dispatch error:', err));

  res.status(201).json({ message: 'Article submitted to Journal with challan payment proof!', article: newArticle });
});

// Admin Route: Request Revisions / Mistakes Feedback from Student
app.post('/api/articles/:id/request-revision', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin / Reviewers can request revisions' });
  }

  const articleId = req.params.id;
  const { revision_notes, reviewer_notes, plagiarism_score } = req.body;

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET admin_revision_notes = ?, reviewer_notes = COALESCE(?, reviewer_notes), plagiarism_score = COALESCE(?, plagiarism_score), status = "Needs Revision", admin_unread = FALSE, student_unread = TRUE WHERE id = ?',
        [revision_notes || reviewer_notes, reviewer_notes, plagiarism_score, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Revision feedback sent to student!', article: updatedRows[0] });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (!article) return res.status(404).json({ message: 'Article not found' });

  article.admin_revision_notes = revision_notes || reviewer_notes || 'Please revise your manuscript according to reviewer comments.';
  if (reviewer_notes) article.reviewer_notes = reviewer_notes;
  if (plagiarism_score !== undefined) article.plagiarism_score = plagiarism_score;
  article.status = 'Needs Revision';
  article.admin_unread = false;
  article.student_unread = true;

  res.json({ message: 'Revision feedback sent to student!', article });
});

// Student Route: Resubmit Revised Manuscript with Corrections
app.post('/api/articles/:id/resubmit', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { title, abstract, full_text, pdf_url, revision_response } = req.body;

  // Offload revised PDF to Google Drive
  const cleanPdf = await resolveDriveUrl(pdf_url, 'Research_Papers_Revisions', 'revised_paper');

  if (isDbConnected) {
    try {
      await db.query(
        `UPDATE articles
         SET title = COALESCE(?, title),
             abstract = COALESCE(?, abstract),
             full_text = COALESCE(?, full_text),
             pdf_url = COALESCE(?, pdf_url),
             resubmission_count = resubmission_count + 1,
             status = "Resubmitted - Awaiting Review",
             admin_unread = TRUE,
             student_unread = FALSE
         WHERE id = ? AND student_id = ?`,
        [title, abstract, full_text, cleanPdf, articleId, req.user.id]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);

      notifyArticleResubmitted({
        student: req.user,
        article: updatedRows[0]
      }).catch(err => console.error('Notification dispatch error:', err));

      return res.json({ message: 'Revised manuscript resubmitted to Editorial Board!', article: updatedRows[0] });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  if (article) {
    if (title) article.title = title;
    if (abstract) article.abstract = abstract;
    if (full_text) article.full_text = full_text;
    if (cleanPdf) article.pdf_url = cleanPdf;
    article.resubmission_count = (article.resubmission_count || 0) + 1;
    article.status = 'Resubmitted - Awaiting Review';
    article.admin_unread = true;
    article.student_unread = false;
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }

  notifyArticleResubmitted({
    student: req.user,
    article: article || { id: articleId, title }
  }).catch(err => console.error('Notification dispatch error:', err));

  res.json({ message: 'Revised manuscript resubmitted to Editorial Board!', article });
});

// Admin Review & Grading Endpoint
app.put('/api/articles/:id/review', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can grade articles' });

  const articleId = req.params.id;
  const { tier, plagiarism_score, reviewer_notes, admin_revision_notes, status, is_published, volume, issue, page_numbers } = req.body;

  if (isDbConnected) {
    try {
      await db.query(
        `UPDATE articles
         SET tier = COALESCE(?, tier),
             plagiarism_score = COALESCE(?, plagiarism_score),
             reviewer_notes = COALESCE(?, reviewer_notes),
             admin_revision_notes = COALESCE(?, admin_revision_notes),
             status = COALESCE(?, status),
             is_published = COALESCE(?, is_published),
             volume = COALESCE(?, volume),
             issue = COALESCE(?, issue),
             page_numbers = COALESCE(?, page_numbers),
             admin_unread = FALSE,
             student_unread = TRUE
         WHERE id = ?`,
        [tier, plagiarism_score, reviewer_notes, admin_revision_notes, status, is_published, volume, issue, page_numbers, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      const reviewed = updatedRows[0];
      if (reviewed) createPortalNotification({ userId: reviewed.student_id, type: 'article_review', title: 'Article review updated', message: `Your article “${reviewed.title}” status is now: ${reviewed.status}.`, link: `/student/paper/${reviewed.id}` });
      return res.json({ message: 'Article review submitted by Admin!', article: reviewed });
    } catch (err) {
      console.error('MySQL Admin Review Error:', err);
      console.error('DB operation error:', err.message);
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (!article) return res.status(404).json({ message: 'Article not found' });

  if (tier !== undefined) article.tier = tier;
  if (plagiarism_score !== undefined) article.plagiarism_score = plagiarism_score;
  if (reviewer_notes !== undefined) article.reviewer_notes = reviewer_notes;
  if (admin_revision_notes !== undefined) article.admin_revision_notes = admin_revision_notes;
  if (status !== undefined) article.status = status;
  if (is_published !== undefined) article.is_published = is_published;
  if (volume !== undefined) article.volume = volume;
  if (issue !== undefined) article.issue = issue;
  if (page_numbers !== undefined) article.page_numbers = page_numbers;
  article.admin_unread = false;
  article.student_unread = true;
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  createPortalNotification({ userId: article.student_id, type: 'article_review', title: 'Article review updated', message: `Your article “${article.title}” status is now: ${article.status}.`, link: `/student/paper/${article.id}` });

  res.json({ message: 'Article review submitted by Admin!', article });
});

// Student Route: Pay Publication Fee & Upload Screenshot Proof
app.post('/api/articles/:id/pay-publication', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, publication_receipt_url, sender_bank, transaction_id, sender_mobile } = req.body;

  const rawReceipt = publication_receipt_url || receipt_url;
  if (!rawReceipt) return res.status(400).json({ message: 'Publication payment proof is required' });
  const receipt = await resolveDriveUrl(rawReceipt, 'Publication_Receipts', 'pub_receipt');


  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET publication_fee_paid = TRUE, publication_receipt_url = ?, sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Pub Fee Paid - Verify & Publish", admin_unread = TRUE, student_unread = FALSE WHERE id = ?',
        [receipt, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);

      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyPublicationFeePaid({
        student: req.user,
        article: updatedRows[0],
        senderBank: sender_bank,
        transactionId: transaction_id,
        senderMobile: sender_mobile
      }).catch(err => console.error('Notification dispatch error:', err));
      createPortalNotification({ roleTarget: 'admin', type: 'payment', title: 'Publication fee proof received', message: `Payment proof for “${updatedRows[0]?.title || 'article'}” is ready for verification.`, link: `/admin/review/${articleId}` });
      createPortalNotification({ userId: req.user.id, type: 'payment', title: 'Payment proof submitted', message: 'Your publication fee proof has been submitted and is awaiting verification.', link: `/student/paper/${articleId}` });

      return res.json({ message: 'Publication fee challan proof submitted! Admin will verify and publish.', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error recording publication receipt' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    article.publication_fee_paid = true;
    article.publication_receipt_url = receipt;
    if (sender_bank) article.sender_bank = sender_bank;
    if (transaction_id) article.transaction_id = transaction_id;
    if (sender_mobile) article.sender_mobile = sender_mobile;
    article.status = 'Pub Fee Paid - Verify & Publish';
    article.admin_unread = true;
    article.student_unread = false;
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyPublicationFeePaid({
    student: req.user,
    article: article || { id: articleId },
    senderBank: sender_bank,
    transactionId: transaction_id,
    senderMobile: sender_mobile
  }).catch(err => console.error('Notification dispatch error:', err));

  res.json({ message: 'Publication fee challan proof submitted! Admin will verify and publish.', article });
});

// Admin Route: Verify Payment Proof & Publish Live to Main Site
app.put('/api/articles/:id/publish', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can publish articles to main website' });
  }

  const articleId = req.params.id;
  const { is_published, volume, issue, page_numbers, journal_id, doi } = req.body;
  const pubState = is_published !== undefined ? is_published : true;
  const newStatus = pubState ? 'Published' : 'Approved - Awaiting Publication Fee';
  const autoDoi = doi || `10.5281/leads.2026.${articleId.toString().padStart(4, '0')}`;

  if (isDbConnected) {
    try {
      await db.query(
        `UPDATE articles
         SET is_published = ?,
             status = ?,
             volume = COALESCE(?, volume),
             issue = COALESCE(?, issue),
             page_numbers = COALESCE(?, page_numbers),
             journal_id = COALESCE(?, journal_id),
             doi = COALESCE(?, doi),
             admin_unread = FALSE,
             student_unread = TRUE
         WHERE id = ?`,
        [pubState ? 1 : 0, newStatus, volume, issue, page_numbers, journal_id, autoDoi, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      
      if (pubState && updatedRows[0]) {
        notifyArticlePublished({ article: updatedRows[0], adminUser: req.user }).catch(err => console.error('Notification dispatch error:', err));
        createPortalNotification({ userId: updatedRows[0].student_id, type: 'published', title: 'Your article is published', message: `“${updatedRows[0].title}” is now live in the journal portal.`, link: `/article/${updatedRows[0].id}` });
      }

      return res.json({ message: `Article ${pubState ? 'verified & published to' : 'un-published from'} main site!`, article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error updating article publish status' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    article.is_published = pubState;
    article.status = newStatus;
    if (volume !== undefined) article.volume = volume;
    if (issue !== undefined) article.issue = issue;
    if (page_numbers !== undefined) article.page_numbers = page_numbers;
    if (journal_id !== undefined) article.journal_id = Number(journal_id);
    article.doi = autoDoi;
    article.admin_unread = false;
    article.student_unread = true;
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }

  if (pubState && article) {
    notifyArticlePublished({ article, adminUser: req.user }).catch(err => console.error('Notification dispatch error:', err));
  }

  res.json({ message: `Article ${pubState ? 'verified & published to' : 'un-published from'} main site!`, article });
});

// Delete Article Submission (Admin or Author Student)
app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  if (isDbConnected) {
    try {
      if (req.user.role === 'admin') {
        await db.query('DELETE FROM articles WHERE id = ?', [articleId]);
      } else {
        await db.query('DELETE FROM articles WHERE id = ? AND student_id = ?', [articleId, req.user.id]);
      }
    } catch (err) {
      console.error('MySQL article deletion error:', err.message);
    }
  }

  const idx = mockArticles.findIndex(a => a.id == articleId && (req.user.role === 'admin' || a.student_id == req.user.id));
  if (idx !== -1) {
    mockArticles.splice(idx, 1);
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }

  res.json({ message: 'Article deleted successfully' });
});

// Student Route: Apply for Conference Presentation & Upload Presentation Receipt Proof
app.post('/api/articles/:id/apply-conference', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, presenting_students_list, sender_bank, transaction_id, sender_mobile } = req.body;

  const rawReceipt = receipt_url || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';
  const receipt = await resolveDriveUrl(rawReceipt, 'Conference_Presentation_Receipts', 'pres_receipt');


  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET presentation_fee_paid = TRUE, presentation_receipt_url = ?, presenting_students_list = COALESCE(?, presenting_students_list), sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Presentation Scheduled", admin_unread = TRUE, student_unread = FALSE WHERE id = ?',
        [receipt, presenting_students_list, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);

      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyPresentationFeePaid({
        student: req.user,
        article: updatedRows[0],
        presentingList: presenting_students_list,
        senderBank: sender_bank,
        transactionId: transaction_id,
        senderMobile: sender_mobile
      }).catch(err => console.error('Notification dispatch error:', err));

      createPortalNotification({ roleTarget: 'admin', type: 'conference_presentation', title: 'Conference presentation fee received', message: `${req.user.full_name || 'Student'} paid conference presentation fee for “${updatedRows[0]?.title || 'article'}”.`, link: `/admin/conference` });
      createPortalNotification({ userId: req.user.id, type: 'conference_presentation', title: 'Conference presentation scheduled', message: 'Your presentation slot fee has been submitted successfully.', link: `/student` });

      return res.json({ message: 'Conference presentation fee receipt submitted! Scheduled for pitch.', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error recording presentation application' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    article.presentation_fee_paid = true;
    article.presentation_receipt_url = receipt;
    if (presenting_students_list) article.presenting_students_list = presenting_students_list;
    if (sender_bank) article.sender_bank = sender_bank;
    if (transaction_id) article.transaction_id = transaction_id;
    if (sender_mobile) article.sender_mobile = sender_mobile;
    article.status = 'Presentation Scheduled';
    article.admin_unread = true;
    article.student_unread = false;
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }

  createPortalNotification({ roleTarget: 'admin', type: 'conference_presentation', title: 'Conference presentation fee received', message: `${req.user.full_name || 'Student'} paid conference presentation fee for “${article?.title || 'article'}”.`, link: `/admin/conference` });

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyPresentationFeePaid({
    student: req.user,
    article: article || { id: articleId },
    presentingList: presenting_students_list,
    senderBank: sender_bank,
    transactionId: transaction_id,
    senderMobile: sender_mobile
  }).catch(err => console.error('Notification dispatch error:', err));

  res.json({ message: 'Conference presentation fee receipt submitted! Scheduled for pitch.', article });
});

// Mark Notification as Read
app.put('/api/articles/:id/mark-read', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { role } = req.user;

  if (isDbConnected) {
    try {
      if (role === 'admin') {
        await db.query('UPDATE articles SET admin_unread = FALSE WHERE id = ?', [articleId]);
      } else {
        await db.query('UPDATE articles SET student_unread = FALSE WHERE id = ?', [articleId]);
      }
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Notification cleared', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error marking as read' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    if (role === 'admin') article.admin_unread = false;
    else article.student_unread = false;
  }
  res.json({ message: 'Notification cleared', article });
});

// ================= INVESTOR & CONFERENCE ENDPOINTS =================

// Get Registered Investors list (for dropdowns)
app.get('/api/admin/investors', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT id, full_name, email, role, organization, created_at FROM users WHERE role = "investor"');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Investors Error:', err);
    }
  }

  const investors = mockUsers.filter(u => u.role === 'investor');
  res.json(investors);
});

// Admin Route: Create Investor Account
app.post('/api/admin/create-investor', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can create Investor credentials' });
  }

  const { full_name, email, password, organization } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password for Investor' });
  }

  const investorOrg = organization || 'Venture Capital Fund';

  if (isDbConnected) {
    try {
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const [result] = await db.query(
        'INSERT INTO users (full_name, email, password, role, organization) VALUES (?, ?, ?, "investor", ?)',
        [full_name, email, password, investorOrg]
      );

      return res.status(201).json({
        message: 'Investor account created successfully by Admin!',
        investor: { id: result.insertId, full_name, email, role: 'investor', organization: investorOrg }
      });
    } catch (err) {
      console.error('MySQL Admin Create Investor Error:', err);
      return res.status(500).json({ message: 'Database error creating investor' });
    }
  }

  const newInvestor = {
    id: mockUsers.length + 1,
    full_name,
    email,
    password,
    role: 'investor',
    organization: investorOrg
  };
  mockUsers.push(newInvestor);

  res.status(201).json({
    message: 'Investor account created successfully by Admin!',
    investor: newInvestor
  });
});

// Admin Route: Update Investor Details
app.put('/api/admin/investors/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can update Investor accounts' });
  }

  const investorId = req.params.id;
  const { full_name, email, organization, password } = req.body;

  if (isDbConnected) {
    try {
      if (password && password.trim()) {
        await db.query(
          'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), organization = COALESCE(?, organization), password = ? WHERE id = ? AND role = "investor"',
          [full_name, email, organization, password.trim(), investorId]
        );
      } else {
        await db.query(
          'UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), organization = COALESCE(?, organization) WHERE id = ? AND role = "investor"',
          [full_name, email, organization, investorId]
        );
      }
      const [rows] = await db.query('SELECT id, full_name, email, role, organization, created_at FROM users WHERE id = ?', [investorId]);
      return res.json({ message: 'Investor account updated successfully!', investor: rows[0] });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const investor = mockUsers.find(u => u.id == investorId && u.role === 'investor');
  if (!investor) return res.status(404).json({ message: 'Investor not found' });

  if (full_name) investor.full_name = full_name;
  if (email) investor.email = email;
  if (organization) investor.organization = organization;
  if (password && password.trim()) investor.password = password.trim();

  res.json({ message: 'Investor account updated successfully!', investor });
});

// Admin Route: Reset Investor Password
app.put('/api/admin/investors/:id/reset-password', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can reset investor passwords' });
  }

  const investorId = req.params.id;
  const { new_password } = req.body;
  const passToSet = new_password || `Pass#${Math.floor(100000 + Math.random() * 900000)}`;

  if (isDbConnected) {
    try {
      await db.query('UPDATE users SET password = ? WHERE id = ? AND role = "investor"', [passToSet, investorId]);
      return res.json({ message: 'Password reset successfully!', newPassword: passToSet });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const investor = mockUsers.find(u => u.id == investorId && u.role === 'investor');
  if (!investor) return res.status(404).json({ message: 'Investor not found' });
  investor.password = passToSet;

  res.json({ message: 'Password reset successfully!', newPassword: passToSet, investor });
});

// Admin Route: Delete Investor
app.delete('/api/admin/investors/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can delete investor accounts' });
  }

  const investorId = req.params.id;
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM users WHERE id = ? AND role = "investor"', [investorId]);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  mockUsers = mockUsers.filter(u => !(u.id == investorId && u.role === 'investor'));
  res.json({ message: 'Investor account removed permanently!' });
});

// Admin Route: Delete Conference
app.delete('/api/admin/conferences/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can delete conferences' });
  }

  const confId = req.params.id;
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM conferences WHERE id = ?', [confId]);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  mockConferences = mockConferences.filter(c => c.id != confId);
  res.json({ message: 'Conference removed permanently!' });
});

// Admin Route: Delete Article
app.delete('/api/admin/articles/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can delete articles' });
  }

  const artId = req.params.id;
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM articles WHERE id = ?', [artId]);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  mockArticles = mockArticles.filter(a => a.id != artId);
  res.json({ message: 'Article removed permanently!' });
});

// Admin Route: Create New Conference
app.post('/api/admin/conferences', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can create conferences' });
  }

  const {
    title,
    description,
    cover_image,
    event_date,
    event_time,
    venue,
    stream_link,
    presenting_students,
    attending_investors,
    status,
    onsite_ticket_price,
    online_ticket_price
  } = req.body;

  const confTitle = title || 'Annual Innovation & Research Conference';
  const confDesc = description || 'Academic research conference & venture pitch summit';
  const confCover = cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
  const confDate = event_date || '2026-10-15';
  const confTime = event_time || '10:00 AM - 04:00 PM';
  const confVenue = venue || 'University Main Auditorium';
  const confStream = stream_link || 'https://meet.google.com/xyz-conference-stream';
  const confPresenters = presenting_students || '';
  const confInvestors = attending_investors || '';
  const confStatus = status || 'Upcoming';
  const confOnsitePrice = onsite_ticket_price !== undefined ? onsite_ticket_price : 500.00;
  const confOnlinePrice = online_ticket_price !== undefined ? online_ticket_price : 200.00;

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        'INSERT INTO conferences (title, description, cover_image, event_date, event_time, venue, stream_link, presenting_students, attending_investors, status, onsite_ticket_price, online_ticket_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [confTitle, confDesc, confCover, confDate, confTime, confVenue, confStream, confPresenters, confInvestors, confStatus, confOnsitePrice, confOnlinePrice]
      );

      const [newConfRows] = await db.query('SELECT * FROM conferences WHERE id = ?', [result.insertId]);
      const createdConf = newConfRows[0] || { id: result.insertId, title: confTitle, event_date: confDate, venue: confVenue };

      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyConferencePublished({ conference: createdConf, adminUser: req.user }).catch(err => console.error('Conference notification dispatch error:', err));
      notifyAllStudents({ type: 'conference', title: 'New conference published', message: `${createdConf.title} has been published for ${createdConf.event_date}.`, link: '/conferences' });

      return res.status(201).json({ message: 'New conference created and published live!', conference: createdConf });
    } catch (err) {
      console.error('MySQL Admin Create Conference Error:', err);
    }
  }

  const newConf = {
    id: mockConferences.length + 1,
    title: confTitle,
    description: confDesc,
    cover_image: confCover,
    event_date: confDate,
    event_time: confTime,
    venue: confVenue,
    stream_link: confStream,
    presenting_students: confPresenters,
    attending_investors: confInvestors,
    status: confStatus,
    onsite_ticket_price: confOnsitePrice,
    online_ticket_price: confOnlinePrice
  };

  mockConferences.unshift(newConf);
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyConferencePublished({ conference: newConf, adminUser: req.user }).catch(err => console.error('Conference notification dispatch error:', err));
  notifyAllStudents({ type: 'conference', title: 'New conference published', message: `${newConf.title} has been published for ${newConf.event_date}.`, link: '/conferences' });

  res.status(201).json({ message: 'New conference created and published live!', conference: newConf });
});

// Fallback direct POST route
app.post('/api/conferences', authenticateToken, async (req, res) => {
  // Delegate to same handler
  req.url = '/api/admin/conferences';
  app._router.handle(req, res);
});

// Admin Route: Edit Conference Schedule, Cover Image, Presenting Students & Attending Investors
app.put('/api/admin/conferences/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can update conference details' });
  }

  const confId = req.params.id;
  const { title, description, cover_image, event_date, event_time, venue, stream_link, presenting_students, attending_investors, status, onsite_ticket_price, online_ticket_price } = req.body;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      if (rows.length === 0) return res.status(404).json({ message: 'Conference not found' });

      const current = rows[0];
      const updatedTitle = title || current.title;
      const updatedDesc = description || current.description;
      const updatedCover = cover_image || current.cover_image;
      const updatedDate = event_date || current.event_date;
      const updatedTime = event_time || current.event_time;
      const updatedVenue = venue || current.venue;
      const updatedStream = stream_link || current.stream_link;
      const updatedStudents = presenting_students !== undefined ? presenting_students : current.presenting_students;
      const updatedInvestors = attending_investors !== undefined ? attending_investors : current.attending_investors;
      const updatedStatus = status || current.status;
      const updatedOnsitePrice = onsite_ticket_price !== undefined ? onsite_ticket_price : (current.onsite_ticket_price || 500.00);
      const updatedOnlinePrice = online_ticket_price !== undefined ? online_ticket_price : (current.online_ticket_price || 200.00);

      await db.query(
        'UPDATE conferences SET title = ?, description = ?, cover_image = ?, event_date = ?, event_time = ?, venue = ?, stream_link = ?, presenting_students = ?, attending_investors = ?, status = ?, onsite_ticket_price = ?, online_ticket_price = ? WHERE id = ?',
        [updatedTitle, updatedDesc, updatedCover, updatedDate, updatedTime, updatedVenue, updatedStream, updatedStudents, updatedInvestors, updatedStatus, updatedOnsitePrice, updatedOnlinePrice, confId]
      );

      const [updatedRows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      const savedConf = updatedRows[0];

      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyConferencePublished({ conference: savedConf, adminUser: req.user }).catch(err => console.error('Conference notification dispatch error:', err));
      notifyAllStudents({ type: 'conference', title: `🎤 Conference Scheduled: ${savedConf.title}`, message: `Event date: ${savedConf.event_date} (${savedConf.event_time || '10:00 AM - 04:00 PM'}) at ${savedConf.venue || 'University Main Auditorium'}.`, link: '/conferences' });

      return res.json({ message: 'Conference details published to main site!', conference: savedConf });
    } catch (err) {
      console.error('MySQL Admin Edit Conference Error:', err);
      // If columns missing, fallback gracefully
      try {
        await db.query(
          'UPDATE conferences SET title = ?, description = ?, cover_image = ?, event_date = ?, event_time = ?, venue = ?, stream_link = ?, presenting_students = ?, attending_investors = ?, status = ? WHERE id = ?',
          [title, description, cover_image, event_date, event_time, venue, stream_link, presenting_students, attending_investors, status, confId]
        );
        const [updatedRows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
        const savedConf = updatedRows[0];

        notifyConferencePublished({ conference: savedConf, adminUser: req.user }).catch(err => console.error('Conference notification dispatch error:', err));
        notifyAllStudents({ type: 'conference', title: `🎤 Conference Scheduled: ${savedConf.title}`, message: `Event date: ${savedConf.event_date} (${savedConf.event_time || '10:00 AM - 04:00 PM'}) at ${savedConf.venue || 'University Main Auditorium'}.`, link: '/conferences' });

        return res.json({ message: 'Conference details published to main site!', conference: savedConf });
      } catch (fallbackErr) {
        return res.status(500).json({ message: 'Database error updating conference' });
      }
    }
  }

  const conf = mockConferences.find(c => c.id == confId);
  if (!conf) return res.status(404).json({ message: 'Conference not found' });

  if (title) conf.title = title;
  if (description) conf.description = description;
  if (cover_image) conf.cover_image = cover_image;
  if (event_date) conf.event_date = event_date;
  if (event_time) conf.event_time = event_time;
  if (venue) conf.venue = venue;
  if (stream_link) conf.stream_link = stream_link;
  if (presenting_students !== undefined) conf.presenting_students = presenting_students;
  if (attending_investors !== undefined) conf.attending_investors = attending_investors;
  if (status) conf.status = status;
  if (onsite_ticket_price !== undefined) conf.onsite_ticket_price = onsite_ticket_price;
  if (online_ticket_price !== undefined) conf.online_ticket_price = online_ticket_price;
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyConferencePublished({ conference: conf, adminUser: req.user }).catch(err => console.error('Conference notification dispatch error:', err));
  notifyAllStudents({ type: 'conference', title: `🎤 Conference Scheduled: ${conf.title}`, message: `Event date: ${conf.event_date} (${conf.event_time || '10:00 AM - 04:00 PM'}) at ${conf.venue || 'University Main Auditorium'}.`, link: '/conferences' });

  res.json({ message: 'Conference details published to main site!', conference: conf });
});

// Fallback PUT /api/conferences/:id route
app.put('/api/conferences/:id', authenticateToken, async (req, res) => {
  req.url = `/api/admin/conferences/${req.params.id}`;
  app._router.handle(req, res);
});

// ================= ADMIN USER CRUD =================
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can manage users' });
  if (isDbConnected) {
    try { const [rows] = await db.query('SELECT id, full_name, email, role, organization, created_at FROM users ORDER BY id DESC'); return res.json(rows); } catch (_) {}
  }
  res.json(mockUsers.map(({password, ...u}) => u));
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can manage users' });
  const { full_name, email, role, organization } = req.body;
  if (isDbConnected) {
    try {
      await db.query('UPDATE users SET full_name=COALESCE(?,full_name), email=COALESCE(?,email), role=COALESCE(?,role), organization=COALESCE(?,organization) WHERE id=?', [full_name,email,role,organization,req.params.id]);
      const [rows] = await db.query('SELECT id,full_name,email,role,organization,created_at FROM users WHERE id=?',[req.params.id]);
      return res.json({ message:'User updated successfully', user: rows[0] });
    } catch (e) { return res.status(400).json({ message:'Could not update user', error:e.message }); }
  }
  const u=mockUsers.find(x=>x.id==req.params.id); if(!u) return res.status(404).json({message:'User not found'});
  Object.assign(u, { ...(full_name?{full_name}:{}), ...(email?{email}:{}), ...(role?{role}:{}), ...(organization!==undefined?{organization}:{}) });
  const {password,...safe}=u; res.json({message:'User updated successfully', user:safe});
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can manage users' });
  if (String(req.user.id) === String(req.params.id)) return res.status(400).json({ message: 'Admin cannot delete their own active account' });
  if (isDbConnected) {
    try { await db.query('DELETE FROM users WHERE id=?',[req.params.id]); return res.json({message:'User deleted successfully'}); } catch(e) { return res.status(400).json({message:'Could not delete user',error:e.message}); }
  }
  mockUsers = mockUsers.filter(x=>x.id!=req.params.id); res.json({message:'User deleted successfully'});
});

// ================= INVESTOR REVIEW ENDPOINTS =================

// Submit Investor Review
app.post('/api/investor-reviews', authenticateToken, async (req, res) => {
  if (req.user.role !== 'investor' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only registered investors can submit reviews' });
  }

  const { article_id, decision, benefit_for_country, comments } = req.body;
  const created_at = new Date().toISOString().split('T')[0];

  if (isDbConnected) {
    try {
      const [artRows] = await db.query('SELECT title FROM articles WHERE id = ?', [article_id]);
      if (artRows.length === 0) return res.status(404).json({ message: 'Article not found' });

      const article_title = artRows[0].title;
      const dec = decision || 'Interested to Invest';
      const ben = benefit_for_country || 'High Impact';

      const [result] = await db.query(
        `INSERT INTO investor_reviews (investor_id, investor_name, article_id, article_title, decision, benefit_for_country, comments, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, req.user.full_name, parseInt(article_id), article_title, dec, ben, comments, created_at]
      );

      const newReview = {
        id: result.insertId,
        investor_id: req.user.id,
        investor_name: req.user.full_name,
        article_id: parseInt(article_id),
        article_title,
        decision: dec,
        benefit_for_country: ben,
        comments,
        created_at
      };

      return res.status(201).json({ message: 'Investor review & decision recorded!', review: newReview });
    } catch (err) {
      console.error('MySQL Investor Review Error:', err);
      return res.status(500).json({ message: 'Database error submitting review' });
    }
  }

  const article = mockArticles.find(a => a.id == article_id);
  if (!article) return res.status(404).json({ message: 'Article not found' });

  const newReview = {
    id: mockInvestorReviews.length + 1,
    investor_id: req.user.id,
    investor_name: req.user.full_name,
    article_id: parseInt(article_id),
    article_title: article.title,
    decision: decision || 'Interested to Invest',
    benefit_for_country: benefit_for_country || 'High Impact',
    comments,
    created_at
  };

  mockInvestorReviews.push(newReview);
  res.status(201).json({ message: 'Investor review & decision recorded!', review: newReview });
});

// Get all Investor Reviews
app.get('/api/investor-reviews', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM investor_reviews ORDER BY id DESC');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Reviews Error:', err);
    }
  }

  res.json(mockInvestorReviews);
});

// ================= TICKETING & CONFERENCE ENDPOINTS =================

// Get Conferences
app.get('/api/conferences', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM conferences');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Conferences Error:', err);
    }
  }

  res.json(mockConferences);
});

// Book Ticket with Seat Assignment & Event Details
app.post(['/api/tickets', '/api/tickets/book'], authenticateToken, async (req, res) => {
  const { conference_id, ticket_type, amount_paid, amount, receipt_url, sender_bank, transaction_id, sender_mobile, attendee_name, attendee_email } = req.body;
  const confId = conference_id || 1;
  const type = ticket_type || 'onsite';
  const finalAmount = amount_paid !== undefined ? amount_paid : (amount || (type === 'onsite' ? 50 : 20));

  const rows = ['Row A', 'Row B', 'Row C', 'Row D', 'Row E'];
  const randomRow = rows[Math.floor(Math.random() * rows.length)];
  const seatNum = Math.floor(Math.random() * 25) + 1;
  const seat_number = type === 'onsite' ? `Seat ${randomRow} - #${seatNum < 10 ? '0' + seatNum : seatNum}` : 'Virtual VIP Live Stream';

  const ticket_code = `PASS-LLU-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const booked_at = new Date().toISOString().split('T')[0];

  let event_date = '2026-09-15';
  let event_time = '10:00 AM - 04:00 PM';
  let venue = 'Lahore Leads University Main Auditorium & Global HD Live Stream';
  let confObj = mockConferences.find(c => c.id == confId) || { id: confId, title: 'Annual Innovation Summit 2026' };

  // 1. Upload complete delegate pass package to Google Drive in organized folder
  const drivePassPkg = await uploadConferencePassPackage({
    user: { full_name: attendee_name || req.user.full_name, email: attendee_email || req.user.email },
    conference: confObj,
    ticketType: type,
    amount: finalAmount,
    receiptBase64: receipt_url,
    senderBank: sender_bank,
    transactionId: transaction_id,
    senderMobile: sender_mobile
  });

  const cleanReceipt = drivePassPkg.challanUrl || await resolveDriveUrl(receipt_url, 'Conference_Pass_Receipts', 'ticket_receipt');

  if (isDbConnected) {
    try {
      const [confData] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      if (confData.length > 0) {
        event_date = confData[0].event_date || event_date;
        event_time = confData[0].event_time || event_time;
        venue = confData[0].venue || venue;
        confObj = confData[0];
      }

      const [result] = await db.query(
        `INSERT INTO tickets (user_id, user_name, conference_id, ticket_type, amount_paid, ticket_code, seat_number, event_date, event_time, venue, payment_status, booked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Admin Verification', ?)`,
        [req.user.id, attendee_name || req.user.full_name, confId, type, finalAmount, ticket_code, seat_number, event_date, event_time, venue, booked_at]
      );

      const newTicket = {
        id: result.insertId,
        user_id: req.user.id,
        user_name: attendee_name || req.user.full_name,
        user_email: attendee_email || req.user.email,
        conference_id: confId,
        conference_title: confObj.title,
        ticket_type: type,
        amount_paid: finalAmount,
        receipt_url: cleanReceipt || '',
        sender_bank: sender_bank || 'HBL Mobile App',
        transaction_id: transaction_id || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        sender_mobile: sender_mobile || '0348-2727605',
        ticket_code,
        seat_number,
        event_date,
        event_time,
        venue,
        payment_status: 'Pending Admin Verification',
        booked_at
      };

      // Dispatch WhatsApp & Email notification to Admin via Kapso
      notifyTicketBooked({
        ticket: newTicket,
        conference: confObj,
        attendeeName: newTicket.user_name,
        senderBank: newTicket.sender_bank,
        transactionId: newTicket.transaction_id,
        senderMobile: newTicket.sender_mobile
      }).catch(err => console.error('Ticket notification dispatch error:', err));
      createPortalNotification({ roleTarget: 'admin', type: 'ticket', title: 'New Conference Pass Booked', message: `${newTicket.user_name} booked a ${type.toUpperCase()} pass for ${confObj.title} (PKR ${finalAmount}).`, link: '/admin/tickets' });
      createPortalNotification({ userId: req.user.id, type: 'ticket', title: 'Pass Registration Submitted', message: `Your pass for “${confObj.title}” is submitted. Admin is verifying your payment.`, link: '/student/passes' });

      return res.status(201).json({ message: 'Ticket pass booked! Awaiting Admin verification.', ticket: newTicket });
    } catch (err) {
      console.error('MySQL Book Ticket Error:', err);
      console.error('DB operation error:', err.message);
    }
  }

  const newTicket = {
    id: mockTickets.length + 1,
    user_id: req.user.id,
    user_name: attendee_name || req.user.full_name,
    user_email: attendee_email || req.user.email,
    conference_id: confId,
    conference_title: confObj.title,
    ticket_type: type,
    amount_paid: finalAmount,
    receipt_url: cleanReceipt || '',
    sender_bank: sender_bank || 'HBL Mobile App',
    transaction_id: transaction_id || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
    sender_mobile: sender_mobile || '0348-2727605',
    ticket_code,
    seat_number,
    event_date,
    event_time,
    venue,
    payment_status: 'Pending Admin Verification',
    booked_at
  };

  mockTickets.unshift(newTicket);

  // Dispatch WhatsApp & Email notification to Admin via Kapso
  notifyTicketBooked({
    ticket: newTicket,
    conference: confObj,
    attendeeName: newTicket.user_name,
    senderBank: newTicket.sender_bank,
    transactionId: newTicket.transaction_id,
    senderMobile: newTicket.sender_mobile
  }).catch(err => console.error('Ticket notification dispatch error:', err));
  createPortalNotification({ roleTarget: 'admin', type: 'ticket', title: 'New Conference Pass Booked', message: `${newTicket.user_name} booked a ${type.toUpperCase()} pass for ${confObj.title} (PKR ${finalAmount}).`, link: '/admin/tickets' });
  createPortalNotification({ userId: req.user.id, type: 'ticket', title: 'Pass Registration Submitted', message: `Your pass for “${confObj.title}” is submitted. Admin is verifying your payment.`, link: '/student/passes' });

  res.status(201).json({ message: 'Ticket pass booked! Awaiting Admin verification.', ticket: newTicket });
});

// Admin Route: Get All Booked Tickets
app.get('/api/admin/tickets', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can access all tickets' });
  }

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM tickets ORDER BY id DESC');
      return res.json(rows);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  res.json(mockTickets);
});

// Admin Route: Verify & Approve Ticket Pass with Seat / Stream Link Allocation + Auto Article Access
app.put('/api/admin/tickets/:id/verify', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can verify tickets' });
  }

  const ticketId = req.params.id;
  const { seat_number, stream_link, venue, event_date, event_time } = req.body;

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE tickets SET payment_status = "Verified & Issued", seat_number = COALESCE(?, seat_number), stream_link = COALESCE(?, stream_link), venue = COALESCE(?, venue), event_date = COALESCE(?, event_date), event_time = COALESCE(?, event_time) WHERE id = ?',
        [seat_number, stream_link, venue, event_date, event_time, ticketId]
      );
      const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
      const verifiedTicket = rows[0];

      if (verifiedTicket) {
        // Auto-grant research paper reading permissions to the delegate
        try {
          const [articles] = await db.query('SELECT id, title FROM articles LIMIT 10');
          for (const art of articles) {
            await db.query(
              `INSERT INTO reader_access_requests (user_id, user_name, user_email, article_id, article_title, amount_paid, receipt_url, sender_bank, transaction_id, sender_mobile, status, created_at)
               VALUES (?, ?, ?, ?, ?, 0, 'Conference Pass Included', 'Conference Pass Included', ?, ?, 'Approved', NOW())
               ON DUPLICATE KEY UPDATE status = 'Approved'`,
              [verifiedTicket.user_id, verifiedTicket.user_name, verifiedTicket.user_email || 'delegate@leads.edu.pk', art.id, art.title, verifiedTicket.transaction_id || 'CONF-PASS', verifiedTicket.sender_mobile || '0348-2727605']
            );
          }
        } catch (rErr) {
          console.warn('Auto reader grant notice:', rErr.message);
        }

        // Fetch conference object for details
        let confObj = null;
        try {
          const [confs] = await db.query('SELECT * FROM conferences WHERE id = ?', [verifiedTicket.conference_id]);
          if (confs.length > 0) confObj = confs[0];
        } catch (_) {}

        // Send Student WhatsApp and Email Confirmation
        notifyTicketVerifiedAndIssued({
          ticket: verifiedTicket,
          conference: confObj,
          attendeeName: verifiedTicket.user_name,
          attendeeEmail: verifiedTicket.user_email,
          attendeeMobile: verifiedTicket.sender_mobile,
          seatNumber: seat_number || verifiedTicket.seat_number,
          streamLink: stream_link || verifiedTicket.stream_link,
          venue: venue || verifiedTicket.venue,
          eventDate: event_date || verifiedTicket.event_date,
          eventTime: event_time || verifiedTicket.event_time
        }).catch(err => console.error('Error dispatching ticket verified notification:', err));

        // Notify Delegate in Portal
        createPortalNotification({
          userId: verifiedTicket.user_id,
          type: 'ticket',
          title: '🎟️ Conference Pass Verified & Activated!',
          message: `Your pass for “${verifiedTicket.conference_title || confObj?.title || 'Conference'}” is verified! ${verifiedTicket.ticket_type === 'onsite' ? `Seat: ${seat_number || verifiedTicket.seat_number}` : `Stream Link: ${stream_link || verifiedTicket.stream_link || 'Live Virtual Access'}`}.`,
          link: '/student'
        });
      }

      return res.json({ message: 'Ticket pass verified and issued to delegate!', ticket: verifiedTicket });
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const ticket = mockTickets.find(t => t.id == ticketId);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  ticket.payment_status = 'Verified & Issued';
  if (seat_number) ticket.seat_number = seat_number;
  if (venue) ticket.venue = venue;
  if (stream_link) ticket.stream_link = stream_link;
  if (event_date) ticket.event_date = event_date;
  if (event_time) ticket.event_time = event_time;

  notifyTicketVerifiedAndIssued({
    ticket,
    conference: { title: ticket.conference_title, venue: ticket.venue, event_date: ticket.event_date, event_time: ticket.event_time },
    attendeeName: ticket.user_name,
    attendeeEmail: ticket.user_email,
    attendeeMobile: ticket.sender_mobile,
    seatNumber: ticket.seat_number,
    streamLink: ticket.stream_link,
    venue: ticket.venue,
    eventDate: ticket.event_date,
    eventTime: ticket.event_time
  }).catch(err => console.error('Error dispatching mock ticket verified notification:', err));

  createPortalNotification({
    userId: ticket.user_id,
    type: 'ticket',
    title: '🎟️ Conference Pass Verified & Activated!',
    message: `Your pass for “${ticket.conference_title || 'Conference'}” is verified! ${ticket.ticket_type === 'onsite' ? `Seat: ${ticket.seat_number}` : `Stream Link: ${ticket.stream_link || 'Live Virtual Access'}`}.`,
    link: '/student'
  });

  res.json({ message: 'Ticket pass verified and issued to delegate!', ticket });
});

// Get Tickets for User
app.get('/api/tickets/my-tickets', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM tickets WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Tickets Error:', err);
    }
  }

  const userTickets = mockTickets.filter(t => t.user_id == req.user.id);
  res.json(userTickets);
});

// ================= RESEARCH ARTICLE READER ACCESS ENDPOINTS =================

let mockReaderAccessRequests = [
  {
    id: 1,
    article_id: 1,
    user_id: 4,
    user_name: 'Sara Khan',
    user_email: 'attendee@gmail.com',
    article_title: 'AI Driven Solar Grid Optimization for Smart Cities',
    amount_paid: 500,
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    sender_bank: 'HBL Mobile App',
    transaction_id: 'TRX-READ-94821',
    sender_mobile: '0300-9876543',
    status: 'Pending Admin Verification',
    created_at: '2026-09-14 11:30:00'
  }
];

// 1. Submit Reader Access Fee Proof (Student / Reader)
app.post('/api/articles/:id/reader-access', authenticateToken, async (req, res) => {
  const articleId = parseInt(req.params.id);
  const { amount_paid, receipt_url, sender_bank, transaction_id, sender_mobile, reader_name, reader_email } = req.body;
  const amount = amount_paid || 500;
  const name = reader_name || req.user.full_name || 'Student Researcher';
  const email = reader_email || req.user.email || 'student@leads.edu.pk';
  const tid = transaction_id || `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  const bank = sender_bank || 'HBL Mobile App';
  const mobile = sender_mobile || '0348-2727605';
  const cleanReceipt = await resolveDriveUrl(receipt_url, 'Reader_Pass_Receipts', 'reader_receipt');

  let articleObj = mockArticles.find(a => a.id === articleId);

  if (isDbConnected) {
    try {
      const [artRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (artRows.length > 0) articleObj = artRows[0];

      const [result] = await db.query(
        `INSERT INTO article_access_requests (article_id, user_id, user_name, user_email, article_title, amount_paid, receipt_url, sender_bank, transaction_id, sender_mobile, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Admin Verification')`,
        [articleId, req.user.id, name, email, articleObj?.title || 'Research Manuscript', amount, cleanReceipt || '', bank, tid, mobile]
      );

      const newReq = {
        id: result.insertId,
        article_id: articleId,
        user_id: req.user.id,
        user_name: name,
        user_email: email,
        article_title: articleObj?.title || 'Research Manuscript',
        amount_paid: amount,
        receipt_url: cleanReceipt || '',
        sender_bank: bank,
        transaction_id: tid,
        sender_mobile: mobile,
        status: 'Pending Admin Verification',
        created_at: new Date().toISOString()
      };

      notifyReaderAccessRequested({
        reader: { full_name: name, email },
        article: articleObj || { id: articleId, title: 'Research Article' },
        senderBank: bank,
        transactionId: tid,
        senderMobile: mobile,
        amount
      }).catch(err => console.error('Reader access notification error:', err));

      return res.status(201).json({ message: 'Reader access fee proof submitted! Awaiting Admin approval.', request: newReq });
    } catch (err) {
      console.error('MySQL Reader Access Request Error:', err);
      console.error('DB operation error:', err.message);
    }
  }

  const newReq = {
    id: mockReaderAccessRequests.length + 1,
    article_id: articleId,
    user_id: req.user.id,
    user_name: name,
    user_email: email,
    article_title: articleObj?.title || 'Research Manuscript',
    amount_paid: amount,
    receipt_url: receipt,
    sender_bank: bank,
    transaction_id: tid,
    sender_mobile: mobile,
    status: 'Pending Admin Verification',
    created_at: new Date().toISOString()
  };

  mockReaderAccessRequests.unshift(newReq);

  notifyReaderAccessRequested({
    reader: { full_name: name, email },
    article: articleObj || { id: articleId, title: 'Research Article' },
    senderBank: bank,
    transactionId: tid,
    senderMobile: mobile,
    amount
  }).catch(err => console.error('Reader access notification error:', err));

  res.status(201).json({ message: 'Reader access fee proof submitted! Awaiting Admin approval.', request: newReq });
});

// 2. Admin: Get all reader access requests
app.get('/api/admin/reader-access', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can access reader requests' });
  }

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM article_access_requests ORDER BY id DESC');
      return res.json(rows);
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  res.json(mockReaderAccessRequests);
});

// 3. Admin: Approve Reader Access Request
app.put('/api/admin/reader-access/:id/approve', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can approve reader access' });
  }

  const reqId = parseInt(req.params.id);

  if (isDbConnected) {
    try {
      await db.query('UPDATE article_access_requests SET status = "Approved" WHERE id = ?', [reqId]);
      const [reqRows] = await db.query('SELECT * FROM article_access_requests WHERE id = ?', [reqId]);
      if (reqRows.length > 0) {
        const r = reqRows[0];
        // Append user_id to article's approved_readers
        const [artRows] = await db.query('SELECT approved_readers FROM articles WHERE id = ?', [r.article_id]);
        let readers = [];
        if (artRows.length > 0 && artRows[0].approved_readers) {
          try { readers = JSON.parse(artRows[0].approved_readers); } catch(e) { readers = []; }
        }
        if (!readers.includes(r.user_id)) {
          readers.push(r.user_id);
          await db.query('UPDATE articles SET approved_readers = ? WHERE id = ?', [JSON.stringify(readers), r.article_id]);
        }
        return res.json({ message: `Access granted to reader '${r.user_name}'!`, request: r });
      }
    } catch (err) {
      console.error('DB operation error:', err.message);
    }
  }

  const r = mockReaderAccessRequests.find(x => x.id === reqId);
  if (!r) return res.status(404).json({ message: 'Access request not found' });
  r.status = 'Approved';

  const art = mockArticles.find(a => a.id === r.article_id);
  if (art) {
    if (!art.approved_readers) art.approved_readers = [];
    if (!art.approved_readers.includes(r.user_id)) {
      art.approved_readers.push(r.user_id);
    }
  }

  res.json({ message: `Access granted to reader '${r.user_name}'!`, request: r });
});

// 4. Check user access status for an article
app.get('/api/articles/:id/access-status', authenticateToken, async (req, res) => {
  const articleId = parseInt(req.params.id);
  const userId = req.user.id;

  if (req.user.role === 'admin') {
    return res.json({ hasAccess: true, isAuthor: false, isAdmin: true, status: 'Admin Access' });
  }

  let art = mockArticles.find(a => a.id === articleId);

  if (isDbConnected) {
    try {
      const [artRows] = await db.query('SELECT student_id, student_name, approved_readers FROM articles WHERE id = ?', [articleId]);
      if (artRows.length > 0) art = artRows[0];
    } catch (err) {}
  }

  if (art && (art.student_id === userId || art.student_name === req.user.full_name)) {
    return res.json({ hasAccess: true, isAuthor: true, isAdmin: false, status: 'Author Access' });
  }

  // Check if approved in article_access_requests or approved_readers
  if (isDbConnected) {
    try {
      const [reqRows] = await db.query(
        'SELECT * FROM article_access_requests WHERE article_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1',
        [articleId, userId]
      );
      if (reqRows.length > 0) {
        const reqItem = reqRows[0];
        return res.json({
          hasAccess: reqItem.status === 'Approved',
          isAuthor: false,
          isAdmin: false,
          status: reqItem.status,
          request: reqItem
        });
      }
    } catch (err) {}
  }

  const reqItem = mockReaderAccessRequests.find(x => x.article_id === articleId && x.user_id === userId);
  if (reqItem) {
    return res.json({
      hasAccess: reqItem.status === 'Approved',
      isAuthor: false,
      isAdmin: false,
      status: reqItem.status,
      request: reqItem
    });
  }

  res.json({ hasAccess: false, isAuthor: false, isAdmin: false, status: 'Locked' });
});

// ================= GALLERY ENDPOINTS =================

// Get Gallery Highlights
app.get('/api/gallery', async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM gallery ORDER BY id DESC');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Gallery Error:', err);
    }
  }

  res.json(mockGallery);
});

// Add Item to Gallery (Admin)
app.post('/api/gallery', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can add to Gallery' });
  }

  const { title, image_url, featured_article_id, investor_name, description } = req.body;
  const img = image_url || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80';
  const articleId = featured_article_id ? parseInt(featured_article_id) : null;

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO gallery (conference_id, title, image_url, featured_article_id, investor_name, description)
         VALUES (1, ?, ?, ?, ?, ?)`,
        [title, img, articleId, investor_name, description]
      );

      const newItem = {
        id: result.insertId,
        conference_id: 1,
        title,
        image_url: img,
        featured_article_id: articleId,
        investor_name,
        description
      };

      return res.status(201).json({ message: 'Gallery highlight added successfully!', item: newItem });
    } catch (err) {
      console.error('MySQL Add Gallery Error:', err);
      return res.status(500).json({ message: 'Database error adding gallery item' });
    }
  }

  const newItem = {
    id: mockGallery.length + 1,
    conference_id: 1,
    title,
    image_url: img,
    featured_article_id: articleId,
    investor_name,
    description
  };

  mockGallery.push(newItem);
  res.status(201).json({ message: 'Gallery highlight added successfully!', item: newItem });
});

// ================= ADMIN INVESTOR PROVISIONING & DIRECTORY =================

// Get Registered Investors for Dropdown Auto-Fill
app.get('/api/admin/investors', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query("SELECT id, full_name, email, organization FROM users WHERE role = 'investor' ORDER BY id DESC");
      return res.json(rows);
    } catch (err) {
      console.error('MySQL Get Investors Error:', err);
    }
  }
  const investors = mockUsers.filter(u => u.role === 'investor').map(u => ({ id: u.id, full_name: u.full_name, email: u.email, organization: u.organization }));
  res.json(investors);
});

// Provision Investor Account (Admin)
app.post('/api/admin/create-investor', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can provision investor credentials' });
  }

  const { full_name, email, password, organization } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  if (isDbConnected) {
    try {
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(400).json({ message: 'An investor with this email already exists' });

      const org = organization || 'Apex Tech Capital';
      const [result] = await db.query(
        "INSERT INTO users (full_name, email, password, role, organization) VALUES (?, ?, ?, 'investor', ?)",
        [full_name, email, password, org]
      );

      return res.status(201).json({
        message: 'Investor account provisioned successfully!',
        investor: { id: result.insertId, full_name, email, role: 'investor', organization: org }
      });
    } catch (err) {
      console.error('MySQL Create Investor Error:', err);
      return res.status(500).json({ message: 'Database error creating investor' });
    }
  }

  const existing = mockUsers.find(u => u.email === email);
  if (existing) return res.status(400).json({ message: 'An investor with this email already exists' });

  const newInvestor = {
    id: mockUsers.length + 1,
    full_name,
    email,
    password,
    role: 'investor',
    organization: organization || 'Apex Tech Capital'
  };

  mockUsers.push(newInvestor);
  res.status(201).json({
    message: 'Investor account provisioned successfully!',
    investor: { id: newInvestor.id, full_name, email, role: 'investor', organization: newInvestor.organization }
  });
});

// Update Conference Post (Admin)
app.put('/api/admin/conferences/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can update conference details' });
  }

  const confId = req.params.id;
  const { title, description, cover_image, event_date, event_time, venue, presenting_students, attending_investors } = req.body;

  if (isDbConnected) {
    try {
      await db.query(
        `UPDATE conferences SET 
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          cover_image = COALESCE(?, cover_image),
          event_date = COALESCE(?, event_date),
          event_time = COALESCE(?, event_time),
          venue = COALESCE(?, venue),
          presenting_students = COALESCE(?, presenting_students),
          attending_investors = COALESCE(?, attending_investors)
         WHERE id = ?`,
        [title, description, cover_image, event_date, event_time, venue, presenting_students, attending_investors, confId]
      );
      const [rows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      return res.json({ message: 'Conference updated successfully!', conference: rows[0] });
    } catch (err) {
      console.error('MySQL Update Conference Error:', err);
      return res.status(500).json({ message: 'Database error updating conference' });
    }
  }

  const confIndex = mockConferences.findIndex(c => c.id == confId);
  if (confIndex === -1) return res.status(404).json({ message: 'Conference not found' });

  mockConferences[confIndex] = {
    ...mockConferences[confIndex],
    title: title || mockConferences[confIndex].title,
    description: description || mockConferences[confIndex].description,
    cover_image: cover_image || mockConferences[confIndex].cover_image,
    event_date: event_date || mockConferences[confIndex].event_date,
    event_time: event_time || mockConferences[confIndex].event_time,
    venue: venue || mockConferences[confIndex].venue,
    presenting_students: presenting_students || mockConferences[confIndex].presenting_students,
    attending_investors: attending_investors || mockConferences[confIndex].attending_investors
  };

  res.json({ message: 'Conference updated successfully!', conference: mockConferences[confIndex] });
});

// ================= PERSISTENT PORTAL NOTIFICATIONS =================
app.get('/api/notifications', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? OR (user_id IS NULL AND role_target = ?) ORDER BY created_at DESC LIMIT 100',
        [req.user.id, req.user.role]
      );
      return res.json(rows);
    } catch (e) { console.warn('Notification fetch warning:', e.message); }
  }
  res.json(mockPortalNotifications.filter(n => n.user_id == req.user.id || (!n.user_id && n.role_target === req.user.role)).slice(0,100));
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ? OR (user_id IS NULL AND role_target = ?)', [req.user.id, req.user.role]);
      return res.json({ message: 'All notifications marked as read' });
    } catch (_) {}
  }
  mockPortalNotifications.forEach(n => {
    if (n.user_id == req.user.id || (!n.user_id && n.role_target === req.user.role)) {
      n.is_read = true;
    }
  });
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  res.json({ message: 'All notifications marked as read' });
});

app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  const notifId = req.params.id;
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM notifications WHERE id = ? AND (user_id = ? OR (user_id IS NULL AND role_target = ?))', [notifId, req.user.id, req.user.role]);
      return res.json({ message: 'Notification deleted successfully' });
    } catch (e) {
      console.warn('DB delete notification warning:', e.message);
    }
  }
  const idx = mockPortalNotifications.findIndex(x => x.id == notifId && (x.user_id == req.user.id || (!x.user_id && x.role_target === req.user.role)));
  if (idx !== -1) {
    mockPortalNotifications.splice(idx, 1);
    if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  }
  res.json({ message: 'Notification deleted successfully' });
});

app.delete('/api/notifications', authenticateToken, async (req, res) => {
  if (isDbConnected) {
    try {
      await db.query('DELETE FROM notifications WHERE user_id = ? OR (user_id IS NULL AND role_target = ?)', [req.user.id, req.user.role]);
      return res.json({ message: 'All notifications cleared successfully' });
    } catch (e) {
      console.warn('DB clear notifications warning:', e.message);
    }
  }
  for (let i = mockPortalNotifications.length - 1; i >= 0; i--) {
    const n = mockPortalNotifications[i];
    if (n.user_id == req.user.id || (!n.user_id && n.role_target === req.user.role)) {
      mockPortalNotifications.splice(i, 1);
    }
  }
  if (typeof savePersistentDataStore === 'function') savePersistentDataStore();
  res.json({ message: 'All notifications cleared successfully' });
});

// Clear Notification Audit History (Admin Only)
app.delete('/api/admin/notifications/history', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can clear notification history' });
  }
  notificationHistory.length = 0;
  res.json({ message: 'Notification audit history cleared successfully' });
});

// ================= ADMIN NOTIFICATIONS AUDIT LOG (KAPSO / TWILIO / EMAIL) =================

// Get Notifications Log
app.get('/api/admin/notifications', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can view notification dispatch logs' });
  }

  res.json({
    admin_whatsapp: DEFAULT_ADMIN_WHATSAPP,
    admin_email: DEFAULT_ADMIN_EMAIL,
    kapso_configured: !!process.env.KAPSO_API_KEY,
    twilio_configured: !!process.env.TWILIO_ACCOUNT_SID,
    email_configured: !!process.env.SMTP_USER,
    history: notificationHistory
  });
});

// Send Test Notification to Admin WhatsApp & Email
app.post('/api/admin/notifications/test', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can trigger test notifications' });
  }

  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  const testMessage = 
`🧪 *TEST NOTIFICATION (KAPSO WHATSAPP DISPATCH)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
Admin Target: ${DEFAULT_ADMIN_WHATSAPP}
Admin Email: ${DEFAULT_ADMIN_EMAIL}
Time: ${timestamp}
Provider: Kapso WhatsApp Cloud API
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Twilio & Kapso notification pipes are fully active and connected to your conference portal!`;

  await Promise.allSettled([
    sendAdminWhatsApp(testMessage, { type: 'test' }),
    sendAdminEmail('🧪 Test WhatsApp & Email Notification from Conference Portal', `<pre>${testMessage}</pre>`, testMessage, { type: 'test' })
  ]);

  res.json({
    message: 'Test notification triggered successfully to WhatsApp & Email!',
    history: notificationHistory
  });
});

// ================= GOOGLE DRIVE API STORAGE & BACKUP ENDPOINTS =================

// Direct File/Base64 Upload to Google Drive
app.post('/api/upload/drive', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    let uploadResult;
    const subfolderName = req.body.subfolderName || 'General_Uploads';

    if (req.file) {
      uploadResult = await uploadFileToDrive({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        subfolderName
      });
    } else if (req.body.base64Data) {
      uploadResult = await uploadBase64ToDrive({
        base64Data: req.body.base64Data,
        fileName: req.body.fileName || `upload_${Date.now()}.jpg`,
        mimeType: req.body.mimeType || 'image/jpeg',
        subfolderName
      });
    } else {
      return res.status(400).json({ message: 'No file or base64Data provided for upload' });
    }

    res.json({
      message: 'File successfully uploaded to Google Drive!',
      ...uploadResult
    });
  } catch (err) {
    console.error('Google Drive Upload Error:', err);
    res.status(500).json({ message: 'Failed to upload file to Google Drive', error: err.message });
  }
});

// Admin: Check Google Drive Connection & Folder Info
app.get('/api/admin/drive/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can check storage status' });
  }

  const driveStatus = await testDriveConnection();
  res.json({ ...getStorageConfigSummary(), ...driveStatus });
});

// Admin: Update Google Drive Folder + service-account credentials safely.
// Credentials are encrypted on disk and are never returned by the API.
app.put('/api/admin/drive/settings', authenticateToken, upload.single('credentials'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can change storage settings' });
  try {
    const folderId = String(req.body.folderId || '').trim();
    if (!folderId) return res.status(400).json({ message: 'Google Drive Folder ID is required' });
    let credentials = null;
    if (req.file) {
      if (req.file.size > 1024 * 1024) return res.status(400).json({ message: 'Credential JSON is unexpectedly large' });
      try { credentials = JSON.parse(req.file.buffer.toString('utf8')); }
      catch (_) { return res.status(400).json({ message: 'Credential file must be valid JSON' }); }
    }
    const result = await saveStorageConfig({ folderId, credentials, updatedBy: req.user.email || req.user.full_name || 'admin' });
    await createPortalNotification({ roleTarget: 'admin', type: 'storage', title: 'Google Drive storage updated', message: `Active Drive folder changed to ${result.folderName || folderId}.`, link: '/admin/settings' });
    res.json({ message: 'Google Drive connection verified and activated successfully.', storage: result });
  } catch (err) {
    res.status(400).json({ message: 'Could not activate Google Drive settings', error: err.message });
  }
});

// Test current Drive settings without exposing credentials.
app.post('/api/admin/drive/test', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can test storage' });
  const status = await testDriveConnection();
  res.status(status.success ? 200 : 400).json({ ...getStorageConfigSummary(), ...status });
});

// Admin: Trigger Instant Database Backup to Google Drive
app.post('/api/admin/drive/backup', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can trigger database backups' });
  }

  try {
    const backupResult = await backupDatabaseToDrive(isDbConnected ? db : {
      query: async (sql) => {
        // In-memory mock exporter
        if (sql.includes('users')) return [mockUsers];
        if (sql.includes('journals')) return [mockJournals];
        if (sql.includes('articles')) return [mockArticles];
        if (sql.includes('conferences')) return [mockConferences];
        if (sql.includes('tickets')) return [mockTickets];
        if (sql.includes('investor_reviews')) return [mockInvestorReviews];
        if (sql.includes('gallery')) return [mockGallery];
        return [[]];
      }
    });

    res.json({
      message: 'Database snapshot successfully exported and saved to Google Drive!',
      ...backupResult
    });
  } catch (err) {
    console.error('Database Backup Error:', err);
    res.status(500).json({ message: 'Failed to backup database to Google Drive', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Conference Backend Server running on http://localhost:${PORT}`);
});


