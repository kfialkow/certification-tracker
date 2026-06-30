# Certification Tracker

Astro + Tailwind web app for tracking education certifications, expiration dates, renewal status, and reminder emails.

## Requirements Covered

- User login is required to create and edit certification records.
- Users can track full name, email, phone, certification type, issue date, expire date, status, notes, and a document/certification copy URL.
- Certifications display in an editable grid table.
- Admin users can maintain the certification type list used by dropdowns.
- MySQL stores users, sessions, certification types, certification records, and notification history.
- The monitor only checks active certifications that are not removed.
- Reminder emails run at 90, 60, 30, 15, 10, and 5 days before expiration, then daily after expiration until status is changed to renewed, canceled, or removed.
- A cron job can call `/api/cron/monitor` or run `npm run notify:run`.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a MySQL database and user.

3. Copy `.env.example` to `.env` and set the database, SMTP, and cron secret values.
   For remote MySQL servers, keep `DB_CONNECT_TIMEOUT=30000` or higher if the first handshake is slow.
   If your SMTP server uses a private or self-signed certificate chain, prefer `SMTP_CA_FILE=/path/to/ca.pem`.
   For a trusted internal server only, `SMTP_TLS_REJECT_UNAUTHORIZED=false` will allow that certificate.

4. Run the schema:

   ```bash
   mysql -u cert_tracker -p cert_tracker < db/schema.sql
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

The first registered account becomes an admin. Later accounts are standard users.

## Cron

HTTP cron example:

```bash
curl -fsS http://localhost:4321/api/cron/monitor \
  -H "Authorization: Bearer replace-with-a-long-random-value"
```

Local runner example:

```bash
npm run notify:run
```

`npm run notify:run` calls `${APP_URL}/api/cron/monitor`, so the app must already be running.
If cron is not on the same server as the app, set `APP_URL` to the deployed HTTPS URL.

## Deployment Package

This project builds as an Astro Node standalone server. Build it with:

```bash
npm ci
npm run build
```

Deploy these files and folders to the server:

```text
dist/
package.json
package-lock.json
scripts/run-monitor.mjs
db/schema.sql
.env.example
```

On the server, install production dependencies and start the app:

```bash
npm ci --omit=dev
npm start
```

Set real environment variables on the server, or create a server-only `.env` from `.env.example`.
Do not commit or share `.env` because it contains database and SMTP secrets.

For production, set the app URL and port as needed:

```bash
APP_URL=https://your-domain.example
PORT=4321
```

Run the database schema once before first use:

```bash
mysql -u cert_tracker -p cert_tracker < db/schema.sql
```

Schedule the certification monitor with your server cron/task scheduler:

```bash
npm run notify:run
```

Example crontab when the app is running on the same server:

```cron
0 8 * * * cd /var/www/CERTRACTKER && /usr/bin/npm run notify:run >> cron-notify.log 2>&1
```

Example crontab that calls the deployed site directly:

```cron
0 8 * * * curl -fsS https://your-domain.example/api/cron/monitor -H "Authorization: Bearer YOUR_CRON_SECRET" >> cron-notify.log 2>&1
```
