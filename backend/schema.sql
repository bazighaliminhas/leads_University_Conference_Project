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
  `student_name` VARCHAR(255) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `abstract` TEXT NOT NULL,
  `category` VARCHAR(255) DEFAULT 'General Science & Tech',
  `plagiarism_score` INT DEFAULT 5,
  `reviewer_notes` TEXT,
  `tier` VARCHAR(50) DEFAULT 'Pending',
  `submission_fee_paid` BOOLEAN DEFAULT TRUE,
  `presentation_fee_paid` BOOLEAN DEFAULT FALSE,
  `status` VARCHAR(50) DEFAULT 'Under Review',
  `created_at` VARCHAR(50),
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Conferences Table
CREATE TABLE IF NOT EXISTS `conferences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `event_date` VARCHAR(100),
  `venue` VARCHAR(255),
  `stream_link` VARCHAR(255),
  `onsite_ticket_price` DECIMAL(10,2) DEFAULT 50.00,
  `online_ticket_price` DECIMAL(10,2) DEFAULT 20.00,
  `status` VARCHAR(50) DEFAULT 'Upcoming'
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `user_name` VARCHAR(255) NOT NULL,
  `conference_id` INT DEFAULT 1,
  `ticket_type` VARCHAR(50) DEFAULT 'online',
  `amount_paid` DECIMAL(10,2) DEFAULT 20.00,
  `ticket_code` VARCHAR(100) UNIQUE NOT NULL,
  `payment_status` VARCHAR(50) DEFAULT 'Paid',
  `booked_at` VARCHAR(50),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Investor Reviews Table
CREATE TABLE IF NOT EXISTS `investor_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `investor_id` INT NOT NULL,
  `investor_name` VARCHAR(255) NOT NULL,
  `article_id` INT NOT NULL,
  `article_title` VARCHAR(500) NOT NULL,
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

-- Seed Data (Initial Defaults)
INSERT IGNORE INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `organization`) VALUES
(1, 'System Admin', 'admin@univ.edu', 'password123', 'admin', 'University Board'),
(2, 'Ali Ahmed', 'student@univ.edu', 'password123', 'student', 'CS Dept'),
(3, 'John Malik', 'investor@venture.com', 'password123', 'investor', 'Tech Fund VC'),
(4, 'Sara Khan', 'attendee@gmail.com', 'password123', 'attendee', 'Self');

INSERT IGNORE INTO `conferences` (`id`, `title`, `description`, `event_date`, `venue`, `stream_link`, `onsite_ticket_price`, `online_ticket_price`, `status`) VALUES
(1, 'National Innovation & Research Conference 2026', 'Annual gathering of university innovators, researchers, and venture capital investors.', '2026-09-15 10:00:00', 'University Main Auditorium & Virtual Stream', 'https://meet.google.com/xyz-demo-stream', 50.00, 20.00, 'Upcoming');

INSERT IGNORE INTO `articles` (`id`, `student_id`, `student_name`, `title`, `abstract`, `category`, `plagiarism_score`, `reviewer_notes`, `tier`, `submission_fee_paid`, `presentation_fee_paid`, `status`, `created_at`) VALUES
(1, 2, 'Ali Ahmed', 'AI Driven Solar Grid Optimization for Smart Cities', 'This research paper proposes a deep learning framework to optimize renewable solar energy distribution in urban environments.', 'Artificial Intelligence & Clean Energy', 8, 'Excellent novelty, methodology is well validated.', 'Platinum', TRUE, TRUE, 'Approved', '2026-08-25'),
(2, 2, 'Ali Ahmed', 'Biocompatible Nanoparticles for Target Drug Delivery', 'A revolutionary approach in nanomedicine to deliver anti-cancer therapeutics directly to targeted cells without damaging surrounding tissue.', 'Biotechnology & Healthcare', 14, 'Good article. Needs slight polishing in results chapter.', 'Gold', TRUE, FALSE, 'Under Review', '2026-08-28');

INSERT IGNORE INTO `investor_reviews` (`id`, `investor_id`, `investor_name`, `article_id`, `article_title`, `decision`, `benefit_for_country`, `comments`, `created_at`) VALUES
(1, 3, 'John Malik', 1, 'AI Driven Solar Grid Optimization for Smart Cities', 'Interested to Invest', 'High Impact', 'Great potential for municipal deployment. Willing to fund seed round of $50,000.', '2026-08-30');

INSERT IGNORE INTO `gallery` (`id`, `conference_id`, `title`, `image_url`, `featured_article_id`, `investor_name`, `description`) VALUES
(1, 1, 'Solar Grid AI Awarded Top Platinum Tier', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', 1, 'John Malik (Apex Tech Ventures)', 'Student Ali Ahmed received investment pledge from Apex Tech Ventures during the live pitch session.');
