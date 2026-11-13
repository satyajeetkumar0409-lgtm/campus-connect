import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = "Technology" | "Workshop" | "Cultural" | "Sports" | "Career";
type CampusEvent = { id: string; title: string; description: string; category: Category; date: string; time: string; location: string; organizer: string; capacity: number; registeredStudents: string[] };
const studentId = "student-demo";
const categories = ["All", "Technology", "Workshop", "Cultural", "Sports", "Career"] as const;
const formatDate = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
const localToday = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };

export default function App() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (search.trim()) params.set("q", search.trim());
      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) throw new Error("Could not load events.");
      setEvents(await response.json() as CampusEvent[]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reach the API."); }
    finally { setLoading(false); }
  }

  useEffect(() => { const timer = window.setTimeout(() => void loadEvents(), 180); return () => window.clearTimeout(timer); }, [category, search]);
  const allCount = events.length;
  const organizerCount = useMemo(() => new Set(events.map((event) => event.organizer)).size, [events]);
  const registrationCount = useMemo(() => events.reduce((count, event) => count + event.registeredStudents.length, 0), [events]);

  async function toggleRegistration(event: CampusEvent) {
    setBusy(event.id); setMessage("");
    try {
      const joined = event.registeredStudents.includes(studentId);
      const response = await fetch(`/api/events/${event.id}/register${joined ? `?studentId=${studentId}` : ""}`, {
        method: joined ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(joined ? {} : { body: JSON.stringify({ studentId }) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update registration.");
      await loadEvents();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(null); }
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not create event.");
      setShowForm(false); setCategory("All"); setSearch(""); await loadEvents();
      setMessage("Event published.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top">Campus Connect</a>
      <nav><a className="nav-active" href="#events">Discover</a><button className="nav-host" onClick={() => setShowForm(true)}>Host an event</button></nav>
    </header>

    <main id="top">
      <section className="welcome">
        <div className="welcome-copy"><h1>Find campus events</h1><p className="welcome-text">Browse upcoming workshops, talks, and student activities around campus.</p></div>
      </section>

      <section className="stats-row" aria-label="Campus activity"><div><strong>{allCount}</strong><span>events shown</span></div><div><strong>{organizerCount}</strong><span>organizers</span></div><div><strong>{registrationCount}</strong><span>student RSVPs</span></div><div className="stats-note">RSVPs are open</div></section>

      <section id="events" className="events-section">
        <div className="section-heading"><div><h2>Upcoming events</h2><p className="section-subtitle">Activities hosted by student clubs and campus groups.</p></div></div>
        <div className="toolbar"><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "tab selected" : "tab"} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search"><input aria-label="Search events" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
        {message && <div className="notice" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss">×</button></div>}
        {loading ? <div className="empty-state">Loading events…</div> : events.length === 0 ? <div className="empty-state">No events match those filters. Try a different search.</div> : <div className="event-grid">{events.map((event) => {
          const joined = event.registeredStudents.includes(studentId); const full = event.registeredStudents.length >= event.capacity;
          return <article className="event-card" key={event.id}>
            <div className="event-art"><span className="event-category">{event.category}</span><div className="date-stamp"><strong>{formatDate(event.date).split(" ")[1]}</strong><span>{formatDate(event.date).split(" ")[0]}</span></div></div>
            <div className="event-body"><div className="event-meta"><span>{event.time}</span><span className="capacity">{event.capacity - event.registeredStudents.length} spots left</span></div><h3>{event.title}</h3><p className="event-description">{event.description}</p><div className="event-location">{event.location}</div><div className="event-footer"><span className="attending">{event.registeredStudents.length} students going</span><button className={joined ? "button joined" : "button button-join"} disabled={busy === event.id || (!joined && full)} onClick={() => void toggleRegistration(event)}>{busy === event.id ? "Saving…" : joined ? "Going ✓" : full ? "Full" : "Join event"}</button></div></div>
          </article>;
        })}</div>}
      </section>
      <footer><a className="brand footer-brand" href="#top">Campus Connect</a><span>College events and activities</span><span>© 2026 Campus Connect</span></footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><form className="event-form" onSubmit={createEvent}><div className="form-heading"><div><h2>Host an event</h2></div><button type="button" className="close-button" aria-label="Close" onClick={() => setShowForm(false)}>×</button></div><label>Event name<input name="title" placeholder="e.g. Friday game night" required /></label><label>What’s it about?<textarea name="description" placeholder="Tell students what to expect…" rows={3} required /></label><div className="form-row"><label>Category<select name="category" required>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Capacity<input name="capacity" type="number" min="1" defaultValue="50" required /></label></div><div className="form-row"><label>Date<input name="date" type="date" min={localToday()} required /></label><label>Time<input name="time" type="time" required /></label></div><label>Location<input name="location" placeholder="Building and room" required /></label><label>Organizer<input name="organizer" placeholder="Club or your name" defaultValue="Student Club" required /></label><button className="button button-dark submit-button" type="submit">Publish event <span>→</span></button></form></div>}
  </div>;
}
