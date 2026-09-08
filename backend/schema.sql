-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `univ_conference_db`;
USE `univ_conference_db`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'student', 'investor', 'attendee') DEFAULT 'student',
  `organization` VARCHAR(255) DEFAULT 'University',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `student_name` VARCHAR(255) DEFAULT '',
  `title` VARCHAR(500) NOT NULL,
  `abstract` TEXT NOT NULL,
  `full_text` LONGTEXT,
  `category` VARCHAR(255) DEFAULT 'General Science & Tech',
  `pdf_url` VARCHAR(500) DEFAULT 'research_paper_v1.pdf',
  `submission_receipt_url` LONGTEXT,
  `publication_receipt_url` LONGTEXT,
  `presentation_receipt_url` LONGTEXT,
  `sender_bank` VARCHAR(100) DEFAULT 'HBL Mobile App',
  `transaction_id` VARCHAR(100) DEFAULT 'TID-84920194',
  `sender_mobile` VARCHAR(50) DEFAULT '0300-1234567',
  `presenting_students_list` TEXT,
  `plagiarism_score` INT DEFAULT 5,
  `reviewer_notes` TEXT,
  `tier` VARCHAR(50) DEFAULT 'None',
  `submission_fee_paid` BOOLEAN DEFAULT TRUE,
  `publication_fee_paid` BOOLEAN DEFAULT FALSE,
  `presentation_fee_paid` BOOLEAN DEFAULT FALSE,
  `is_published` BOOLEAN DEFAULT FALSE,
  `admin_unread` BOOLEAN DEFAULT TRUE,
  `student_unread` BOOLEAN DEFAULT FALSE,
  `status` VARCHAR(50) DEFAULT 'Submitted',
  `created_at` VARCHAR(50),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Conferences Table
CREATE TABLE IF NOT EXISTS `conferences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `cover_image` TEXT,
  `event_date` VARCHAR(100),
  `event_time` VARCHAR(100) DEFAULT '10:00 AM - 04:00 PM',
  `venue` VARCHAR(255),
  `stream_link` VARCHAR(255),
  `onsite_ticket_price` DECIMAL(10,2) DEFAULT 500.00,
  `online_ticket_price` DECIMAL(10,2) DEFAULT 200.00,
  `presenting_students` TEXT,
  `attending_investors` TEXT,
  `status` VARCHAR(50) DEFAULT 'Upcoming'
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `user_name` VARCHAR(255) DEFAULT '',
  `conference_id` INT DEFAULT 1,
  `ticket_type` VARCHAR(50) DEFAULT 'online',
  `amount_paid` DECIMAL(10,2) DEFAULT 20.00,
  `ticket_code` VARCHAR(100) UNIQUE NOT NULL,
  `seat_number` VARCHAR(100) DEFAULT 'Seat Row A - #01',
  `event_date` VARCHAR(100),
  `event_time` VARCHAR(100),
  `venue` VARCHAR(255),
  `payment_status` VARCHAR(50) DEFAULT 'Paid',
  `booked_at` VARCHAR(50),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Investor Reviews Table
CREATE TABLE IF NOT EXISTS `investor_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `investor_id` INT NOT NULL,
  `investor_name` VARCHAR(255) DEFAULT '',
  `article_id` INT NOT NULL,
  `article_title` VARCHAR(500) DEFAULT '',
  `decision` VARCHAR(100) DEFAULT 'Interested to Invest',
  `benefit_for_country` VARCHAR(100) DEFAULT 'High Impact',
  `comments` TEXT,
  `created_at` VARCHAR(50),
  FOREIGN KEY (`investor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
);

-- Gallery Table
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conference_id` INT DEFAULT 1,
  `title` VARCHAR(255) NOT NULL,
  `image_url` TEXT,
  `featured_article_id` INT,
  `investor_name` VARCHAR(255),
  `description` TEXT
);

-- Seed Data
INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `organization`) VALUES
(1, 'System Admin', 'admin@univ.edu', 'password123', 'admin', 'University Board'),
(2, 'Ali Ahmed', 'student@univ.edu', 'password123', 'student', 'CS Dept'),
(3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Apex Tech Capital'),
(4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self'),
(5, 'Bazigh Minhas', 'bazighminhas1@gmail.com', 'password123', 'student', 'University Innovation Lab');

INSERT IGNORE INTO `conferences` (`id`, `title`, `description`, `cover_image`, `event_date`, `event_time`, `venue`, `stream_link`, `onsite_ticket_price`, `online_ticket_price`, `presenting_students`, `attending_investors`, `status`) VALUES
(1, 'National Innovation & Research Conference 2026', 'Annual gathering showcasing top 4 student research presentations to venture capital investors.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', '2026-09-15', '10:00 AM - 04:00 PM', 'University Main Auditorium & HD Virtual Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography), Ali Ahmed (Biocompatible Nanoparticles), Ali Ahmed (Agri Drones)', 'John Malik (Apex Tech Capital - investor@venture.com), Dr. Sarah Vance (BioHealth VC - sarah@biohealthvc.com), Hamza Qureshi (FinTech Angels - hamza@fintechangels.com)', 'Upcoming'),
(2, 'Global AI & Clean Energy Summit 2026', 'Premier international summit showcasing renewable energy research and deep learning models.', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', '2026-11-20', '09:00 AM - 05:00 PM', 'Convention Hall A & Live Stream', 'https://meet.google.com/ai-clean-energy', 75.00, 30.00, 'Ali Ahmed (Solar Grid AI), Bazigh Minhas (Quantum Cryptography)', 'John Malik (Apex Tech Capital - investor@venture.com), Silicon Venture Partners', 'Upcoming');

INSERT IGNORE INTO `articles` (`id`, `student_id`, `student_name`, `title`, `abstract`, `full_text`, `category`, `pdf_url`, `submission_receipt_url`, `publication_receipt_url`, `presentation_receipt_url`, `plagiarism_score`, `reviewer_notes`, `tier`, `submission_fee_paid`, `publication_fee_paid`, `presentation_fee_paid`, `is_published`, `admin_unread`, `student_unread`, `status`, `created_at`) VALUES
(1, 2, 'Ali Ahmed', 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments with smart micro-grids.', '1. ABSTRACT & INTRODUCTION:\nRenewable energy integration in modern municipal infrastructures poses complex intermittency challenges. This paper implements an attention-based Transformer model forecasting solar radiation with 98.4% accuracy.\n\n2. METHODOLOGY & DATASET:\nCollected 4-year continuous telemetry from 120 photovoltaic stations in Lahore and Islamabad.\n\n3. RESULTS & COMMERCIALIZATION:\nDecreased grid strain by 34.2% during peak sunlight hours. Seed capital will be utilized for municipal hardware testing.', 'Artificial Intelligence & Clean Energy', 'solar_grid_ai.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 4, 'Excellent novelty, methodology is rigorously validated by external academic peer review. Awarded Platinum Tier.', 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-25'),
(2, 2, 'Ali Ahmed', 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted tumor cells without damaging surrounding tissue.', '1. ABSTRACT:\nTargeted oncological therapy using functionalized gold-lipid core nanoparticles.\n\n2. EXPERIMENTAL FINDINGS:\nAchieved 82% tumor localization in in-vitro assays with zero off-target hepatic degradation.', 'Biotechnology & Healthcare', 'nanoparticles.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', '', 6, 'Good article. Excellent experimental validation in cellular models. Awarded Gold Tier.', 'Gold', TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, 'Published', '2026-08-28'),
(3, 5, 'Bazigh Minhas', 'Quantum Cryptography for Next-Gen Financial Banking', 'A lattice-based quantum post-encryption security framework designed for decentralized banking networks resilient against quantum decryption.', '1. EXECUTIVE ABSTRACT:\nQuantum computing threatens RSA-2048 encryption protocols. This research delivers Kyber-512 lattice key exchanges with sub-millisecond handshake latency.\n\n2. SECURITY PROOF:\nResistant against Shor algorithm attacks on post-quantum simulators.', 'Cybersecurity & Quantum Computing', 'quantum_banking.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 3, 'Outstanding theoretical foundation. Recommended for Platinum Tier evaluation.', 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-29'),
(4, 2, 'Ali Ahmed', 'Autonomous Agricultural Drones for Crop Yield Optimization', 'Multispectral computer vision pipeline deployed on lightweight drones for early detection of crop blight and automated targeted irrigation.', '1. ABSTRACT:\nCombines YOLOv8 with multispectral NDVI camera sensors to detect early stage pest infestations.\n\n2. AGRONOMIC TESTING:\nValidated over 500+ agricultural acres with 28% reduction in chemical pesticide wastage.', 'Robotics & AgriTech', 'agri_drones.pdf', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80', 5, 'Highly practical for agricultural economies. Approved for presentation.', 'Platinum', TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, 'Published', '2026-08-30');

INSERT IGNORE INTO `investor_reviews` (`id`, `investor_id`, `investor_name`, `article_id`, `article_title`, `decision`, `benefit_for_country`, `comments`, `created_at`) VALUES
(1, 3, 'John Malik (Apex Tech Capital)', 1, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Economic Impact', 'Great potential for municipal grid deployment. Willing to fund seed round of $50,000.', '2026-08-30'),
(2, 3, 'Dr. Sarah Vance (BioHealth VC)', 2, 'Biocompatible Nanoparticles for Target Drug Delivery', 'Interested to Invest', 'Global Healthcare Advancement', 'Highly scalable nanomedicine platform. Pledged $40,000 for clinical phase trial testing.', '2026-08-31'),
(3, 3, 'Hamza Qureshi (FinTech Angels)', 3, 'Quantum Cryptography for Next-Gen Financial Banking', 'Interested to Invest', 'National Cyber Security', 'Critical infrastructure protection for modern banking. Funding seed pledge of $35,000 approved.', '2026-09-01');

INSERT IGNORE INTO `gallery` (`id`, `conference_id`, `title`, `image_url`, `featured_article_id`, `investor_name`, `description`) VALUES
(1, 1, 'Solar Grid AI Awarded Top Platinum Tier', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', 1, 'John Malik (Apex Tech Capital)', 'Student Ali Ahmed received $50,000 seed investment pledge during the live pitch session.'),
(2, 1, 'Target Drug Delivery Nanomedicine Breakthrough', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80', 2, 'Dr. Sarah Vance (BioHealth VC)', 'Awarded Gold Tier for pioneering targeted drug delivery system reducing oncology side effects.'),
(3, 1, 'Quantum Encryption for Next-Gen Banking', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80', 3, 'Hamza Qureshi (FinTech Angels)', 'Student Bazigh Minhas secured $35,000 seed funding for lattice quantum encryption algorithms.'),
(4, 1, 'Autonomous Drone Crop Yield Optimization', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80', 4, 'GreenAgri Ventures Fund', 'Awarded Platinum Tier for computer vision autonomous drones optimizing crop yield across 500+ acres.');

