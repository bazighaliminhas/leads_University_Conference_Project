const axios = require('axios');

async function testStudentSubmissionFlow() {
  console.log('🚀 [TEST] Starting End-to-End Student Submission Flow...');
  
  // 1. Login as Student (Bazigh Minhas)
  const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
    email: 'bazighminhas1@gmail.com',
    password: 'password123'
  });

  const token = loginRes.data.token;
  console.log('✅ [AUTH] Logged in as:', loginRes.data.user.full_name, `(${loginRes.data.user.email})`);

  // 2. Create a high quality bank payment challan SVG image
  const challanSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
    <rect width="600" height="380" fill="#0b1329"/>
    <rect x="15" y="15" width="570" height="350" rx="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <text x="300" y="55" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">LAHORE LEADS UNIVERSITY</text>
    <text x="300" y="80" font-family="Arial, sans-serif" font-size="12" fill="#38bdf8" text-anchor="middle">ORIC OFFICIAL SUBMISSION CHALLAN PROOF</text>
    <line x1="35" y1="100" x2="565" y2="100" stroke="#334155" stroke-width="1.5"/>
    <text x="50" y="140" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Student Name:</text>
    <text x="210" y="140" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Bazigh Minhas</text>
    <text x="50" y="175" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Paper Title:</text>
    <text x="210" y="175" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#38bdf8">Next-Gen Autonomous Robotics & AI</text>
    <text x="50" y="210" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Transaction ID (TID):</text>
    <text x="210" y="210" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#10b981">TID-LLU-2026-9482</text>
    <text x="50" y="245" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Payment Channel:</text>
    <text x="210" y="245" font-family="Arial, sans-serif" font-size="13" fill="#ffffff">HBL Mobile App (Online)</text>
    <text x="50" y="280" font-family="Arial, sans-serif" font-size="13" fill="#94a3b8">Submission Fee:</text>
    <text x="210" y="280" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#10b981">PKR 1,500 (PAID & VERIFIED)</text>
    <rect x="40" y="305" width="520" height="42" rx="8" fill="#0f172a" stroke="#475569" stroke-width="1"/>
    <text x="300" y="331" font-family="Arial, sans-serif" font-size="12" fill="#38bdf8" text-anchor="middle">✅ Digitally Recorded in Google Drive Student Folder</text>
  </svg>`;
  const base64Slip = `data:image/svg+xml;base64,${Buffer.from(challanSvg).toString('base64')}`;

  // 3. Submit New Article
  console.log('📤 [SUBMITTING] Submitting article and uploading student package to Google Drive...');
  const submitRes = await axios.post('http://localhost:5000/api/articles', {
    journal_id: 1,
    title: 'Next-Gen Autonomous Robotics & AI Systems',
    category: 'Artificial Intelligence & Robotics',
    abstract: 'This research paper investigates real-time edge computing frameworks and neural motion planning for autonomous surgical and industrial robotics, validated under rigorous latency tests.',
    full_text: `ABSTRACT:
This research paper investigates real-time edge computing frameworks and neural motion planning for autonomous surgical and industrial robotics, validated under rigorous latency tests.

1. INTRODUCTION:
Autonomous robotic navigation requires deterministic compute models combined with ultra-low latency vision processing.

2. SYSTEM METHODOLOGY & NEURAL NETWORK ARCHITECTURE:
Our architecture leverages deep sensor fusion across LiDAR and stereo cameras with onboard neural acceleration.

3. BENCHMARKS & EXPERIMENTAL VALIDATION:
Experiments on real-world industrial environments demonstrated a 34% reduction in path-planning latency and zero collision failure modes.

4. CONCLUSION:
The proposed framework provides a robust foundation for next-generation university and commercial robotic deployments.`,
    submission_receipt_url: base64Slip,
    pdf_url: 'autonomous_robotics_manuscript.pdf',
    sender_bank: 'HBL Mobile Banking',
    transaction_id: 'TID-LLU-2026-9482',
    sender_mobile: '+923482727605'
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('🎉 [SUCCESS] Article Submission Response:');
  console.log('Article ID:', submitRes.data.article.id);
  console.log('Receipt URL in Drive:', submitRes.data.article.submission_receipt_url);
  console.log('Status:', submitRes.data.article.status);
}

testStudentSubmissionFlow().catch(err => {
  console.error('❌ Error during test:', err.response?.data || err.message);
});
