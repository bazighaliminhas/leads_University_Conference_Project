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
    await ensureColumn('tickets', 'user_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('investor_reviews', 'investor_name', "VARCHAR(255) DEFAULT ''");
    await ensureColumn('investor_reviews', 'article_title', "VARCHAR(500) DEFAULT ''");

    // Seed default admin and initial sample records if empty
    const [userRows] = await db.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      await db.query(`
        INSERT INTO users (id, full_name, email, password, role, organization) VALUES
        (1, 'System Admin', 'admin@univ.edu', 'password123', 'admin', 'University Board'),
        (2, 'Ali Ahmed', 'student@univ.edu', 'password123', 'student', 'CS Dept'),
        (3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Tech Fund VC'),
        (4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self');
      `);
    }

    const [confRows] = await db.query('SELECT COUNT(*) AS count FROM conferences');
    if (confRows[0].count === 0) {
      await db.query(`
        INSERT INTO conferences (id, title, description, event_date, venue, stream_link, onsite_ticket_price, online_ticket_price, status) VALUES
        (1, 'National Innovation & Research Conference 2026', 'Annual gathering of university innovators, researchers, and venture capital investors.', '2026-09-15 10:00:00', 'University Main Auditorium & Virtual Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Upcoming');
      `);
    }

    const [artRows] = await db.query('SELECT COUNT(*) AS count FROM articles');
    if (artRows[0].count === 0) {
      await db.query(`
        INSERT INTO articles (id, student_id, student_name, title, abstract, category, plagiarism_score, reviewer_notes, tier, submission_fee_paid, presentation_fee_paid, status, created_at) VALUES
        (1, 2, 'Ali Ahmed', 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments.', 'Artificial Intelligence & Clean Energy', 8, 'Excellent novelty, methodology is well validated.', 'Platinum', TRUE, TRUE, 'Approved', '2026-08-25'),
        (2, 2, 'Ali Ahmed', 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted cells without damaging surrounding tissue.', 'Biotechnology & Healthcare', 14, 'Good article. Needs slight polishing in results chapter.', 'Gold', TRUE, FALSE, 'Under Review', '2026-08-28');
      `);
    }

    const [revRows] = await db.query('SELECT COUNT(*) AS count FROM investor_reviews');
    if (revRows[0].count === 0) {
      await db.query(`
        INSERT INTO investor_reviews (id, investor_id, investor_name, article_id, article_title, decision, benefit_for_country, comments, created_at) VALUES
        (1, 3, 'John Malik', 1, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Impact', 'Great potential for municipal deployment. Willing to fund seed round of $50,000.', '2026-08-30');
      `);
    }

    const [galRows] = await db.query('SELECT COUNT(*) AS count FROM gallery');
    if (galRows[0].count === 0) {
      await db.query(`
        INSERT INTO gallery (id, conference_id, title, image_url, featured_article_id, investor_name, description) VALUES
        (1, 1, 'Solar Grid AI Awarded Top Platinum Tier', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 1, 'John Malik (Apex Tech Ventures)', 'Student Ali Ahmed received investment pledge from Apex Tech Ventures during the live pitch session.');
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
  { id: 3, full_name: 'John Malik', email: 'investor@venture.com', password: 'password123', role: 'investor', organization: 'Tech Fund VC' },
  { id: 4, full_name: 'Sara Khan', email: 'attendee@gmail.com', password: 'password123', role: 'attendee', organization: 'Self' }
];

let mockArticles = [
  {
    id: 1,
    student_id: 2,
    student_name: 'Ali Ahmed',
    title: 'AI Driven Solar Grid Optimization for Smart Cities',
    abstract: 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments.',
    category: 'Artificial Intelligence & Clean Energy',
    plagiarism_score: 8,
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
    plagiarism_score: 14,
    reviewer_notes: 'Good article. Needs slight polishing in results chapter.',
    tier: 'Gold',
    submission_fee_paid: true,
    presentation_fee_paid: false,
    status: 'Under Review',
    created_at: '2026-08-28'
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
    investor_name: 'John Malik',
    article_id: 1,
    article_title: 'AI Driven Solar Grid Optimization for Smart Cities',
    decision: 'Interested to Invest',
    benefit_for_country: 'High Impact',
    comments: 'Great potential for municipal deployment. Willing to fund seed round of $50,000.',
    created_at: '2026-08-30'
  }
];

let mockGallery = [
  {
    id: 1,
    conference_id: 1,
    title: 'Solar Grid AI Awarded Top Platinum Tier',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    featured_article_id: 1,
    investor_name: 'John Malik (Apex Tech Ventures)',
    description: 'Student Ali Ahmed received investment pledge from Apex Tech Ventures during the live pitch session.'
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
      const updatedTier = tier || current.tier;
      const updatedPlagiarism = plagiarism_score !== undefined ? plagiarism_score : current.plagiarism_score;
      const updatedNotes = reviewer_notes || current.reviewer_notes;
      const updatedStatus = status || current.status;

      await db.query(
        'UPDATE articles SET tier = ?, plagiarism_score = ?, reviewer_notes = ?, status = ? WHERE id = ?',
        [updatedTier, updatedPlagiarism, updatedNotes, updatedStatus, articleId]
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

  if (tier) article.tier = tier;
  if (plagiarism_score !== undefined) article.plagiarism_score = plagiarism_score;
  if (reviewer_notes) article.reviewer_notes = reviewer_notes;
  if (status) article.status = status;

  res.json({ message: 'Article updated successfully by Reviewer!', article });
});

// Pay Presentation Fee
app.post('/api/articles/:id/pay-presentation', authenticateToken, async (req, res) => {
  const articleId = req.params.id;

  if (isDbConnected) {
    try {
      const [rows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);
      if (rows.length === 0) return res.status(404).json({ message: 'Article not found' });

      await db.query('UPDATE articles SET presentation_fee_paid = TRUE WHERE id = ?', [articleId]);
      const [updatedRows] = await db.query('SELECT * FROM articles WHERE id = ?', [articleId]);

      return res.json({ message: 'Presentation fee paid successfully! You are now scheduled for live presentation in the conference.', article: updatedRows[0] });
    } catch (err) {
      return res.status(500).json({ message: 'Database error updating payment' });
    }
  }

  const article = mockArticles.find(a => a.id == articleId);
  if (!article) return res.status(404).json({ message: 'Article not found' });

  article.presentation_fee_paid = true;
  res.json({ message: 'Presentation fee paid successfully! You are now scheduled for live presentation in the conference.', article });
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

// Book Ticket
app.post('/api/tickets/book', authenticateToken, async (req, res) => {
  const { conference_id, ticket_type, amount } = req.body;
  const type = ticket_type || 'online';
  const amount_paid = amount || 20;
  const ticket_code = `TICK-${type.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const booked_at = new Date().toISOString().split('T')[0];

  if (isDbConnected) {
    try {
      const [result] = await db.query(
        `INSERT INTO tickets (user_id, user_name, conference_id, ticket_type, amount_paid, ticket_code, payment_status, booked_at)
         VALUES (?, ?, ?, ?, ?, ?, 'Paid', ?)`,
        [req.user.id, req.user.full_name, conference_id || 1, type, amount_paid, ticket_code, booked_at]
      );

      const newTicket = {
        id: result.insertId,
        user_id: req.user.id,
        user_name: req.user.full_name,
        conference_id: conference_id || 1,
        ticket_type: type,
        amount_paid,
        ticket_code,
        payment_status: 'Paid',
        booked_at
      };

      return res.status(201).json({ message: 'Ticket booked successfully!', ticket: newTicket });
    } catch (err) {
      console.error('MySQL Book Ticket Error:', err);
      return res.status(500).json({ message: 'Database error booking ticket' });
    }
  }

  const newTicket = {
    id: mockTickets.length + 1,
    user_id: req.user.id,
    user_name: req.user.full_name,
    conference_id: conference_id || 1,
    ticket_type: type,
    amount_paid,
    ticket_code,
    payment_status: 'Paid',
    booked_at
  };

  mockTickets.push(newTicket);
  res.status(201).json({ message: 'Ticket booked successfully!', ticket: newTicket });
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
