# 🇪🇹 Ethiopia Tour & Travel

A full-stack tourism platform built with **React 18 + Vite** and **Django REST Framework** — dual-currency (USD/ETB) payments via **Stripe** and **Chapa**, and content in **English, Amharic, and French**.

---

## ✨ Key Features

- **Tour discovery & booking** — browse packages/destinations, filter by category/difficulty/price, multi-step booking wizard with live seat availability
- **Dual payment gateways**
  - **Stripe** — international cards (Visa, Mastercard, Amex)
  - **Chapa** — Telebirr, CBE Birr, Amole, Awash Bank, Dashen Bank, and cards
  - Prices display in **USD or ETB**, switchable site-wide; the ETB conversion rate is fetched live (not hardcoded) with an automatic fallback if the live source is ever unreachable
- **Multi-language** — English, Amharic (አማርኛ), French, switchable from the nav bar
  - Frontend UI via `react-i18next`
  - Backend content (package descriptions, destinations, blog posts, categories, itinerary days) via `django-modeltranslation`, with an admin action that auto-drafts Amharic/French translations from the English original for staff to review before publishing
- **Blog, gallery, and destination guides** with categories, tags, and comments
- **Role-based accounts** — tourist / guide / admin, JWT authentication
- **Coupon codes**, booking confirmation emails, newsletter subscription with signed unsubscribe links

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # Set SECRET_KEY, DATABASE_URL, Stripe/Chapa keys, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver     # → http://localhost:8000/api/v1/
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local    # Set VITE_API_BASE_URL=http://localhost:8000/api/v1
npm install
npm run dev                   # → http://localhost:5173/
```

### 3. Local payment webhook testing

Stripe and Chapa both need a publicly reachable URL to send webhooks to, even in development:

```bash
# Stripe
stripe listen --forward-to localhost:8000/api/v1/bookings/payment/stripe/webhook/

# Chapa (needs a real HTTPS tunnel — ngrok or similar)
ngrok http 8000
# then set BACKEND_URL in .env to the ngrok https URL, and register
# {BACKEND_URL}/api/v1/bookings/payment/chapa/webhook/ in the Chapa dashboard
```

---

## 🛠️ Tech Stack & Roles

| Layer        | Technologies                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------- |
| **Frontend** | React 18, Vite, Tailwind CSS, TanStack Query v5, Axios, react-hook-form + Zod, react-i18next    |
| **Backend**  | Django, Django REST Framework, SimpleJWT, django-modeltranslation, django-filter                |
| **Payments** | Stripe (`stripe-python`), Chapa REST API                                                        |
| **Services** | Cloudinary (media storage), SendGrid/SMTP (transactional email)                                 |
| **Roles**    | `tourist` (browse/book), `guide` (dashboard), `admin` (management, content, translation review) |

---

## 🌍 Internationalization

| What                                                 | How                                                                                                                                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI chrome (nav, buttons, form labels, checkout flow) | `react-i18next`, translation files in `frontend/src/i18n/locales/{en,am,fr}.json`                                                                                                      |
| Package/destination/blog content                     | `django-modeltranslation` — each translatable field gets `_en`/`_am`/`_fr` columns automatically                                                                                       |
| Which language the API returns                       | Standard `Accept-Language` HTTP header, sent automatically by the frontend based on the active UI language — no per-endpoint code needed                                               |
| Getting Amharic/French content into the database     | Staff write the English version in Django admin, then run the **"Auto-translate to Amharic & French"** bulk action to draft the other two languages, and review/edit before publishing |

---

## 💱 Payments & Currency

| What            | How                                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Package prices  | Stored in USD (`price_usd`), converted to ETB on the fly for display and for Chapa charges                      |
| Exchange rate   | Fetched live and cached (not a hardcoded constant), with a configurable static fallback if the live fetch fails |
| Stripe charges  | USD by default (ETB optional, if enabled on your Stripe account — not all accounts support it)                  |
| Chapa charges   | ETB by default — Chapa is Ethiopia-native and most accounts don't have USD payment methods enabled              |
| Payment records | Store both the internal USD ledger amount and the actual currency/amount charged to the customer                |

---

## 🗺️ Key API Endpoints

All routes are prefixed with `/api/v1/`.

| Resource                 | Method      | Endpoint                                                                         | Auth |
| ------------------------ | ----------- | -------------------------------------------------------------------------------- | ---- |
| **Auth**                 | POST        | `/auth/token/` (login), `/auth/register/`                                        | —    |
| **User**                 | GET / PATCH | `/auth/profile/`                                                                 | ✓    |
| **Destinations**         | GET         | `/destinations/`, `/destinations/<slug>/`                                        | —    |
| **Packages**             | GET         | `/packages/`, `/packages/<slug>/`, `/packages/<slug>/availability/`              | —    |
| **Bookings**             | GET / POST  | `/bookings/`, `/bookings/<ref>/`                                                 | ✓    |
| **Payments**             | POST        | `/bookings/payment/stripe/create-intent/`, `/bookings/payment/chapa/initialize/` | ✓    |
| **Exchange rate**        | GET         | `/bookings/payment/exchange-rate/`                                               | —    |
| **Blog & Gallery**       | GET         | `/blog/`, `/gallery/`, `/reviews/`                                               | —    |
| **Contact & Newsletter** | POST        | `/contact/`, `/newsletter/unsubscribe/`                                          | —    |

---

## 🚢 Deployment Configuration

### Backend (Render Web Service)

- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- **Start Command:** `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
- **Env Vars:** `SECRET_KEY`, `DATABASE_URL`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`
  - Payments: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `CHAPA_SECRET_KEY`, `CHAPA_PUBLIC_KEY`, `CHAPA_WEBHOOK_SECRET`, `CHAPA_MAX_AMOUNT`, `USD_TO_ETB_RATE` (fallback only)
  - Media: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - Email: `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`, `ADMIN_EMAIL`

### Frontend (Vercel)

- **Root Directory:** `frontend`
- **Build Command:** `npm run build` | **Output Directory:** `dist`
- **Env Vars:** `VITE_API_BASE_URL=https://ethio-tour-travel.onrender.com/api/v1`, `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 📁 Repository Structure

```text
ethiopia-tour-travel/
├── backend/                  ← Django REST API
│   ├── accounts/              (custom User, auth, password reset)
│   ├── destinations/          (regions, destinations, nearby attractions)
│   ├── packages/               (tour packages, itineraries, availability)
│   ├── bookings/               (bookings, coupons, payments, exchange rate)
│   ├── blog/                   (posts, categories, tags, comments)
│   ├── gallery/                (albums, media)
│   ├── reviews/                (package reviews)
│   └── i18n_content/           (auto-translate admin tooling)
└── frontend/                  ← React SPA
    ├── src/api/                (axios client + per-resource API modules)
    ├── src/components/         (shared UI components)
    ├── src/context/            (Auth, Currency)
    ├── src/hooks/               (React Query hooks)
    ├── src/i18n/                (react-i18next config + locale files)
    └── src/pages/               (route-level page components)
```

---

## 📄 License

## Proprietary & Confidential

Copyright (c) 2026 Ethiopia Tour & Travel. All rights reserved.

This software and associated documentation files (the "Software") are the private property of Ethiopia Tour & Travel. Unauthorized copying, distribution, modification, public display, or hosting of this repository via any medium is strictly prohibited.For licensing inquiries or commercial use permissions contact:support@ethiopiatourtravel.com
