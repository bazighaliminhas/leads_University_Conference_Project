const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'univ_conference_secret_key_2026';

// Database Connection Config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'univ_conference_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
    console.log(`Notice during column check for ${table}.${column}:`, err.message);
  }
}

// Initialize Database & Tables automatically if MySQL is running
async function initDatabase() {
  try {
    // 1. Connection check without database specified to create database if missing
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    }).promise();

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // 2. Create tables
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
        \`category\` VARCHAR(255) DEFAULT 'General Science & Tech',
        \`plagiarism_score\` INT DEFAULT 5,
        \`reviewer_notes\` TEXT,
        \`tier\` VARCHAR(50) DEFAULT 'Pending',
        \`submission_fee_paid\` BOOLEAN DEFAULT TRUE,
        \`presentation_fee_paid\` BOOLEAN DEFAULT FALSE,
        \`status\` VARCHAR(50) DEFAULT 'Under Review',
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
        \`onsite_ticket_price\` DECIMAL(10,2) DEFAULT 50.00,
        \`online_ticket_price\` DECIMAL(10,2) DEFAULT 20.00,
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

    // Ensure missing columns on existing tables
    await ensureColumn('articles', 'student_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('articles', 'is_published', 'BOOLEAN DEFAULT FALSE');
    await ensureColumn('articles', 'pdf_url', "VARCHAR(500) DEFAULT 'research_paper_v1.pdf'");
    await ensureColumn('articles', 'submission_receipt_url', "VARCHAR(500) DEFAULT 'submission_receipt.png'");
    await ensureColumn('articles', 'publication_receipt_url', "VARCHAR(500) DEFAULT ''");
    await ensureColumn('articles', 'presentation_receipt_url', "VARCHAR(500) DEFAULT ''");
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

    // Seed default admin and initial sample records if empty
    const [userRows] = await db.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      await db.query(`
        INSERT INTO users (id, full_name, email, password, role, organization) VALUES
        (1, 'System Admin', 'admin@univ.edu', 'password123', 'admin', 'University Board'),
        (2, 'Ali Ahmed', 'student@univ.edu', 'password123', 'student', 'CS Dept'),
        (3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Apex Tech Capital'),
        (4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self'),
        (5, 'Bazigh Minhas', 'bazighminhas1@gmail.com', 'password123', 'student', 'University Innovation Lab');
      `);
    }

    const [confRows] = await db.query('SELECT COUNT(*) AS count FROM conferences');
    if (confRows[0].count === 0) {
      await db.query(`
        INSERT INTO conferences (id, title, description, event_date, venue, stream_link, onsite_ticket_price, online_ticket_price, status) VALUES
        (1, 'National Innovation & Research Conference 2026', 'Annual gathering of university innovators, researchers, and venture capital investors.', '2026-09-15 10:00:00', 'University Main Auditorium & Virtual Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Upcoming'),
        (2, 'Global AI & Clean Energy Summit 2026', 'Premier international summit showcasing renewable energy research and deep learning models.', '2026-11-20 09:00:00', 'Convention Hall A & Live Stream', 'https://meet.google.com/ai-clean-energy', 75.00, 30.00, 'Upcoming');
      `);
    }

    const [artRows] = await db.query('SELECT COUNT(*) AS count FROM articles');
    if (artRows[0].count <= 2) {
      await db.query(`
        INSERT IGNORE INTO articles (id, student_id, student_name, title, abstract, category, plagiarism_score, reviewer_notes, tier, submission_fee_paid, presentation_fee_paid, status, created_at) VALUES
        (1, 2, 'Ali Ahmed', 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments.', 'Artificial Intelligence & Clean Energy', 4, 'Excellent novelty, methodology is well validated.', 'Platinum', TRUE, TRUE, 'Approved', '2026-08-25'),
        (2, 2, 'Ali Ahmed', 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted tumor cells without damaging surrounding tissue.', 'Biotechnology & Healthcare', 6, 'Good article. Excellent experimental validation in cellular models.', 'Gold', TRUE, FALSE, 'Under Review', '2026-08-28'),
        (3, 5, 'Bazigh Minhas', 'Quantum Cryptography for Next-Gen Financial Banking', 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.', 'Cybersecurity & Quantum Computing', 3, 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.', 'Platinum', TRUE, TRUE, 'Approved', '2026-08-29'),
        (4, 2, 'Ali Ahmed', 'Autonomous Agricultural Drones for Crop Yield Optimization', 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.', 'Robotics & AgriTech', 5, 'Highly practical for agricultural economies. Approved for presentation.', 'Platinum', TRUE, TRUE, 'Approved', '2026-08-30');
      `);
    }

    const [revRows] = await db.query('SELECT COUNT(*) AS count FROM investor_reviews');
    if (revRows[0].count <= 1) {
      await db.query(`
        INSERT IGNORE INTO investor_reviews (id, investor_id, investor_name, article_id, article_title, decision, benefit_for_country, comments, created_at) VALUES
        (1, 3, 'John Malik (Apex Tech Capital)', 1, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Impact', 'Great potential for municipal deployment. Willing to fund seed round of $50,000.', '2026-08-30'),
        (2, 3, 'Dr. Sarah Vance (BioHealth VC)', 2, 'Biocompatible Nanoparticles for Target Drug Delivery', 'Interested to Invest', 'Global Healthcare Advancement', 'Highly scalable nanomedicine platform. Pledged $40,000 for clinical phase trial testing.', '2026-08-31'),
        (3, 3, 'Hamza Qureshi (FinTech Angels)', 3, 'Quantum Cryptography for Next-Gen Financial Banking', 'Interested to Invest', 'National Cyber Security', 'Critical infrastructure protection for modern banking. Funding seed pledge of $35,000 approved.', '2026-09-01');
      `);
    }

    const [galRows] = await db.query('SELECT COUNT(*) AS count FROM gallery');
    if (galRows[0].count <= 1) {
      await db.query(`
        INSERT IGNORE INTO gallery (id, conference_id, title, image_url, featured_article_id, investor_name, description) VALUES
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
    console.log('⚠️ Database connection warning:', err.message);
  }
}

// Run DB Initialization
initDatabase();

// In-Memory Storage Fallback
let mockUsers = [
  { id: 1, full_name: 'System Admin', email: 'admin@univ.edu', password: 'password123', role: 'admin', organization: 'University Board' },
  { id: 2, full_name: 'Ali Ahmed', email: 'student@univ.edu', password: 'password123', role: 'student', organization: 'CS Dept' },
  { id: 3, full_name: 'John Malik', email: 'investor@venture.com', password: 'password123', role: 'investor', organization: 'Apex Tech Capital' },
  { id: 4, full_name: 'Sara Khan', email: 'attendee@gmail.com', password: 'password123', role: 'attendee', organization: 'Self' },
  { id: 5, full_name: 'Bazigh Minhas', email: 'bazighminhas1@gmail.com', password: 'password123', role: 'student', organization: 'University Innovation Lab' }
];

let mockArticles = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Ali Ahmed',
    title: 'AI Driven Solar Grid Optimization for Smart Cities',
    abstract: 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments.',
    category: 'Artificial Intelligence & Clean Energy',
    plagiarism_score: 4,
    reviewer_notes: 'Excellent novelty, methodology is well validated.',
    tier: 'Platinum',
    submission_fee_paid: true,
    presentation_fee_paid: true,
    status: 'Approved',
    created_at: '2026-08-25'
  },
  {
    id: 2,
    student_id: 2,
    student_name: 'Ali Ahmed',
    title: 'Biocompatible Nanoparticles for Target Drug Delivery',
    abstract: 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted cells without damaging surrounding tissue.',
    category: 'Biotechnology & Healthcare',
    plagiarism_score: 6,
    reviewer_notes: 'Good article. Needs slight polishing in results chapter.',
    tier: 'Gold',
    submission_fee_paid: true,
    presentation_fee_paid: false,
    status: 'Under Review',
    created_at: '2026-08-28'
  },
  {
    id: 3,
    student_id: 5,
    student_name: 'Bazigh Minhas',
    title: 'Quantum Cryptography for Next-Gen Financial Banking',
    abstract: 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.',
    category: 'Cybersecurity & Quantum Computing',
    plagiarism_score: 3,
    reviewer_notes: 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.',
    tier: 'Platinum',
    submission_fee_paid: true,
    presentation_fee_paid: true,
    status: 'Approved',
    created_at: '2026-08-29'
  },
  {
    id: 4,
    student_id: 2,
    student_name: 'Ali Ahmed',
    title: 'Autonomous Agricultural Drones for Crop Yield Optimization',
    abstract: 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.',
    category: 'Robotics & AgriTech',
    plagiarism_score: 5,
    reviewer_notes: 'Highly practical for agricultural economies. Approved for presentation.',
    tier: 'Platinum',
    submission_fee_paid: true,
    presentation_fee_paid: true,
    status: 'Approved',
    created_at: '2026-08-30'
  }
];

let mockConferences = [
  {
    id: 1,
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering of university innovators, researchers, and venture capital investors.',
    event_date: '2026-09-15 10:00:00',
    venue: 'University Main Auditorium & Virtual Stream',
    stream_link: 'https://meet.google.com/xyz-demo-stream',
    onsite_ticket_price: 50,
    online_ticket_price: 20,
    status: 'Upcoming'
  },
  {
    id: 2,
    title: 'Global AI & Clean Energy Summit 2026',
    description: 'Premier international summit showcasing renewable energy research and deep learning models.',
    event_date: '2026-11-20 09:00:00',
    venue: 'Convention Hall A & Live Stream',
    stream_link: 'https://meet.google.com/ai-clean-energy',
    onsite_ticket_price: 75,
    online_ticket_price: 30,
    status: 'Upcoming'
  }
];

let mockTickets = [
  {
    id: 1,
    user_id: 4,
    user_name: 'Sara Khan',
    conference_id: 1,
    ticket_type: 'online',
    amount_paid: 20,
    ticket_code: 'TICK-ONLINE-98762',
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
    benefit_for_country: 'High Impact',
    comments: 'Great potential for municipal deployment. Willing to fund seed round of $50,000.',
    created_at: '2026-08-30'
  },
  {
    id: 2,
    investor_id: 3,
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
    investor_id: 3,
    investor_name: 'Hamza Qureshi (FinTech Angels)',
    article_id: 3,
    article_title: 'Quantum Cryptography for Next-Gen Financial Banking',
    decision: 'Interested to Invest',
    benefit_for_country: 'National Cyber Security',
    comments: 'Critical infrastructure protection for modern banking. Funding seed pledge of $35,000 approved.',
    created_at: '2026-09-01'
  }
];

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

  if (isDbConnected) {
    try {
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const userRole = role || 'student';
      const userOrg = organization || 'University';

      const [result] = await db.query(
        'INSERT INTO users (full_name, email, password, role, organization) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, password, userRole, userOrg]
      );

      const userId = result.insertId;
      console.log(`✅ Registered user '${email}' permanently into MySQL DB with ID ${userId}`);
      const token = jwt.sign({ id: userId, email, role: userRole, full_name }, JWT_SECRET, { expiresIn: '1d' });

      return res.status(201).json({
        message: 'User registered successfully!',
        token,
        user: { id: userId, full_name, email, role: userRole, organization: userOrg }
      });
    } catch (err) {
      console.error('MySQL Registration Error:', err);
      return res.status(500).json({ message: 'Database error during registration' });
    }
  }

  // Fallback if DB not active
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newUser = {
    id: mockUsers.length + 1,
    full_name,
    email,
    password,
    role: role || 'student',
    organization: organization || 'University'
  };

  mockUsers.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, full_name: newUser.full_name }, JWT_SECRET, { expiresIn: '1d' });

  res.status(201).json({
    message: 'User registered successfully!',
    token,
    user: { id: newUser.id, full_name: newUser.full_name, email: newUser.email, role: newUser.role }
  });
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, full_name: user.full_name }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, organization: user.organization }
      });
    } catch (err) {
      console.error('MySQL Login Error:', err);
      return res.status(500).json({ message: 'Database error during login' });
    }
  }

  // Fallback
  const user = mockUsers.find(u => u.email === email && u.password === password);
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
      if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
      return res.json(rows[0]);
    } catch (err) {
      return res.status(500).json({ message: 'Database error fetching profile' });
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
      console.error('MySQL Get Articles Error:', err);
    }
  }

  if (student_id) {
    const list = mockArticles.filter(a => a.student_id == student_id);
    return res.json(list);
  }
  res.json(mockArticles);
});

// Submit New Article
app.post('/api/articles', authenticateToken, async (req, res) => {
  const { title, abstract, category } = req.body;
  if (!title || !abstract) {
    return res.status(400).json({ message: 'Title and abstract are required' });
  }

  const plagiarism_score = Math.floor(Math.random() * 12) + 3;
  const created_at = new Date().toISOString().split('T')[0];
  const cat = category || 'General Science & Tech';
  const notes = 'Under review by university academic committee.';

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO articles (student_id, student_name, title, abstract, category, plagiarism_score, reviewer_notes, tier, submission_fee_paid, presentation_fee_paid, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', TRUE, FALSE, 'Under Review', ?)`,
        [req.user.id, req.user.full_name, title, abstract, cat, plagiarism_score, notes, created_at]
      );

      const newArticle = {
        id: result.insertId,
        student_id: req.user.id,
        student_name: req.user.full_name,
        title,
        abstract,
        category: cat,
        plagiarism_score,
        reviewer_notes: notes,
        tier: 'Pending',
        submission_fee_paid: true,
        presentation_fee_paid: false,
        status: 'Under Review',
        created_at
      };

      return res.status(201).json({ message: 'Article submitted successfully!', article: newArticle });
    } catch (err) {
      console.error('MySQL Submit Article Error:', err);
      return res.status(500).json({ message: 'Database error submitting article' });
    }
  }

  const newArticle = {
    id: mockArticles.length + 1,
    student_id: req.user.id,
    student_name: req.user.full_name,
    title,
    abstract,
    category: cat,
    plagiarism_score,
    reviewer_notes: notes,
    tier: 'Pending',
    submission_fee_paid: true,
    presentation_fee_paid: false,
    status: 'Under Review',
    created_at
  };

  mockArticles.push(newArticle);
  res.status(201).json({ message: 'Article submitted successfully!', article: newArticle });
});

// Admin Review Endpoint
app.put('/api/articles/:id/review', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin / Review Team can grade articles' });
  }

  const articleId = req.params.id;
  const { tier, plagiarism_score, reviewer_notes, status } = req.body;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (rows.length === 0) return res.status(404).json({ message: 'Article not found' });

      const current = rows[0];
      const updatedTier = tier !== undefined ? tier : current.tier;
      const updatedPlagiarism = plagiarism_score !== undefined ? plagiarism_score : current.plagiarism_score;
      const updatedNotes = reviewer_notes !== undefined ? reviewer_notes : current.reviewer_notes;
      const updatedStatus = status !== undefined ? status : current.status;
      const updatedIsPublished = req.body.is_published !== undefined ? req.body.is_published : current.is_published;

      await db.query(
        'UPDATE articles SET tier = ?, plagiarism_score = ?, reviewer_notes = ?, status = ?, is_published = ? WHERE id = ?',
        [updatedTier, updatedPlagiarism, updatedNotes, updatedStatus, updatedIsPublished, articleId]
      );

      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Article updated successfully by Reviewer!', article: updatedRows[0] });
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
  if (req.body.is_published !== undefined) article.is_published = req.body.is_published;

  res.json({ message: 'Article updated successfully by Reviewer!', article });
});

// Student Route: Re-submit Revised Article (Free Revision)
app.put('/api/articles/:id/revise', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { title, abstract, pdf_url } = req.body;

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET title = COALESCE(?, title), abstract = COALESCE(?, abstract), pdf_url = COALESCE(?, pdf_url), status = "Revised" WHERE id = ? AND student_id = ?',
        [title, abstract, pdf_url, articleId, req.user.id]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Article revised & submitted to Admin for review!', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error revising article' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) {
    if (title) article.title = title;
    if (abstract) article.abstract = abstract;
    if (pdf_url) article.pdf_url = pdf_url;
    article.status = 'Revised';
  }
  res.json({ message: 'Article revised & submitted to Admin for review!', article });
});

// Student Route: Pay Publication Fee & Upload Receipt Proof
app.post('/api/articles/:id/pay-publication', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, sender_bank, transaction_id, sender_mobile } = req.body;

  const receipt = receipt_url || `receipt_pub_${Date.now()}.png`;

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET publication_fee_paid = TRUE, publication_receipt_url = ?, sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Pub Fee Paid" WHERE id = ?',
        [receipt, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Publication fee receipt submitted! Admin will verify and publish live.', article: updatedRows[0] });
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
    article.status = 'Pub Fee Paid';
  }
  res.json({ message: 'Publication fee receipt submitted! Admin will verify and publish live.', article });
});

// Student Route: Apply for Conference Presentation & Upload Presentation Receipt Proof
app.post('/api/articles/:id/apply-conference', authenticateToken, async (req, res) => {
  const articleId = req.params.id;
  const { receipt_url, presenting_students_list, sender_bank, transaction_id, sender_mobile } = req.body;

  const receipt = receipt_url || `receipt_pres_${Date.now()}.png`;

  if (isDbConnected) {
    try {
      await db.query(
        'UPDATE articles SET presentation_fee_paid = TRUE, presentation_receipt_url = ?, presenting_students_list = COALESCE(?, presenting_students_list), sender_bank = COALESCE(?, sender_bank), transaction_id = COALESCE(?, transaction_id), sender_mobile = COALESCE(?, sender_mobile), status = "Presentation Scheduled" WHERE id = ?',
        [receipt, presenting_students_list, sender_bank, transaction_id, sender_mobile, articleId]
      );
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: 'Conference presentation fee receipt submitted! Admin scheduled your paper for presentation.', article: updatedRows[0] });
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
  }
  res.json({ message: 'Conference presentation fee receipt submitted! Admin scheduled your paper for presentation.', article });
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

// Admin Route: Edit Conference Schedule, Cover Image, 1-4 Presenting Students & Attending Investors
app.put('/api/admin/conferences/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can update conference details' });
  }

  const confId = req.params.id;
  const { title, description, cover_image, event_date, event_time, venue, presenting_students, attending_investors, status } = req.body;

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
      const updatedStudents = presenting_students !== undefined ? presenting_students : current.presenting_students;
      const updatedInvestors = attending_investors !== undefined ? attending_investors : current.attending_investors;
      const updatedStatus = status || current.status;

      await db.query(
        'UPDATE conferences SET title = ?, description = ?, cover_image = ?, event_date = ?, event_time = ?, venue = ?, presenting_students = ?, attending_investors = ?, status = ? WHERE id = ?',
        [updatedTitle, updatedDesc, updatedCover, updatedDate, updatedTime, updatedVenue, updatedStudents, updatedInvestors, updatedStatus, confId]
      );

      const [updatedRows] = await db.query('SELECT * FROM conferences WHERE id = ?', [confId]);
      return res.json({ message: 'Conference post details updated by Admin!', conference: updatedRows[0] });
    } catch (err) {
      console.error('MySQL Admin Edit Conference Error:', err);
      return res.status(500).json({ message: 'Database error updating conference' });
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
  if (presenting_students) conf.presenting_students = presenting_students;
  if (attending_investors) conf.attending_investors = attending_investors;
  if (status) conf.status = status;

  res.json({ message: 'Conference post details updated by Admin!', conference: conf });
});

// Admin Route: Toggle Article Publish to Main Site
app.put('/api/articles/:id/publish', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only Admin can publish articles to main website' });
  }

  const articleId = req.params.id;
  const { is_published } = req.body;

  if (isDbConnected) {
    try {
      await db.query('UPDATE articles SET is_published = ? WHERE id = ?', [is_published ? 1 : 0, articleId]);
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      return res.json({ message: `Article ${is_published ? 'published to' : 'removed from'} main site!`, article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error updating article publish status' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (article) article.is_published = is_published;
  res.json({ message: `Article ${is_published ? 'published to' : 'removed from'} main site!`, article });
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
  let venue = 'University Main Auditorium & HD Stream';

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Conference Backend Server running on http://localhost:${PORT}`);
});
