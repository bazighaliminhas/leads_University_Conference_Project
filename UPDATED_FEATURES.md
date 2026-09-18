# Professional Portal Upgrade

Implemented in this build:

- Persistent in-portal notifications for students/admins (MySQL-backed, memory fallback).
- Global notification bell with unread count and deep links.
- Student notifications when an article is submitted/reviewed/published and when conferences are published.
- Admin WhatsApp/Email audit remains available, with live test endpoint.
- Google Drive Admin Settings: Folder ID + replaceable service-account JSON, connection validation, Save & Activate, Test Connection, and DB Backup.
- Service-account JSON uploaded from Admin Settings is AES-256-GCM encrypted on disk and never returned to the browser.
- Drive upload endpoint now requires authentication.
- Improved Google Drive image/PDF preview links for admin payment proof inspection.
- Payment metadata no longer displays fake transaction/bank defaults.
- Publication payment proof is mandatory.
- Random/fake plagiarism score generation removed (field remains empty until a real plagiarism provider is integrated).
- Admin user management APIs and user list/delete UI.
- `/admin/*` reload-safe routing for articles, journals, conferences, tickets, readers, investors, users, notifications and settings.
- Frontend API URL supports `VITE_API_BASE_URL` for deployment instead of being localhost-only.
- New passwords use Node's scrypt password hashing; legacy plaintext records are accepted once and upgraded after successful login.
- Google Drive database backup includes notification and reader-access tables when available.

## Important production configuration

Set strong values in `backend/.env`:

- `JWT_SECRET`
- `STORAGE_SETTINGS_SECRET` (do not change after saving encrypted Drive credentials unless you re-upload them)
- `KAPSO_API_KEY`
- `KAPSO_PHONE_NUMBER_ID`
- `ADMIN_WHATSAPP_NUMBER`
- SMTP variables for email
- MySQL connection variables

For the frontend, create `.env` if the API is not local:

`VITE_API_BASE_URL=https://your-api-domain.com/api`
