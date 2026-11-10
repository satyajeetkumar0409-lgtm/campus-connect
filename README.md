# Campus Connect

Campus Connect is a full stack college project for discovering and managing student events. Students can search campus activities, filter by category, create an event, and RSVP or cancel their place.

## Run locally

Requires Node.js 20+ and npm 10+.

```sh
npm install
cp .env.example .env
npm run dev
```

Open <http://localhost:5173>. The Express API runs at <http://localhost:4000>.

## Features

- Search events by name, description, organizer, and location
- Filter by technology, workshop, cultural, sports, and career events
- Publish new events with a date, time, venue, capacity, and organizer
- RSVP and cancel an RSVP; the API prevents duplicate registrations and full-event signups
- Save event data locally in `apps/api/data/events.json`
- Responsive layout for desktop and mobile

The demo uses a sample student ID instead of account login. For a larger version, add student authentication, role-based event moderation, email reminders, and a relational database such as PostgreSQL or MySQL.

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
