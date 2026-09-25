# MotherCare NG

A working academic maternal and child health application with a mobile-first web interface, a Node.js API and a persistent SQLite database. It retains HTML5, CSS3, JavaScript, jQuery, Bootstrap, Font Awesome and Chart.js from the report. Node.js and SQLite replace the original browser-only mock data.

## Start on Windows, macOS or Linux

1. Install **Node.js 24 LTS** from https://nodejs.org/. Confirm `node --version` shows v24 or later.
2. Extract the ZIP. Open a terminal in the **Mcare** folder containing `package.json` and `server.mjs`.
3. For a fictional demonstration, run:

```sh
npm run seed
npm start
```

4. Open **http://localhost:3000** in your browser. Keep the terminal running.

No `npm install`, API key, paid service or external database setup is needed for the application. The included frontend libraries are served locally. Do not open `public/index.html` directly and do not use VS Code Live Server: the Node server supplies the API.

## Demonstration accounts

| Role | Email | Password |
| --- | --- | --- |
| Mother | mother@demo.test | MotherCare2026! |
| Provider | provider@demo.test | MotherCare2026! |
| Administrator | admin@demo.test | MotherCare2026! |

`npm run seed` creates these three fictional accounts and connects the mother to the provider. It does not generate clinical measurements, appointments or vaccine completion claims. Register additional mothers using **Create an account**. Create providers and administrators from **Administration → Add staff account**. Existing accounts are not password-reset by re-running the seed command.

Use fictional data for this academic demonstration. The default passwords and demo seed must not be used for public deployment or real patient care.

## Supervisor demonstration in 10 steps

1. Register a new mother and sign in. In **My profile**, save contact details and choose Nurse Ada Demo as the provider. Explain that this grants the selected provider access to the mother's records.
2. Create a pregnancy profile with an expected delivery date. The overview changes from its empty state to date-based progress.
3. Add an antenatal appointment with a date, WAT time, facility and reminder lead time. Edit it, filter by status, then mark it completed.
4. Add two maternal measurement records. Check the weight chart and refresh the page to confirm persistence.
5. Create a child profile. Add two growth records and an observed milestone for that child. Select the child in the growth filter.
6. Add a vaccine from a fictional clinic card, including its scheduled date. Record the administered date to mark it completed. No automatic clinical schedule is supplied.
7. Create a past-due medication reminder using fictional prescribed instructions. Open **Reminders**, verify the entry and mark it read. Medication reminders are one-time entries; edit the next reminder as directed by the prescriber.
8. Send a routine message to the provider. Open a new tab, sign in as the provider, view the assigned mother's records and reply. Return to the mother tab. Messages refresh every 15 seconds while visible; the Refresh button updates immediately. Each tab has its own session token.
9. Sign in as the administrator in another tab. Add health education with an HTTPS source link, add verified facility contact details, create staff and deactivate a disposable test user. Administrators do not get access to clinical records.
10. Export the mother's JSON record from **My profile**. Stop and restart the server, sign in again and verify that records remain.

## What is implemented

- Mother registration and login; scrypt password hashing; expiring server sessions; sign-out; change password.
- Per-tab authentication through sessionStorage. LocalStorage is used only for colour-theme preference.
- Profiles, emergency contacts and explicit provider selection/revocation.
- Pregnancy due-date tracking and notes.
- Appointment creation, editing, deletion, status filters, collision checks and in-app reminders.
- Maternal measurements with units, validation and weight trend chart.
- Multiple children, growth records, milestones and clinic-entered vaccine schedules.
- Medication record and next-dose reminder entry without prescribing advice.
- Server-persisted two-way mother–provider messages with unread indicators.
- Health education with source links; administrator-managed facility directory.
- Role-based administration, active/inactive accounts and operation audit trail.
- Record export, search, dark mode, responsive navigation and forms.
- Record versions prevent silent overwrites from stale edits. Child deletion is blocked until dependent records are removed.

## Data and configuration

Data is created at `data/mothercare.sqlite` on first start. Keep this file to retain records. The database is deliberately excluded from this ZIP so no credentials, sessions or test health records are distributed as live data. `npm run seed` creates your local demo accounts.

Optional environment variables:

- `PORT`: default `3000`.
- `HOST`: default `127.0.0.1`, for local demonstration only.
- `DB_PATH`: alternate SQLite file path.

For a trusted local Wi-Fi phone demonstration, bind to `0.0.0.0` and browse to your computer's LAN IP and port 3000. Windows PowerShell: `$env:HOST="0.0.0.0"; npm start`. macOS/Linux: `HOST=0.0.0.0 npm start`. Allow only the necessary private-network firewall access. Use fictional records; HTTP on a LAN is not encrypted. Public hosting requires HTTPS and additional production security work. Static hosting alone cannot run this Node/SQLite server; a persistent server filesystem is required.

Back up by stopping the server and copying the whole `data` directory. Restore the directory with the server stopped, then restart. Never delete the data folder to fix a normal login problem.

## Tests and evidence

```sh
npm test
```

This runs 20 server/API subtests against a temporary database, including record persistence across restart, access denial, stale updates and messaging. `docs/api-test-results.txt` records the executed results. `docs/dom-test-results.json` records 12 completed DOM integration checks. DOM tests use jsdom; charts are stubbed, so these checks verify chart data flow rather than canvas output or layout.

Optional interface test dependencies are listed under `devDependencies`. Run `npm install` only if you want these tests:

```sh
npm run test:dom
npm run test:browser
```

For the browser suite, install its Chromium first with `npx playwright install chromium`, start a separate fresh demonstration instance on port 3000, then run `npm run test:browser`. This suite creates fictional records and captures screenshots. It expects the seeded mother to start with empty clinical records; use a separate `DB_PATH` for repeatable runs. It was prepared but **not executed successfully in the delivery environment**, where browser launch/local access was blocked. Desktop/mobile visual testing and human usability acceptance remain to be completed on the target computer. Do not submit the report as evidence of those unperformed checks.

## Limits

This is an academic software implementation, not a certified clinical product. Reminders are in-app, recomputed on login, refresh and a 15-second foreground interval; there is no SMS, email delivery or closed-browser push service. Messages are routine communication, not emergency monitoring. App dates/times for appointments and reminders use Nigeria WAT. Measurements are stored without diagnosis, risk prediction, percentile assessment or automatic treatment advice. Offline server access, hospital integration, public deployment, real-device acceptance and clinical validation are not included.

SQLite is not encrypted at rest by this app. Before real clinical use, arrange deployment security review, HTTPS, database encryption/access policies, tested backups, recovery/account-verification processes and appropriate clinical/data-governance review.

## Source layout

- `server.mjs`: HTTP server, authentication, validators, role rules, SQL schema and API routes.
- `public/index.html`: application shell and dialog.
- `public/app.js`: page controllers, forms, charts, polling and API client.
- `public/styles.css`: responsive design and theme.
- `public/vendor/`: bundled libraries and icon font.
- `test/api.test.mjs`: reproducible server integration tests.
- `test/dom.test.mjs`: reproducible DOM integration checks.
- `test/browser.mjs`: prepared desktop/mobile browser acceptance workflow.
- `docs/`: test evidence, traceability and acceptance checklist.
