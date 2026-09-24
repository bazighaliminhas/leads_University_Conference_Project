const { scheduleConferenceCalendarEvent, buildGoogleCalendarWebUrl, generateDeterministicMeetCode } = require('./googleCalendarService');
const { notifyConferenceDayReminder } = require('./notificationService');

async function runTests() {
  console.log('🧪 1. Testing Deterministic Google Meet Generator...');
  const code = generateDeterministicMeetCode(1, 'National Innovation Summit 2026');
  console.log('Generated Meet URL:', code);
  if (!code.startsWith('https://meet.google.com/')) {
    throw new Error('Invalid Meet code generated');
  }

  console.log('\n🧪 2. Testing Google Calendar Web URL Generator...');
  const webUrl = buildGoogleCalendarWebUrl({
    title: 'National Innovation & Research Conference 2026',
    description: 'Annual gathering showcasing top student research',
    eventDate: '2026-09-15',
    eventTime: '10:00 AM - 04:00 PM',
    venue: 'Lahore Leads University Main Auditorium',
    meetUrl: code
  });
  console.log('Calendar 1-click Link:', webUrl.substring(0, 100) + '...');

  console.log('\n🧪 3. Testing scheduleConferenceCalendarEvent...');
  const res = await scheduleConferenceCalendarEvent({
    conferenceId: 99,
    title: 'Test AI Conference 2026',
    description: 'Testing Google Meet & Calendar Auto-scheduling',
    eventDate: '2026-10-20',
    eventTime: '09:00 AM - 05:00 PM',
    venue: 'Auditorium Hall A'
  });
  console.log('Schedule Result:', res);

  console.log('\n✅ All Calendar & Meet Service Tests Passed Successfully!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
