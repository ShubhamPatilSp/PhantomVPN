# ⚡ PhantomVPN

> **Invisible. Unstoppable. Free.**

A production-grade, full-stack VPN web application built with React 18, Node.js, MongoDB, Socket.io, and WireGuard. Premium design that surpasses NordVPN, ExpressVPN, and Surfshark — built entirely on free-tier infrastructure.

---

## 📸 Features

- **Landing Page** — Three.js interactive 3D globe, animated particle system, typing effects, live user counter
- **Authentication** — JWT + refresh tokens, 2FA (TOTP), Google OAuth, email verification, brute-force protection
- **VPN Dashboard** — Real-time connection widget, animated speed gauges, usage charts, quick connect
- **95+ Server Locations** — All real countries with flags, ping, load, P2P/Streaming/Tor badges
- **Privacy Tools** — IP checker, DNS leak test, WebRTC test, speed test, blacklist check, password generator
- **Full Leak Test** — Animated security audit with pass/fail results
- **Pricing** — Monthly/yearly toggle, feature comparison table
- **Blog** — 20 pre-seeded articles with markdown rendering and categories
- **Settings** — Profile, 2FA, privacy toggles, WireGuard config download, referrals, notifications
- **Admin Panel** — User management, server CRUD, charts, real-time stats
- **Real-time** — Socket.io for live server loads, active user counts, admin feed
- **PWA** — Service worker, installable, offline support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Three.js |
| State | Zustand, React Query |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (free tier) |
| Cache | Redis / Upstash (free tier) |
| Real-time | Socket.io |
| VPN | WireGuard (config generation) |
| Email | Nodemailer + Gmail SMTP |
| Security | JWT, bcrypt, Helmet.js, rate limiting, 2FA |
| Hosting | Vercel (frontend) + Railway (backend) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/phantomvpn.git
cd phantomvpn

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# In the project root
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phantomvpn
JWT_SECRET=your-super-secret-64-char-minimum-key-here
JWT_REFRESH_SECRET=your-refresh-secret-64-char-minimum-key-here
FRONTEND_URL=http://localhost:5173

# Email (Gmail — enable App Passwords)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your-app-password

# Optional (for avatar uploads)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- ✅ **95+ server locations** across all continents
- ✅ **20 full blog posts** with real content
- ✅ **3 plan configurations** (Free, Pro, Business)
- ✅ **Admin user**: `admin@phantomvpn.com` / `Admin@123`
- ✅ **Test user**: `test@phantomvpn.com` / `Test@123`
- ✅ **10 connection history records**

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173** 🎉

---

## 🐳 Docker (Full Stack)

```bash
# Copy and configure env
cp .env.example .env
# Edit .env with your values

# Start everything
docker-compose up -d

# Seed the database
docker exec phantomvpn-backend node src/seed/index.js

# View logs
docker-compose logs -f
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

---

## ☁️ Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Option 1: Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Connect GitHub repo to vercel.com
```

**Vercel Environment Variables:**
```
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

### Backend → Railway

1. Push backend to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo → choose `/backend` as root directory
4. Add environment variables (all from `.env`)
5. Railway auto-detects Node.js and deploys

**Railway Environment Variables (required):**
```
MONGODB_URI=your_atlas_uri
JWT_SECRET=...
JWT_REFRESH_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=5000
```

### Database → MongoDB Atlas

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) or Railway's IPs
5. Copy connection string to `MONGODB_URI`

### Email → Gmail SMTP

1. Enable 2FA on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"
4. Use this as `EMAIL_PASS` (not your main password)

---

## 📁 Project Structure

```
phantomvpn/
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── manifest.json
│   └── src/
│       ├── api/
│       │   ├── axios.js          # Axios instance with interceptors
│       │   └── index.js          # All API functions
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── DashboardSidebar.jsx
│       │   └── shared/
│       │       └── PageLoader.jsx
│       ├── hooks/
│       │   └── useSocket.js      # Socket.io real-time hook
│       ├── pages/
│       │   ├── Landing.jsx       # 3D globe + full marketing page
│       │   ├── Login.jsx
│       │   ├── Register.jsx      # Password strength meter
│       │   ├── ForgotPassword.jsx
│       │   ├── Dashboard.jsx     # VPN connect widget + charts
│       │   ├── Servers.jsx       # 95+ server cards
│       │   ├── Pricing.jsx       # Feature comparison table
│       │   ├── Settings.jsx      # 8 tabs with all settings
│       │   ├── Tools.jsx         # Privacy tools
│       │   ├── Blog.jsx
│       │   ├── BlogPost.jsx
│       │   ├── LeakTest.jsx      # Animated security audit
│       │   ├── Download.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminUsers.jsx
│       │       ├── AdminServers.jsx
│       │       └── AdminSettings.jsx
│       ├── store/
│       │   ├── authStore.js      # Zustand auth with persistence
│       │   └── vpnStore.js       # VPN connection state
│       └── styles/
│           └── globals.css       # Full design system
│
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   └── vpn.controller.js
│       ├── models/
│       │   ├── User.model.js
│       │   ├── Server.model.js
│       │   └── index.js          # Connection, Plan, Blog, Notification, Referral, AuditLog
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── vpn.routes.js
│       │   ├── server.routes.js
│       │   ├── tools.routes.js
│       │   ├── blog.routes.js
│       │   ├── plan.routes.js
│       │   └── admin.routes.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── admin.js
│       │   └── rateLimit.js
│       ├── services/
│       │   ├── email.service.js
│       │   ├── wireguard.service.js
│       │   └── socket.service.js
│       └── seed/
│           └── index.js          # 95+ servers, 20 posts, users
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🔐 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/logout` | Invalidate session |
| POST | `/api/auth/refresh-token` | Rotate tokens |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset with token |
| POST | `/api/auth/2fa/enable` | Start 2FA setup |
| POST | `/api/auth/2fa/verify` | Verify & activate 2FA |
| POST | `/api/auth/2fa/disable` | Disable 2FA |

### VPN
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vpn/connect` | Connect to server |
| POST | `/api/vpn/disconnect` | Disconnect |
| GET | `/api/vpn/status` | Current connection |
| GET | `/api/vpn/config/:serverId` | Download .conf file |
| GET | `/api/vpn/qrcode/:serverId` | QR code for mobile |
| GET | `/api/vpn/connections/history` | Connection history |
| GET | `/api/vpn/usage` | Bandwidth usage |

### Servers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/servers` | List servers (filterable) |
| GET | `/api/servers/:id` | Single server |

### Tools
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools/ip-info` | IP address details |
| GET | `/api/tools/dns-leak` | DNS leak test |
| GET | `/api/tools/speed-test` | Connection speed |
| GET | `/api/tools/blacklist-check` | IP reputation |

---

## 🎨 Design System

```css
/* Core Palette */
--phantom-bg:        #080B14  /* Near-black with blue tint */
--phantom-primary:   #6C63FF  /* Electric purple */
--phantom-secondary: #00D4FF  /* Cyan */
--phantom-success:   #00FF88  /* Neon green */
--phantom-accent:    #FF6B6B  /* Red/warning */

/* Glass Cards */
background: rgba(255,255,255,0.04);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;

/* Primary Button */
background: linear-gradient(135deg, #6C63FF, #00D4FF);
border-radius: 12px;
```

---

## 🔒 Security Features

- **Rate limiting** — Per-IP limits on all endpoints
- **Brute force protection** — Account lockout after 5 failed logins (30 min)
- **JWT rotation** — Refresh tokens rotate on every use
- **2FA** — TOTP-compatible with any authenticator app
- **Helmet.js** — Security headers (CSP, HSTS, XSS protection)
- **Password hashing** — bcrypt with salt rounds: 12
- **Input sanitization** — XSS protection on all inputs
- **Login alerts** — Email notification on new device login
- **Audit logging** — All auth actions logged with IP/UA

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for privacy advocates everywhere</strong><br>
  <sub>PhantomVPN — Invisible. Unstoppable. Free.</sub>
</div>
