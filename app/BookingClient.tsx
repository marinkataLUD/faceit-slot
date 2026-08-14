 "use client";

import { useEffect, useState } from "react";

type Booking = { hour: string; name: string; created_at: string };
const slots = Array.from({ length: 11 }, (_, i) => {
  const h = i;
  const start = `${String(h).padStart(2, "0")}:00`;
  const next = h + 1;
  return {
    start,
    range: `${start} - ${String(next).padStart(2, "0")}:00`,
  };
});

export default function BookingClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/bookings", { cache: "no-store" });
      const data = await r.json();
      setBookings(data.bookings || []);
    } catch {
      setError("Неуспешно зареждане на слотовете.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function book(range: string) {
    const name = prompt("Въведи име на отбора:");
    if (!name?.trim()) return;

    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hour: range, name: name.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Грешка при записване.");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const count = bookings.length;

  return (
    <main className="page">
      <section className="card">
        <h1>FACEIT Slot Booking</h1>
        <p className="subtitle">Запази си час за игра</p>

        <div className="section">
          <div className="section-title">🔒 Перманентен слот</div>
          <div className="row permanent">
            <b>01:00 - 10:00</b>
            <div>
              <strong>MagicSlien_</strong>
              <small>Постоянно запазен слот</small>
            </div>
            <span className="badge">PERMANENT</span>
          </div>
        </div>

        <div className="section">
          <div className="section-title">🎮 Свободни часове</div>
          {loading ? <div className="loading">Зареждане...</div> : slots.map(s => {
            const booking = bookings.find(b => b.hour === s.range);
            const full = count >= 4 && !booking;
            return (
              <div className="row" key={s.range}>
                <b>{s.range}</b>
                <div>
                  <strong>{booking ? booking.name : "Свободен"}</strong>
                  <small>{booking ? "Зает слот" : "Който пръв го запази, го заема"}</small>
                </div>
                <button disabled={!!booking || full || busy} onClick={() => book(s.range)}>
                  {booking ? "Заето" : full ? "FULL" : "Запази"}
                </button>
              </div>
            );
          })}
          <div className="counter">Заети слотове: {count}/4</div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="section">
          <div className="section-title">📋 Запазени до тук</div>
          {bookings.length === 0 ? (
            <div className="empty">Все още няма запазени слотове.</div>
          ) : bookings.map((b, i) => (
            <div className="saved" key={b.hour}>
              <b>{b.hour.split(" - ")[0]}</b>
              <div><strong>{b.name}</strong><small>Запазен слот #{i + 1}</small></div>
              <span className="badge">BOOKED</span>
            </div>
          ))}
        </div>

        <a className="admin-link" href="/admin">🔐 Admin</a>
      </section>
    </main>
  );
}
