# Campus Connect — College Event Management System

Campus Connect gives students one place to find campus activities and sign up. Club organizers can post an event with its date, venue, and capacity. Students can browse the list, filter by category, and manage their RSVPs.

## Run locally

Requires Node.js 20+ and npm 10+.

```sh
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173>. The Express API runs at <http://localhost:4000>.

## Main features

- Search events by name, description, organizer, and location
- Filter by technology, workshop, cultural, sports, and career events
- Publish new events with a date, time, venue, capacity, and organizer
- RSVP and cancel an RSVP; the API prevents duplicate registrations and full-event signups
- Save event data locally in `apps/api/data/events.json`
- Responsive layout for desktop and mobile

This version uses a sample student ID instead of account login. Event records are stored in a JSON file so the project can run without setting up a database. A next development step would be to add student accounts and move event storage to MySQL or PostgreSQL.

## Stack and layout

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Storage: JSON file for a zero-setup classroom demo

```text
apps/api/src/index.ts       REST API and event logic
apps/api/data/events.json   Sample data and local persistence
apps/web/src/App.tsx        Student event portal
apps/web/src/styles.css     Responsive interface
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the API is running |
| `GET` | `/api/events?q=&category=` | Search and filter campus events |
| `POST` | `/api/events` | Create an event |
| `POST` | `/api/events/:id/register` | RSVP to an event |
| `DELETE` | `/api/events/:id/register` | Cancel an RSVP |

Use `npm run build` to compile both workspaces.
