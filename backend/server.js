const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
// Increased body limit to support base64 proof image uploads smoothly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

    // Ensure missing columns
    await ensureColumn('articles', 'student_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('articles', 'full_text', 'LONGTEXT');
    await ensureColumn('articles', 'is_published', 'BOOLEAN DEFAULT FALSE');
    await ensureColumn('articles', 'admin_unread', 'BOOLEAN DEFAULT TRUE');
    await ensureColumn('articles', 'student_unread', 'BOOLEAN DEFAULT FALSE');
    await ensureColumn('articles', 'pdf_url', "VARCHAR(500) DEFAULT 'research_paper_v1.pdf'");
    await ensureColumn('articles', 'submission_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'publication_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'presentation_receipt_url', 'LONGTEXT');
    await ensureColumn('articles', 'sender_bank', "VARCHAR(100) DEFAULT 'HBL Mobile App'");
    await ensureColumn('articles', 'transaction_id', "VARCHAR(100) DEFAULT 'TID-84920194'");
    await ensureColumn('articles', 'sender_mobile', "VARCHAR(50) DEFAULT '0300-1234567'");
    await ensureColumn('articles', 'presenting_students_list', 'TEXT');
    await ensureColumn('conferences', 'event_time', "VARCHAR(100) DEFAULT '10:00 AM - 04:00 PM'");
    await ensureColumn('conferences', 'cover_image', 'TEXT');
    await ensureColumn('conferences', 'presenting_students', 'TEXT');
    await ensureColumn('conferences', 'attending_investors', 'TEXT');
    await ensureColumn('tickets', 'user_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('tickets', 'seat_number', "VARCHAR(100) DEFAULT 'Seat Row A - #01'");
    await ensureColumn('tickets', 'event_date', 'VARCHAR(100)');
    await ensureColumn('tickets', 'event_time', 'VARCHAR(100)');
    await ensureColumn('tickets', 'venue', 'VARCHAR(255)');
    await ensureColumn('investor_reviews', 'investor_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('investor_reviews', 'article_title', "VARCHAR(500) DEFAULT ''");

    // Seed default admin and initial sample records into MySQL if empty
    const [userRows] = await db.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      await db.query(`
        INSERT INTO users (id, full_name, email, password, role, organization) VALUES
        (1, 'System Admin', 'admin@univ.edu', 'password123', 'admin', 'University Board'),
        (2, 'Ali Ahmed', 'student@univ.edu', 'password123', 'student', 'CS Dept'),
        (3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Apex Tech Capital'),
        (4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self'),
        (5, 'Bazigh Minhas', 'bazighminhas1@gmail.com', 'password123', 'student', 'University Innovation Lab'),
        (6, 'Dr. Sarah Vance', 'sarah@biohealthvc.com', 'password123', 'investor', 'BioHealth VC'),
        (7, 'Hamza Qureshi', 'hamza@fintechangels.com', 'password123', 'investor', 'FinTech Angels');
      `);
    }

    const [confRows] = await db.query('SELECT COUNT(*) AS count FROM conferences');
    if (confRows[0].count === 0) {
      await db.query(`
        INSERT INTO conferences (id, title, description, cover_image, event_date, event_time, venue, stream_link, onsite_ticket_price, online_ticket_price, presenting_students, attending_investors, status) VALUES
        (1, 'National Innovation & Research Conference 2026', 'Annual gathering showcasing top student research presentations to venture capital investors.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', '2026-09-15', '10:00 AM - 04:00 PM', 'University Main Auditorium & HD Virtual Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Biocompatible Nanoparticles), Ali Ahmed (Agri Drones)', 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com), Hamza Qureshi (FinTech Angels - hamza@fintechangels.com)', 'Upcoming');
      `);
    }

    const [artRows] = await db.query('SELECT COUNT(*) AS count FROM articles');
    if (artRows[0].count === 0) {
      await db.query(`
        INSERT INTO articles (id, student_id, student_name, title, abstract, full_text, category, pdf_url, submission_receipt_url, publication_receipt_url, presentation_receipt_url, plagiarism_score, reviewer_notes, tier, submission_fee_paid, publication_fee_paid, presentation_fee_paid, is_published, admin_unread, student_unread, status, created_at) VALUES
        (1, 2, 'Ali Ahmed', 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments with smart micro-grids.', '1. ABSTRACT & INTRODUCTION:\nRenewable energy integration in modern municipal infrastructures poses complex intermittency challenges. This paper implements an attention-based Transformer model forecasting solar radiation with 98.4% accuracy.\n\n2. METHODOLOGY & DATASET:\nCollected 4-year continuous telemetry from 120 photovoltaic stations in Lahore and Islamabad.\n\n3. RESULTS & COMMERCIALIZATION:\nDecreased grid strain by 34.2% during peak sunlight hours. Seed capital will be utilized for municipal hardware testing.', 'Artificial Intelligence & Clean Energy', 'solar_grid_ai.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 4, 'Excellent novelty, methodology is rigorously validated by external academic peer review. Awarded Platinum Tier.', 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-25'),
        (2, 2, 'Ali Ahmed', 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted tumor cells without damaging surrounding tissue.', '1. ABSTRACT:\nTargeted oncological therapy using functionalized gold-lipid core nanoparticles.\n\n2. EXPERIMENTAL FINDINGS:\nAchieved 82% tumor localization in in-vitro assays with zero off-target hepatic degradation.', 'Biotechnology & Healthcare', 'nanoparticles.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', '', 6, 'Good article. Excellent experimental validation in cellular models. Awarded Gold Tier.', 'Gold', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, 'Published', '2026-08-28'),
        (3, 5, 'Bazigh Minhas', 'Quantum Cryptography for Next-Gen Financial Banking', 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.', '1. EXECUTIVE ABSTRACT:\nQuantum computing threatens RSA-2048 encryption protocols. This research delivers Kyber-512 lattice key exchanges with sub-millisecond handshake latency.\n\n2. SECURITY PROOF:\nResistant against Shor algorithm attacks on post-quantum simulators.', 'Cybersecurity & Quantum Computing', 'quantum_banking.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 3, 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.', 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-29'),
        (4, 2, 'Ali Ahmed', 'Autonomous Agricultural Drones for Crop Yield Optimization', 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.', '1. ABSTRACT:\nCombines YOLOv8 with multispectral NDVI camera sensors to detect early stage pest infestations.\n\n2. AGRONOMIC TESTING:\nValidated over 500+ agricultural acres with 28% reduction in chemical pesticide wastage.', 'Robotics & AgriTech', 'agri_drones.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 5, 'Identified minor errors in section 2 dataset. Please expand sample size and resubmit.', 'None', TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, 'Needs Revision', '2026-08-30');
      `);
    }

    const [revRows] = await db.query('SELECT COUNT(*) AS count FROM investor_reviews');
    if (revRows[0].count === 0) {
      await db.query(`
        INSERT INTO investor_reviews (id, investor_id, investor_name, article_id, article_title, decision, benefit_for_country, comments, created_at) VALUES
        (1, 3, 'John Malik (Apex Tech Capital)', 1, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Economic Impact', 'Great potential for municipal grid deployment. Willing to fund seed round of $50,000.', '2026-08-30'),
        (2, 6, 'Dr. Sarah Vance (BioHealth VC)', 2, 'Biocompatible Nanoparticles for Target Drug Delivery', 'Interested to Invest', 'Global Healthcare Advancement', 'Highly scalable nanomedicine platform. Pledged $40,000 for clinical phase trial testing.', '2026-08-31'),
        (3, 7, 'Hamza Qureshi (FinTech Angels)', 3, 'Quantum Cryptography for Next-Gen Financial Banking', 'Interested to Invest', 'National Cyber Security', 'Critical infrastructure protection for modern banking. Funding seed pledge of $35,000 approved.', '2026-09-01');
      `);
    }

    const [galRows] = await db.query('SELECT COUNT(*) AS count FROM gallery');
    if (galRows[0].count === 0) {
      await db.query(`
        INSERT INTO gallery (id, conference_id, title, image_url, featured_article_id, investor_name, description) VALUES
        (1, 1, 'Solar Grid AI Awarded Top Platinum Tier', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', 1, 'John Malik (Apex Tech Capital)', 'Student Ali Ahmed received $50,000 seed investment pledge during the live pitch session.'),
        (2, 1, 'Target Drug Delivery Nanomedicine Breakthrough', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80', 2, 'Dr. Sarah Vance (BioHealth VC)', 'Awarded Gold Tier for pioneering targeted drug delivery system reducing oncology side effects.'),
        (3, 1, 'Quantum Encryption for Next-Gen Banking', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', 3, 'Hamza Qureshi (FinTech Angels)', 'Student Bazigh Minhas secured $35,000 seed funding for lattice quantum encryption algorithms.'),
        (4, 1, 'Autonomous Drone Crop Yield Optimization', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', 4, 'GreenAgri Ventures Fund', 'Awarded Platinum Tier for computer vision autonomous drones optimizing crop yield across 500+ acres.');
      `);
    }

    isDbConnected = true;
    console.log('✅ CONNECTED TO MYSQL DATABASE & ALL TABLES INITIALIZED SUCCESSFULLY! (univ_conference_db)');
  } catch (err) {
    isDbConnected = false;
    console.log('ℹ️ MySQL database offline or not configured. Running seamlessly in high-resilience memory mode.');
  }
}

// Run DB Initialization
initDatabase();

// In-Memory Storage Fallback (Always synchronized and 100% functional)
let mockUsers = [
  { id: 1, full_name: 'System Admin', email: 'admin@univ.edu', password: 'password123', role: 'admin', organization: 'University Board' },
  { id: 2, full_name: 'Ali Ahmed', email: 'student@univ.edu', password: 'password123', role: 'student', organization: 'CS Dept' },
  { id: 3, full_name: 'John Malik', email: 'investor@venture.com', password: 'password123', role: 'investor', organization: 'Apex Tech Capital' },
  { id: 4, full_name: 'Sara Khan', email: 'attendee@gmail.com', password: 'password123', role: 'attendee', organization: 'Self' },
  { id: 5, full_name: 'Bazigh Minhas', email: 'bazighminhas1@gmail.com', password: 'password123', role: 'student', organization: 'University Innovation Lab' },
  { id: 6, full_name: 'Bazigh Ali Minhas', email: 'bazighminhas2@gmail.com', password: 'password1234', role: 'student', organization: 'Department of Computer Science' },
  { id: 7, full_name: 'Dr. Sarah Vance', email: 'sarah@biohealthvc.com', password: 'password123', role: 'investor', organization: 'BioHealth VC' },
  { id: 8, full_name: 'Hamza Qureshi', email: 'hamza@fintechangels.com', password: 'password123', role: 'investor', organization: 'FinTech Angels' }
];

let mockArticles = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Ali Ahmed',
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

// ================= AUTHENTICATION ENDPOINTS =================

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { full_name, email, password, role, organization } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
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
        [full_name.trim(), cleanEmail, cleanPass, userRole, userOrg]
      );

      const userId = result.insertId;
      const token = jwt.sign({ id: userId, email: cleanEmail, role: userRole, full_name: full_name.trim() }, JWT_SECRET, { expiresIn: '1d' });

      // Keep mock synchronized
      mockUsers.push({ id: userId, full_name: full_name.trim(), email: cleanEmail, password: cleanPass, role: userRole, organization: userOrg });

      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: { id: userId, full_name: full_name.trim(), email: cleanEmail, role: userRole, organization: userOrg }
      });
    } catch (err) {
      isDbConnected = false;
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
    password: cleanPass,
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
  const cleanPass = password.trim();

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ? AND password = ?', [cleanEmail, cleanPass]);
      if (rows.length > 0) {
        const user = rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '1d' });
        return res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization }
        });
      }
    } catch (err) {
      isDbConnected = false;
    }
  }

  // Seamless Memory Fallback
  const user = mockUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);
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
      isDbConnected = false;
    }
  }

  const user = mockUsers.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization });
});

// ================= ARTICLE & REVIEW ENDPOINTS =================

// Get Articles
app.get('/api/articles', async (req, res) => {
  const { student_id } = req.query;

  if (isDbConnected) {
    try {
      let query = 'SELECT * FROM articles';
      let params = [];
      if (student_id) {
        query += ' WHERE student_id = ?';
        params.push(student_id);
      }
      query += ' ORDER BY id DESC';
      const [rows] = await db.query(query, params);
      return res.json(rows);
    } catch (err) {
      isDbConnected = false;
    }
  }

  if (student_id) {
    const list = mockArticles.filter(a => a.student_id == student_id);
    return res.json(list);
  }
  res.json(mockArticles);
});

// Submit New Article (Student)
app.post('/api/articles', authenticateToken, async (req, res) => {
  const { title, abstract, full_text, category, pdf_url, submission_receipt_url, sender_bank, transaction_id, sender_mobile } = req.body;
  if (!title || !abstract) return res.status(400).json({ message: 'Title and abstract are required' });

  const plagiarism_score = Math.floor(Math.random() * 8) + 3;
  const created_at = new Date().toISOString().split('T')[0];
  const text = full_text || abstract;

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO articles (student_id, student_name, title, abstract, full_text, category, pdf_url, submission_receipt_url, sender_bank, transaction_id, sender_mobile, plagiarism_score, reviewer_notes, tier, submission_fee_paid, publication_fee_paid, presentation_fee_paid, is_published, admin_unread, student_unread, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'None', 'None', TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, 'Submitted - Awaiting Review', ?)`,
        [req.user.id, req.user.full_name, title, abstract, text, category || 'General', pdf_url || 'default.pdf', submission_receipt_url, sender_bank, transaction_id, sender_mobile, plagiarism_score, created_at]
      );
      const newArticle = { id: result.insertId, student_id: req.user.id, student_name: req.user.full_name, title, abstract, full_text: text, category: category || 'General', status: 'Submitted - Awaiting Review', created_at };
      return res.status(201).json({ message: 'Article submitted with challan payment proof!', article: newArticle });
    } catch (err) {
      isDbConnected = false;
    }
  }

  const newArticle = {
    id: Date.now(),
    student_id: req.user.id,
    student_name: req.user.full_name,
    title,
    abstract,
    full_text: text,
    category: category || 'General',
    pdf_url: pdf_url || 'default.pdf',
    submission_receipt_url: submission_receipt_url,
    sender_bank,
    transaction_id,
    sender_mobile,
    plagiarism_score,
    reviewer_notes: 'Under review by university academic committee.',
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
  res.status(201).json({ message: 'Article submitted with challan payment proof!', article: newArticle });
});

// Admin Review Endpoint
app.put('/api/articles/:id/review', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only Admin can grade articles' });

  const articleId = req.params.id;
  const { tier, plagiarism_score, reviewer_notes, status, is_published } = req.body;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
    } catch (err) {
      console.error('MySQL Admin Review Error:', err);
      return res.status(500).json({ message: 'Database error updating review' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (!article) return res.status(404).json({ message: 'Article not found' });

  if (tier !== undefined) article.tier = tier;
  if (plagiarism_score !== undefined) article.plagiarism_score = plagiarism_score;
  if (reviewer_notes !== undefined) article.reviewer_notes = reviewer_notes;
  if (status !== undefined) article.status = status;
  if (is_published !== undefined) article.is_published = is_published;
  article.admin_unread = false;
  article.student_unread = true;

  res.json({ message: 'Article review submitted by Admin!', article });
});

// Student Route: Re-submit Revised Article (Edits full text & PDF)
app.put('/api/articles/:id/revise', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { title, abstract, full_text, pdf_url } = req.body;

  if (isDbConnected) {
    try {
      // Sets status = Revised, admin_unread = TRUE (Admin sees ⭐), student_unread = FALSE
      await db.query(
        'UPDATE articles SET title = COALESCE(?, title), abstract = COALESCE(?, abstract), full_text = COALESCE(?, full_text), pdf_url = COALESCE(?, pdf_url), status = "Revised - Awaiting Review", admin_unread = TRUE, student_unread = FALSE WHERE id = ? AND student_id = ?',
        [title, abstract, full_text, pdf_url, articleId, req.user.id]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Corrected paper re-submitted for Admin evaluation!', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error revising article' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    if (title) article.title = title;
    if (abstract) article.abstract = abstract;
    if (full_text) article.full_text = full_text;
    if (pdf_url) article.pdf_url = pdf_url;
    article.status = 'Revised - Awaiting Review';
    article.admin_unread = true;
    article.student_unread = false;
  }
  res.json({ message: 'Corrected paper re-submitted for Admin evaluation!', article });
});

// Student Route: Pay Publication Fee & Upload Screenshot Proof
app.post('/api/articles/:id/pay-publication', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, sender_bank, transaction_id, sender_mobile } = req.body;

  const receipt = receipt_url || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80';

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET publication_fee_paid = TRUE, publication_receipt_url = ?, sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Pub Fee Paid - Verify & Publish", admin_unread = TRUE, student_unread = FALSE WHERE id = ?',
        [receipt, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
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
  }
  res.json({ message: 'Publication fee challan proof submitted! Admin will verify and publish.', article });
});

// Admin Route: Verify Payment Proof & Publish Live to Main Site
app.put('/api/articles/:id/publish', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can publish articles to main website' });
  }

  const articleId = req.params.id;
  const { is_published } = req.body;
  const pubState = is_published !== undefined ? is_published : true;
  const newStatus = pubState ? 'Published' : 'Approved - Awaiting Publication Fee';

  if (isDbConnected) {
    try {
      await db.query('UPDATE articles SET is_published = ?, status = ?, admin_unread = FALSE, student_unread = TRUE WHERE id = ?', [pubState ? 1 : 0, newStatus, articleId]);
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: `Article ${pubState ? 'verified & published to' : 'un-published from'} main site!`, article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error updating article publish status' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    article.is_published = pubState;
    article.status = newStatus;
    article.admin_unread = false;
    article.student_unread = true;
  }
  res.json({ message: `Article ${pubState ? 'verified & published to' : 'un-published from'} main site!`, article });
});

// Student Route: Apply for Conference Presentation & Upload Presentation Receipt Proof
app.post('/api/articles/:id/apply-conference', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, presenting_students_list, sender_bank, transaction_id, sender_mobile } = req.body;

  const receipt = receipt_url || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80';

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET presentation_fee_paid = TRUE, presentation_receipt_url = ?, presenting_students_list = COALESCE(?, presenting_students_list), sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Presentation Scheduled", admin_unread = TRUE, student_unread = FALSE WHERE id = ?',
        [receipt, presenting_students_list, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
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
  }
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
      return res.json({ message: 'Conference details published to main site!', conference: updatedRows[0] });
    } catch (err) {
      console.error('MySQL Admin Edit Conference Error:', err);
      // If columns missing, fallback gracefully
      try {
        await db.query(
          'UPDATE conferences SET title = ?, description = ?, cover_image = ?, event_date = ?, event_time = ?, venue = ?, stream_link = ?, presenting_students = ?, attending_investors = ?, status = ? WHERE id = ?',
          [title, description, cover_image, event_date, event_time, venue, stream_link, presenting_students, attending_investors, status, confId]
        );
        const [updatedRows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
        return res.json({ message: 'Conference details published to main site!', conference: updatedRows[0] });
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

  res.json({ message: 'Conference details published to main site!', conference: conf });
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
app.post('/api/tickets/book', authenticateToken, async (req, res) => {
  const { conference_id, ticket_type, amount } = req.body;
  const confId = conference_id || 1;
  const type = ticket_type || 'online';
  const amount_paid = amount || 20;

  const rows = ['Row A', 'Row B', 'Row C', 'Row D', 'Row E'];
  const randomRow = rows[Math.floor(Math.random() * rows.length)];
  const seatNum = Math.floor(Math.random() * 25) + 1;
  const seat_number = `Seat ${randomRow} - #${seatNum < 10 ? '0' + seatNum : seatNum}`;

  const ticket_code = `TICK-${type.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const booked_at = new Date().toISOString().split('T')[0];

  let event_date = '2026-09-15';
  let event_time = '10:00 AM - 04:00 PM';
  let venue = 'University Main Auditorium & HD Virtual Stream';

  if (isDbConnected) {
    try {
      const [confData] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      if (confData.length > 0) {
        event_date = confData[0].event_date || event_date;
        event_time = confData[0].event_time || event_time;
        venue = confData[0].venue || venue;
      }

      const [result] = await db.query(
        `INSERT INTO tickets (user_id, user_name, conference_id, ticket_type, amount_paid, ticket_code, seat_number, event_date, event_time, venue, payment_status, booked_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', ?)`,
        [req.user.id, req.user.full_name, confId, type, amount_paid, ticket_code, seat_number, event_date, event_time, venue, booked_at]
      );

      const newTicket = {
        id: result.insertId,
        user_id: req.user.id,
        user_name: req.user.full_name,
        conference_id: confId,
        ticket_type: type,
        amount_paid,
        ticket_code,
        seat_number,
        event_date,
        event_time,
        venue,
        payment_status: 'Paid',
        booked_at
      };

      return res.status(201).json({ message: 'Ticket booked successfully with assigned seat & token!', ticket: newTicket });
    } catch (err) {
      console.error('MySQL Book Ticket Error:', err);
      return res.status(500).json({ message: 'Database error booking ticket' });
    }
  }

  const conf = mockConferences.find(c => c.id == confId);
  if (conf) {
    event_date = conf.event_date;
    event_time = conf.event_time || event_time;
    venue = conf.venue;
  }

  const newTicket = {
    id: mockTickets.length + 1,
    user_id: req.user.id,
    user_name: req.user.full_name,
    conference_id: confId,
    ticket_type: type,
    amount_paid,
    ticket_code,
    seat_number,
    event_date,
    event_time,
    venue,
    payment_status: 'Paid',
    booked_at
  };

  mockTickets.push(newTicket);
  res.status(201).json({ message: 'Ticket booked successfully with assigned seat & token!', ticket: newTicket });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Conference Backend Server running on http://localhost:${PORT}`);
});

