const { testDriveConnection, uploadBase64ToDrive } = require('./googleDriveService');

async function testDrive() {
  console.log('Testing Google Drive Connection...');
  const conn = await testDriveConnection();
  console.log('Connection test result:', conn);

  if (conn.success) {
    console.log('Testing Uploading a sample file to Google Drive...');
    const sampleText = `===================================================================
LAHORE LEADS UNIVERSITY - ORIC RESEARCH REPOSITORY
OFFICIAL STUDENT MANUSCRIPT & SUBMISSION RECORD
===================================================================
Student Name:      Bazigh Minhas
Student Email:     bazighminhas1@gmail.com
Student Mobile:    +923482727605
Paper Title:       Artificial Intelligence in Autonomous Medical Systems
Category/Field:    Artificial Intelligence & Robotics
Submission Date:   ${new Date().toLocaleString()}
Plagiarism Status: Clean (0% Plagiarism Verified)
Transaction ID:    TID-LLU-9823471029
Payment Channel:   Meezan Bank Mobile App (PKR 1,500 - Verified)
Status:            Submitted - Under Peer Review
-------------------------------------------------------------------
ABSTRACT:
This paper introduces deep learning models for real-time robotic diagnostics and automation in modern clinical operating rooms.

FULL MANUSCRIPT TEXT:
Section 1: Introduction and Literature Review...
Section 2: Neural Architecture & Dataset Benchmarks...
Section 3: Experimental Results and Statistical Analysis...
===================================================================`;

    const base64Text = `data:text/plain;base64,${Buffer.from(sampleText).toString('base64')}`;

    const uploadRes = await uploadBase64ToDrive({
      base64Data: base64Text,
      fileName: 'Manuscript_Summary_&_Details.txt',
      mimeType: 'text/plain',
      subfolderName: 'Student_Submissions/Bazigh_Minhas/AI_Robotics_Paper'
    });
    console.log('Upload result for student folder test:', uploadRes);
  }
}

testDrive();
