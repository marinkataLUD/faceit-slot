"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  hour: string;
  name: string;
  booking_date: string;
  created_at: string;
};

const slots = Array.from({ length: 10 }, (_, i) => {
  const startHour = i;
  const endHour = i + 1;

  return {
    startHour,
    range: `${String(startHour).padStart(2, "0")}:00 - ${String(
      endHour
    ).padStart(2, "0")}:00`,
  };
});

function isSlotOpen(startHour: number) {
  const now = new Date();
  const hour = now.getHours();

  // Нов ден започва в 00:00
  // След 10:00 няма повече игри
  if (hour >= 10) return false;

  // Часът е отворен от началото му до края му
  return hour <= startHour;
}

export default function BookingClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/bookings", {
        cache: "no-store",
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.error || "Грешка.");
      }

      setBookings(data.bookings || []);
    } catch (e: any) {
      setError(e.message || "Неуспешно зареждане.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // Обновява списъка на всеки 5 секунди
    const refresh = setInterval(load, 5000);

    // При преминаване към нов час обновява страницата
    const clock = setInterval(() => {
      load();
    }, 30000);

    return () => {
      clearInterval(refresh);
      clearInterval(clock);
    };
  }, []);

  async function book(hour: string) {
    const name = prompt("Въведи името си:");

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
          hour,
          name: name.trim(),
        }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(
          data.error || "Грешка при записване."
        );
      }

      await load();
    } catch (e: any) {
      setError(e.message || "Грешка при записване.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="card">

        <h1>FACEIT Slot Booking</h1>

        <p className="subtitle">
          Избери час и се запиши за FACEIT
        </p>

        {/* PERMANENT SLOT */}

        <div className="section">

          <div className="section-title">
            🔒 Перманентен слот
          </div>

          <div className="row permanent">

            <b>01:00 - 10:00</b>

            <div>
              <strong>MagicSlien_</strong>

              <small>
                Постоянно запазен слот
              </small>
            </div>

            <span className="badge">
              PERMANENT
            </span>

          </div>

        </div>

        {/* NORMAL SLOTS */}

        <div className="section">

          <div className="section-title">
            🎮 FACEIT игри
          </div>

          {loading ? (

            <div className="loading">
              Зареждане...
            </div>

          ) : (

            slots.map((slot) => {

              const players = bookings.filter(
                (b) => b.hour === slot.range
              );

              const playerCount = players.length;

              const open = isSlotOpen(
                slot.startHour
              );

              const full = playerCount >= 4;

              return (

                <div
                  className="game-slot"
                  key={slot.range}
                >

                  {/* TIME */}

                  <div className="game-header">

                    <strong>
                      🎮 {slot.range}
                    </strong>

                    <span
                      className={
                        full
                          ? "full"
                          : "players-count"
                      }
                    >
                      {playerCount}/4
                    </span>

                  </div>

                  {/* PLAYERS */}

                  <div className="players">

                    {[0, 1, 2, 3].map((index) => {

                      const player =
                        players[index];

                      return (

                        <div
                          className="player"
                          key={index}
                        >

                          <span>
                            {player
                              ? `👤 ${player.name}`
                              : `👤 Свободно`}
                          </span>

                          {!player &&
                            open &&
                            !full && (

                              <button
                                disabled={busy}
                                onClick={() =>
                                  book(
                                    slot.range
                                  )
                                }
                              >
                                Запази
                              </button>

                            )}

                          {player && (

                            <span className="taken">
                              Заето
                            </span>

                          )}

                        </div>

                      );

                    })}

                  </div>

                  {/* STATUS */}

                  <div className="slot-status">

                    {!open && (
                      <span className="closed">
                        🔒 Часът е затворен
                      </span>
                    )}

                    {open && full && (
                      <span className="full">
                        🔴 FULL 4/4
                      </span>
                    )}

                    {open && !full && (
                      <span className="available">
                        🟢 {4 - playerCount} свободни места
                      </span>
                    )}

                  </div>

                </div>

              );

            })

          )}

        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <a
          className="admin-link"
          href="/admin"
        >
          🔐 Admin
        </a>

      </section>
    </main>
  );
}
