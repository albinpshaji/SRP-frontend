# Sevana Frontend

This is the React client for Sevana, a donation coordination platform for donors, NGOs, admins, and distributors.

The frontend provides the user interface for authentication, donor donations, NGO discovery, marketplace items, logistics, admin verification, feedback, gamification, and profile management.

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Leaflet / React Leaflet
- Google OAuth

## Main Frontend Features

- Login and registration pages
- Google sign-in support
- Protected routes for authenticated users
- Donor donation history and donation details
- Live chat with the NGO after a donation is accepted
- NGO listing and NGO profile pages
- Donation form for sending items to NGOs
- Marketplace listing and claiming flow
- Incoming donation management
- Live chat with the donor after accepting an incoming donation
- Logistics list, details, and route views
- NGO needs browsing and upload flow
- Admin dashboard, NGO verification, proof image review, and feedback pages
- Profile and complete-profile flows
- Donor leaderboard
- Global toast notifications
- Backend wake-up helper for hosted deployments

## Project Structure

```text
src/
├── assets/       Images and static assets
├── components/   Shared UI, layout, profile, donor, and common components
├── context/      React context providers
├── pages/        Route-level pages grouped by role
├── services/     Axios API client setup
├── App.jsx       Main route table and providers
└── main.jsx      React entry point
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app usually runs at:

```text
http://localhost:5173
```

## Environment Variables

Create a local `.env` file if needed:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Do not commit real secrets or private keys.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Routing

The main route table is currently in `src/App.jsx`.

Important route groups:

- Shared pages: home, login, register, profile, complete profile, donation details, needs
- Donor pages: NGOs, NGO profile, donate items, my donations, leaderboard
- Distributor/NGO pages: incoming donations, marketplace, logistics
- Admin pages: dashboard, NGO verification, NGO details, feedback

## Developer Notes

- API requests should use `src/services/api.js` so JWT handling stays centralized.
- Protected pages are wrapped with `Protectedroute`.
- The app expects the backend to run on `http://localhost:8080` unless `VITE_API_BASE_URL` is set.
- Donation chat uses REST for history and a native WebSocket for live messages.
- A `401` response clears local storage and redirects to `/`.
- A `403` response redirects to `/`.
- Keep shared UI in `src/components/` instead of duplicating layout logic in pages.
- Use the toast context for user-facing success and error messages.
