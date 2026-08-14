 "use client";

import { useEffect, useState } from "react";

type Booking = { hour: string; name: string; created_at: string };

export default function AdminClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/bookings", { cache: "no-store" });
    const data = await r.json();
    setBookings(data.bookings || []);
  }
  useEffect(() => { load(); }, []);

  async function remove(hour: string) {
    if (!confirm(`Премахни ${hour}?`)) return;
    const r = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hour }),
    });
    const data = await r.json();
    if (!r.ok) return setMsg(data.error || "Грешка.");
    setMsg("Слотът е премахнат.");
    load();
  }

  async function reset() {
    if (!confirm("Сигурен ли си? Ще бъдат премахнати ВСИЧКИ записани слотове. MagicSlien_ остава.")) return;
    const r = await fetch("/api/admin/reset", { method: "POST" });
    const data = await r.json();
    if (!r.ok) return setMsg(data.error || "Грешка.");
    setMsg("Всички временни слотове са изчистени.");
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/";
  }

  return (
    <main className="page">
      <section className="card admin">
        <h1>FACEIT Admin Panel</h1>
        <p className="subtitle">Управление на запазените слотове</p>

        <div className="danger-box">
          <h2>🔄 Reset All Slots</h2>
          <p>Изчиства всички записани отбори. <b>MagicSlien_</b> остава permanent.</p>
          <button className="danger" onClick={reset}>RESET SLOTS</button>
        </div>

        <div className="section">
          <div className="section-title">📋 Заети слотове ({bookings.length}/4)</div>
          {bookings.length === 0 ? <div className="empty">Няма заети слотове.</div> :
            bookings.map(b => (
              <div className="saved" key={b.hour}>
                <div><b>{b.hour}</b><strong>{b.name}</strong></div>
                <button className="remove" onClick={() => remove(b.hour)}>Премахни</button>
              </div>
            ))}
        </div>

        {msg && <div className="success">{msg}</div>}
        <div className="admin-actions">
          <a href="/">← Към слотовете</a>
          <button onClick={logout}>Изход</button>
        </div>
      </section>
    </main>
  );
}