# PlanetPulse 🌱

## Description

PlanetPulse is a shared-demo carbon footprint tracker built for the Azisly Hackathon, Track 2 · Web Product. It turns everyday travel, electricity use, and meal choices into estimated CO₂ emissions, then helps people understand their weekly impact without requiring an account.

**Hackathon ID: AZIS-W7S9Q2**

## Features

- Log car, bus, flight, electricity, vegetarian meal, and non-vegetarian meal activities.
- Calculate CO₂ on the server using the required fixed emission factors.
- Preview an estimate in the client while keeping the backend as the source of truth.
- Flag unusual quantities for confirmation rather than changing or silently accepting them.
- View all-time and current Monday–Sunday footprint totals, weekly target, remaining allowance, percent used, and category breakdown.
- Set one shared weekly CO₂ target stored in MongoDB.
- Browse a newest-first activity journal with category and date filters.
- Receive a friendly, non-blocking nudge and a category-specific tip when the weekly target is exceeded.
- See additive impact equivalences and a simple end-of-week forecast through the dashboard insights API.
- Use the complete app immediately: authentication is intentionally not implemented.

## Tech Stack

### Client

- React + Vite + JavaScript
- Tailwind CSS
- React Router
- Axios
- Recharts

### Server

- Node.js + Express.js
- MongoDB + Mongoose

## Project Structure

```text
PlanetPulse/
├── client/                  # React/Vite application
│   ├── src/components/      # Dashboard, navigation, filter, and feedback UI
│   ├── src/pages/           # Dashboard, log activity, history, and settings routes
│   └── src/services/        # Axios API client
├── server/                  # Express/Mongoose application
│   ├── controllers/         # Activities, settings, and dashboard handlers
│   ├── models/              # Activity and Settings schemas
│   ├── routes/              # API route definitions
│   └── services/            # Emissions, validation, and calendar-week logic
├── README.md
└── DECISIONS.md
```

## Local Setup

### Prerequisites

- Node.js 18 or later
- npm
- A MongoDB Atlas cluster or a local MongoDB instance

### Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### Configure environment files

Copy the examples before starting the app:

```bash
copy server\.env.example server\.env
copy client\.env.example client\.env
```

On macOS/Linux, use `cp` instead of `copy`.

## Environment Variables

### `server/.env`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
PORT=5000
```

`MONGODB_URI` is required. For MongoDB Atlas, add the machine or deployment host IP to the Atlas Network Access allowlist.

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

Leave `VITE_API_URL` unset for the local default, or set it to the deployed API URL for a production client build.

## Running the Application

Start the API in one terminal:

```bash
cd server
npm run dev
```

Start the client in another terminal:

```bash
cd client
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

For production verification:

```bash
cd client
npm run build

cd ../server
npm start
```

The API health endpoint is `GET /` and responds with `PlanetPulse API running` after MongoDB connects.

## API Endpoints

All activity quantities are numbers. The backend calculates and stores the final CO₂ amount.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/activities` | Create an activity. Send `{ type, quantity }`; add `confirmUnusual: true` after an unusual-value warning. |
| `GET` | `/api/activities` | Return activities newest first. Optional query parameters: `category`, `from`, and `to`. |
| `GET` | `/api/activities/weekly` | Return activities from the current Monday–Sunday week plus `totalCO2`. |
| `DELETE` | `/api/activities/:id` | Delete one activity by MongoDB ID. |
| `GET` | `/api/settings` | Return the shared weekly target, creating the default target when necessary. |
| `PUT` | `/api/settings` | Update the shared weekly target with `{ weeklyTarget }`. |
| `GET` | `/api/dashboard` | Return all-time total, current-week progress, target status, and category totals. |
| `GET` | `/api/dashboard/insights` | Additive endpoint for equivalences, forecast, leading category, and a data-driven tip. |

`GET /api/dashboard/insights` is additive and does not alter the required dashboard contract. The current implementation does not expose an export endpoint, so no export route is advertised.

## Fixed Emission Factors

| Activity | Factor |
| --- | --- |
| Car | `0.20 kg/km` |
| Bus | `0.08 kg/km` |
| Flight | `0.25 kg/km` |
| Electricity | `0.80 kg/kWh` |
| Vegetarian meal | `0.5 kg/meal` |
| Non-vegetarian meal | `2.0 kg/meal` |

## Deployment Prep

1. Deploy the Express server with `MONGODB_URI` and `PORT` configured in the hosting provider's environment settings.
2. Add the deployed server's outbound IP or network range to MongoDB Atlas Network Access if required by the provider.
3. Deploy the Vite `client/dist` build and set `VITE_API_URL` to the deployed API URL before building.
4. Verify the public client can call the public API and use every feature without a login.

## No Demo Credentials Required

PlanetPulse deliberately has **no login, signup, passwords, JWTs, user accounts, or protected routes**. It uses one shared demo dataset, so graders and visitors can use every feature as soon as they open the public URL. No test or demo credentials are required.
