# Navin Iron Industries — Website + Admin Panel

A 4-page business website (Home, Services, About, Contact) with:
- Light theme, orange accent, responsive on phone/tablet/laptop
- Floating WhatsApp chat button
- A working Contact form that emails you
- A private **Admin Panel** (`/admin/login.html`) to upload/delete product photos — they appear automatically on the Home and Services pages
- An automatic email to **navinironindustries@gmail.com** when someone new visits the site (limited to once per visitor per hour, so it doesn't flood your inbox)

---

## 1. Running it on your own computer (to preview/test)

You'll need [Node.js](https://nodejs.org) installed (version 18 or newer).

```bash
cd navin-app
npm install
cp .env.example .env
```

Now open `.env` in a text editor and fill in:

- `JWT_SECRET` — any long random text
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — what you'll use to log into `/admin`
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — see step 2 below
- `NOTIFY_EMAIL` — where alerts go (navinironindustries@gmail.com)

Then start it:

```bash
npm start
```

Visit **http://localhost:3000** for the site, and **http://localhost:3000/admin/login.html** for the admin panel.

---

## 2. Setting up the Gmail sender (needed for emails to work)

Gmail won't accept your normal password from an app — you need an **App Password**:

1. Go to your Google Account → Security → turn on **2-Step Verification** (required first).
2. Go to https://myaccount.google.com/apppasswords
3. Create a new App Password (name it "Navin Website").
4. Copy the 16-character code into `GMAIL_APP_PASSWORD` in your `.env`.
5. Put the Gmail address that will *send* the mail into `GMAIL_USER` (this can be navinironindustries@gmail.com itself, or a separate Gmail account — either works, as long as `NOTIFY_EMAIL` is set to where you want alerts delivered).

---

## 3. Putting it live on the internet

This site has a backend, so it can't be hosted as plain files (like on GitHub Pages). You need a host that runs Node.js. Easiest free/cheap options:

- **Render.com** (recommended, has a free tier) — connect your project, set the Environment Variables from your `.env`, deploy.
- **Railway.app** — similar, one-click Node deploy.

Steps (same idea on either):
1. Create an account, create a new "Web Service" from this project's code.
2. Set the **Start Command** to `npm start`.
3. Add all the variables from `.env` under their "Environment Variables" settings (never upload your real `.env` file itself).
4. Deploy — you'll get a live URL like `navin-iron.onrender.com`. You can later point your own domain (e.g. navinironindustries.com) at it.

**Important:** the free tiers of these hosts usually reset the filesystem on restart, which would delete uploaded photos and the database. If you plan to rely on the admin panel long-term, ask me and I can switch photo storage to a persistent option (like Cloudinary) — happy to do that as a next step once you've picked a host.

---

## 4. Using the Admin Panel day-to-day

1. Go to `yourdomain.com/admin/login.html`
2. Log in with the email/password you set in `.env`
3. Upload a title, pick a category, add a photo, hit Upload
4. It appears immediately on the Home and Services pages
5. Delete old photos any time from the same screen

---

## 5. Changing the WhatsApp number

Open `public/js/main.js` and edit this line near the top:

```js
const WHATSAPP_NUMBER = '919928930407'; // country code + number, no + or spaces
```
