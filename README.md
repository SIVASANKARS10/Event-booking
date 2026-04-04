# ⚡ TechSymposium — Event & Ticket Booking System

A full-stack web application for managing a college-level national technical symposium. Supports event creation, ticket booking with QR codes, simulated payments, email confirmations, and admin analytics.

---

## 🗂 Project Structure

```
event-booking/
├── client/               ← React + Vite frontend
│   └── src/
│       ├── pages/        ← Home, Login, Register, Events, EventDetails, MyTickets, AdminDashboard
│       ├── components/   ← Navbar, EventCard, QRDisplay, SearchBar, Loader
│       ├── context/      ← AuthContext, ToastContext
│       ├── services/     ← api.js (Axios)
│       └── styles/       ← global.css
└── server/               ← Node.js + Express backend
    ├── models/           ← User, Event, Ticket (Mongoose)
    ├── controllers/      ← authController, eventController, ticketController
    ├── routes/           ← authRoutes, eventRoutes, ticketRoutes
    ├── middleware/       ← authMiddleware (JWT + RBAC)
    ├── utils/            ← qrGenerator, emailSender
    ├── seed.js           ← Database seeder
    └── server.js         ← Entry point
```

---

## 🚀 Quick Start

### 1. Clone / Extract the project

```bash
cd event-booking
```

### 2. Setup the Server

```bash
cd server
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/techsymposium
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d

# Email (use Ethereal for testing: https://ethereal.email)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASS=your_ethereal_pass
EMAIL_FROM=noreply@techsymposium.com
```

Seed the database with sample data:
```bash
node seed.js
```

Start the server:
```bash
npm run dev    # Development (nodemon)
npm start      # Production
```

Server runs on: `http://localhost:5000`

---

### 3. Setup the Client

```bash
cd client
npm install
npm run dev
```

Client runs on: `http://localhost:5173`

---

## 🔐 Demo Credentials

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@techsym.com        | admin123   |
| Student | student@techsym.com      | student123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description           |
|--------|-----------------------|---------|-----------------------|
| POST   | /api/auth/register    | Public  | Register new user     |
| POST   | /api/auth/login       | Public  | Login                 |
| GET    | /api/auth/me          | Private | Get current user      |

### Events
| Method | Endpoint              | Access  | Description           |
|--------|-----------------------|---------|-----------------------|
| GET    | /api/events           | Public  | List all events       |
| GET    | /api/events/:id       | Public  | Get event details     |
| POST   | /api/events           | Admin   | Create event          |
| PUT    | /api/events/:id       | Admin   | Update event          |
| DELETE | /api/events/:id       | Admin   | Delete event          |
| GET    | /api/events/admin/stats | Admin | Dashboard analytics   |

### Tickets
| Method | Endpoint              | Access  | Description                |
|--------|-----------------------|---------|----------------------------|
| POST   | /api/tickets/book     | Student | Book a ticket              |
| GET    | /api/tickets/my       | Student | Get my tickets             |
| POST   | /api/tickets/verify   | Admin   | Verify QR / check-in       |
| GET    | /api/tickets/all      | Admin   | All tickets (with filters) |

---

## ✨ Features

- **JWT Authentication** with role-based access control (Admin / Student)
- **Event Management** — full CRUD for admin
- **Ticket Booking** — prevents overbooking with atomic seat updates
- **QR Code Generation** — unique base64 QR per ticket
- **Simulated Payment** — success/failure states, no real gateway needed
- **QR Check-In System** — admin verifies tickets; prevents duplicate check-ins
- **Email Confirmation** — Nodemailer sends QR code to participant's email
- **Admin Dashboard** — live analytics: revenue, attendance, seat fill rates
- **Search & Filter** — search events by keyword, filter by category
- **Pagination** — server-side pagination for event listings
- **Responsive UI** — dark industrial theme, mobile-friendly

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6     |
| Styling   | Plain CSS (CSS Variables, no Tailwind) |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB, Mongoose                   |
| Auth      | JWT, bcryptjs                       |
| QR Codes  | `qrcode` npm package                |
| Email     | Nodemailer                          |
| HTTP      | Axios                               |

---

## 📧 Email Setup (Ethereal — Free Testing)

1. Go to https://ethereal.email
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials into `server/.env`
4. All sent emails are captured in the Ethereal inbox (no real emails sent)

For production, use Gmail with App Password or SendGrid.

---

## 🏗 Production Build

```bash
# Build client
cd client && npm run build

# The dist/ folder can be served by Express:
# In server.js, add:
# app.use(express.static(path.join(__dirname, '../client/dist')));
```
