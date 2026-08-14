"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  hour: string;
  name: string;
  booking_date: string;
  created_at: string;
};

export default function AdminClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/bookings", {
      cache: "no-store",
    });

    const data = await r.json();
    setBookings(data.bookings || []);
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  async function remove(id: number, name: string) {
    if (!confirm(`Премахни ${name}?`)) return;

    const r = await fetch("/api/admin/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await r.json();

    if (!r.ok) {
      return setMsg(data.error || "Грешка.");
    }

    setMsg(`${name} беше премахнат.`);
    load();
  }

  async function reset() {
    if (
      !confirm(
        "Сигурен ли си? Ще бъдат премахнати ВСИЧКИ записани играчи. MagicSlien_ остава permanent."
      )
    ) {
      return;
    }

    const r = await fetch("/api/admin/reset", {
      method: "POST",
    });

    const data = await r.json();

    if (!r.ok) {
      return setMsg(data.error || "Грешка.");
    }

    setMsg("Всички временни играчи са изчистени.");
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    location.href = "/";
  }

  const hours = Array.from(
    new Set(bookings.map((b) => b.hour))
  );

  return (
    <main className="page">
      <section className="card admin">

        <h1>FACEIT Admin Panel</h1>

        <p className="subtitle">
          Управление на FACEIT играчите
        </p>

        {/* RESET */}

        <div className="danger-box">

          <h2>🔄 Reset All Players</h2>

          <p>
            Изчиства всички записани играчи.
            <b> MagicSlien_</b> остава permanent.
          </p>

          <button
            className="danger"
            onClick={reset}
          >
            RESET PLAYERS
          </button>

        </div>

        {/* PLAYERS */}

        <div className="section">

          <div className="section-title">
            📋 Записани играчи ({bookings.length})
          </div>

          {bookings.length === 0 ? (

            <div className="empty">
              Няма записани играчи.
            </div>

          ) : (

            hours.map((hour) => {

              const players = bookings.filter(
                (b) => b.hour === hour
              );

              return (

                <div
                  className="game-slot"
                  key={hour}
                >

                  <div className="game-header">

                    <strong>
                      🎮 {hour}
                    </strong>

                    <span className="players-count">
                      {players.length}/4
                    </span>

                  </div>

                  <div className="players">

                    {players.map((player) => (

                      <div
                        className="player"
                        key={player.id}
                      >

                        <span>
                          👤 {player.name}
                        </span>

                        <button
                          className="remove"
                          onClick={() =>
                            remove(
                              player.id,
                              player.name
                            )
                          }
                        >
                          Премахни
                        </button>

                      </div>

                    ))}

                    {Array.from({
                      length: 4 - players.length,
                    }).map((_, index) => (

                      <div
                        className="player"
                        key={`empty-${index}`}
                      >
                        <span>
                          👤 Свободно
                        </span>
                      </div>

                    ))}

                  </div>

                </div>

              );

            })

          )}

        </div>

        {msg && (
          <div className="success">
            {msg}
          </div>
        )}

        <div className="admin-actions">

          <a href="/">
            ← Към слотовете
          </a>

          <button onClick={logout}>
            Изход
          </button>

        </div>

      </section>
    </main>
  );
}
