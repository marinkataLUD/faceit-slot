"use client";

import { useEffect, useState } from "react";

type Booking = {
  hour: string;
  name: string;
  created_at: string;
};

const slots = Array.from({ length: 11 }, (_, i) => {
  const startHour = i;
  const endHour = i + 1;

  return {
    startHour,
    range: `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00`,
  };
});

function isSlotOpen(startHour: number) {
  const now = new Date();
  const hour = now.getHours();

  // Booking period is only from 00:00 until 10:00
  if (hour >= 10) return false;

  // A slot closes exactly when its starting hour has passed.
  return hour <= startHour;
}

export default function BookingClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

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

    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 30000);

    const refresh = setInterval(load, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(refresh);
    };
  }, []);

  async function book(range: string) {
    const name = prompt("Въведи име:");
    if (!name?.trim()) return;

    setBusy(true);
    setError("");

    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hour: range,
          name: name.trim(),
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.error || "Грешка при записване.");
      }

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
          <div className="section-title">
            🎮 Свободни часове
          </div>

          {loading ? (
            <div className="loading">Зареждане...</div>
          ) : (
            slots.map((slot) => {
              const booking = bookings.find(
                (b) => b.hour === slot.range
              );

              const open = isSlotOpen(slot.startHour);

              return (
                <div className="row" key={slot.range}>
                  <b>{slot.range}</b>

                  <div>
                    <strong>
                      {booking
                        ? booking.name
                        : !open
                        ? "Затворен"
                        : "Свободен"}
                    </strong>

                    <small>
                      {booking
                        ? "Зает слот"
                        : !open
                        ? "Часът е изтекъл"
                        : "Който пръв го запази, го заема"}
                    </small>
                  </div>

                  <button
                    disabled={
                      !!booking ||
                      !open ||
                      busy ||
                      count >= 4
                    }
                    onClick={() => book(slot.range)}
                  >
                    {booking
                      ? "Заето"
                      : !open
                      ? "Затворено"
                      : count >= 4
                      ? "FULL"
                      : "Запази"}
                  </button>
                </div>
              );
            })
          )}

          <div className="counter">
            Заети слотове: {count}/4
          </div>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="section">
          <div className="section-title">
            📋 Запазени до тук
          </div>

          {bookings.length === 0 ? (
            <div className="empty">
              Все още няма запазени слотове.
            </div>
          ) : (
            bookings.map((b, i) => (
              <div className="saved" key={b.hour}>
                <b>{b.hour.split(" - ")[0]}</b>

                <div>
                  <strong>{b.name}</strong>
                  <small>
                    Запазен слот #{i + 1}
                  </small>
                </div>

                <span className="badge">
                  BOOKED
                </span>
              </div>
            ))
          )}
        </div>

        <a className="admin-link" href="/admin">
          🔐 Admin
        </a>
      </section>
    </main>
  );
}
  );
}
