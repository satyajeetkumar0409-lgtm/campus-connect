import "dotenv/config";
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

type Category = "Technology" | "Workshop" | "Cultural" | "Sports" | "Career";
type CampusEvent = { id: string; title: string; description: string; category: Category; date: string; time: string; location: string; organizer: string; capacity: number; registeredStudents: string[] };
const dataFile = fileURLToPath(new URL("../data/events.json", import.meta.url));
const categories: Category[] = ["Technology", "Workshop", "Cultural", "Sports", "Career"];
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
const readEvents = async () => JSON.parse(await readFile(dataFile, "utf8")) as CampusEvent[];
const saveEvents = async (events: CampusEvent[]) => writeFile(dataFile, `${JSON.stringify(events, null, 2)}\n`);

app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "campus-connect-api" }));
app.get("/api/events", async (request, response, next) => {
  try {
    const q = String(request.query.q ?? "").trim().toLowerCase();
    const category = String(request.query.category ?? "All");
    const events = await readEvents();
    response.json(events.filter((event) => (category === "All" || event.category === category) && (!q || `${event.title} ${event.description} ${event.location} ${event.organizer}`.toLowerCase().includes(q))));
  } catch (error) { next(error); }
});
app.post("/api/events", async (request, response, next) => {
  try {
    const { title, description, category, date, time, location, organizer, capacity } = request.body ?? {};
    if (!title?.trim() || !description?.trim() || !categories.includes(category) || !date || !time || !location?.trim() || !organizer?.trim()) return response.status(400).json({ error: "Please complete all event details." });
    const event: CampusEvent = { id: randomUUID(), title: title.trim(), description: description.trim(), category, date, time, location: location.trim(), organizer: organizer.trim(), capacity: Math.max(1, Number(capacity) || 50), registeredStudents: [] };
    const events = await readEvents(); events.unshift(event); await saveEvents(events);
    response.status(201).json(event);
  } catch (error) { next(error); }
});
app.post("/api/events/:id/register", async (request, response, next) => {
  try {
    const events = await readEvents(); const event = events.find((item) => item.id === request.params.id);
    if (!event) return response.status(404).json({ error: "Event not found." });
    const studentId = String(request.body?.studentId ?? "student-demo");
    if (!event.registeredStudents.includes(studentId)) {
      if (event.registeredStudents.length >= event.capacity) return response.status(409).json({ error: "This event is full." });
      event.registeredStudents.push(studentId); await saveEvents(events);
    }
    response.json(event);
  } catch (error) { next(error); }
});
app.delete("/api/events/:id/register", async (request, response, next) => {
  try {
    const events = await readEvents(); const event = events.find((item) => item.id === request.params.id);
    if (!event) return response.status(404).json({ error: "Event not found." });
    const studentId = String(request.query.studentId ?? "student-demo");
    event.registeredStudents = event.registeredStudents.filter((id) => id !== studentId); await saveEvents(events);
    response.json(event);
  } catch (error) { next(error); }
});
app.listen(port, () => console.log(`Campus Connect API listening on http://localhost:${port}`));
