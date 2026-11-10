import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = "Technology" | "Workshop" | "Cultural" | "Sports" | "Career";
type CampusEvent = { id: string; title: string; description: string; category: Category; date: string; time: string; location: string; organizer: string; capacity: number; registeredStudents: string[] };
const studentId = "student-demo";
const categories = ["All", "Technology", "Workshop", "Cultural", "Sports", "Career"] as const;
const categoryIcon: Record<Category, string> = { Technology: "⌘", Workshop: "✳", Cultural: "♫", Sports: "◉", Career: "↗" };
const formatDate = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
const formatDay = (value: string) => new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${value}T12:00:00`));

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
  const allCount = useMemo(() => events.length, [events]);

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
      setMessage("Your event is live. See you there!");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-icon">cc</span><span>campus<span className="brand-light">connect</span></span></a>
      <nav><a className="nav-active" href="#events">Discover</a><a href="#events">My events <span className="nav-dot" /></a></nav>
      <button className="profile" aria-label="Student profile">AM</button>
    </header>

    <main id="top">
      <section className="welcome">
        <div className="welcome-copy"><p className="eyebrow">YOUR CAMPUS, YOUR COMMUNITY</p><h1>Make room for<br /><span>what moves you.</span></h1><p className="welcome-text">Find your people, try something new, and make this semester count.</p><button className="button button-dark" onClick={() => setShowForm(true)}>＋ Host an event</button></div>
        <div className="welcome-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-spark">✦</div><div className="art-card card-back">✳<small>CREATE</small></div><div className="art-card card-front">♫<small>CONNECT</small></div><div className="art-note note-one">✷</div><div className="art-note note-two">✦</div><span className="art-caption">good things happen<br />when we show up.</span></div>
      </section>

      <section className="stats-row" aria-label="Campus activity"><div><strong>{allCount || "05"}</strong><span>upcoming events</span></div><div><strong>12</strong><span>student clubs</span></div><div><strong>1,200<span className="plus">+</span></strong><span>students involved</span></div><div className="stats-note"><span className="live-dot" /> Campus is buzzing</div></section>

      <section id="events" className="events-section">
        <div className="section-heading"><div><p className="eyebrow">THE GOOD STUFF</p><h2>Happening around campus</h2><p className="section-subtitle">Little plans. Big memories. Find your next thing.</p></div><button className="button button-outline" onClick={() => setShowForm(true)}>＋ Add an event</button></div>
        <div className="toolbar"><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "tab selected" : "tab"} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search"><span>⌕</span><input aria-label="Search events" placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></label></div>
        {message && <div className="notice" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss">×</button></div>}
        {loading ? <div className="empty-state">Finding the good stuff…</div> : events.length === 0 ? <div className="empty-state">No events match that search yet. Try another filter or host one!</div> : <div className="event-grid">{events.map((event) => {
          const joined = event.registeredStudents.includes(studentId); const full = event.registeredStudents.length >= event.capacity;
          return <article className="event-card" key={event.id}>
            <div className={`event-art art-${event.category.toLowerCase()}`}><span className="event-art-symbol">{categoryIcon[event.category]}</span><span className="event-category">{event.category}</span><div className="date-stamp"><strong>{formatDate(event.date).split(" ")[1]}</strong><span>{formatDay(event.date).toUpperCase()}</span></div><span className="art-decoration">✦</span></div>
            <div className="event-body"><div className="event-meta"><span>{formatDate(event.date)} · {event.time}</span><span className="capacity">{event.capacity - event.registeredStudents.length} spots left</span></div><h3>{event.title}</h3><p className="event-description">{event.description}</p><div className="event-location"><span>⌖</span>{event.location}</div><div className="event-footer"><div className="attending"><div className="avatar-stack"><i>A</i><i>J</i><i>M</i></div><span>{event.registeredStudents.length} going</span></div><button className={joined ? "button joined" : "button button-join"} disabled={busy === event.id || (!joined && full)} onClick={() => void toggleRegistration(event)}>{busy === event.id ? "Saving…" : joined ? "Going ✓" : full ? "Full" : "Join event"}</button></div></div>
          </article>;
        })}</div>}
      </section>
      <footer><a className="brand footer-brand" href="#top"><span className="brand-icon">cc</span><span>campus<span className="brand-light">connect</span></span></a><span>Made for the moments between classes.</span><span>© 2026 Campus Connect</span></footer>
    </main>

    {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><form className="event-form" onSubmit={createEvent}><div className="form-heading"><div><p className="eyebrow">BRING PEOPLE TOGETHER</p><h2>Host an event</h2></div><button type="button" className="close-button" aria-label="Close" onClick={() => setShowForm(false)}>×</button></div><label>Event name<input name="title" placeholder="e.g. Friday game night" required /></label><label>What’s it about?<textarea name="description" placeholder="Tell students what to expect…" rows={3} required /></label><div className="form-row"><label>Category<select name="category" required>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Capacity<input name="capacity" type="number" min="1" defaultValue="50" required /></label></div><div className="form-row"><label>Date<input name="date" type="date" min="2026-11-10" required /></label><label>Time<input name="time" type="time" required /></label></div><label>Location<input name="location" placeholder="Building and room" required /></label><label>Organizer<input name="organizer" placeholder="Club or your name" defaultValue="Student Club" required /></label><button className="button button-dark submit-button" type="submit">Publish event <span>→</span></button></form></div>}
  </div>;
}
