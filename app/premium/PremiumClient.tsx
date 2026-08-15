"use client";

import { useEffect, useState } from "react";

type PremiumBooking = {
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

function getBulgariaHour() {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    hour: "numeric",
    hourCycle: "h23",
  }).format(new Date());

  return Number(hour);
}

function isSlotOpenAutomatically(startHour: number) {
  const currentHour = getBulgariaHour();

  if (currentHour >= 10) return false;

  return currentHour === startHour;
}

export default function PremiumClient() {
  const [bookings, setBookings] = useState<
    PremiumBooking[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/premium", {
        cache: "no-store",
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(
          data.error || "Грешка."
        );
      }

      setBookings(data.bookings || []);
    } catch (e: any) {
      setError(
        e.message ||
          "Неуспешно зареждане."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const refresh = setInterval(
      load,
      5000
    );

    return () =>
      clearInterval(refresh);
  }, []);

  async function book(hour: string) {
    const name = prompt(
      "Въведи името си:"
    );

    if (!name?.trim()) return;

    setBusy(true);
    setError("");

    try {
      const r = await fetch(
        "/api/premium",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            hour,
            name: name.trim(),
          }),
        }
      );

      const data = await r.json();

      if (!r.ok) {
        throw new Error(
          data.error ||
            "Грешка при записване."
        );
      }

      await load();
    } catch (e: any) {
      setError(
        e.message ||
          "Грешка при записване."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <section className="card">

        {/* HEADER */}

        <h1>
          FACEIT Premium
          <br />
          <span className="premium-title">
            with Kera4a
          </span>
        </h1>

        <p className="subtitle">
          Искаш да играеш премка с Керача?
        </p>

        {/* PERMANENT */}

        <div className="section">

          <div className="section-title">
            👑 Перманентен слот
          </div>

          <div className="row permanent">

            <b>
              01:00 - 10:00
            </b>

            <div>
              <strong>
                MagicSlien_
              </strong>

              <small>
                Постоянно запазен слот
              </small>
            </div>

            <span className="badge">
              PERMANENT
            </span>

          </div>

        </div>

        {/* PREMIUM SLOTS */}

        <div className="section">

          <div className="section-title">
            🎮 FACEIT Premium игри
          </div>

          {loading ? (

            <div className="loading">
              Зареждане...
            </div>

          ) : (

            slots.map((slot) => {

              const booking =
                bookings.find(
                  (b) =>
                    b.hour ===
                    slot.range
                );

              const open =
                isSlotOpenAutomatically(
                  slot.startHour
                );

              return (
                <div
                  className="premium-slot"
                  key={slot.range}
                >

                  {/* TIME */}

                  <div className="premium-time">

                    <strong>
                      🎮 {slot.range}
                    </strong>

                    {open ? (
                      <span className="available">
                        🟢 Отворен
                      </span>
                    ) : (
                      <span className="closed">
                        🔒 Часът е затворен
                      </span>
                    )}

                  </div>

                  {/* PLAYERS */}

                  <div className="premium-players">

                    {/* PERMANENT PLAYER */}

                    <div className="premium-player permanent-player">

                      <span>
                        👑
                      </span>

                      <strong>
                        MagicSlien_
                      </strong>

                      <span className="badge">
                        PERMANENT
                      </span>

                    </div>

                    {/* SECOND PLAYER */}

                    <div className="premium-player">

                      {booking ? (

                        <>
                          <span>
                            👤
                          </span>

                          <strong>
                            {booking.name}
                          </strong>

                          <span className="taken">
                            Заето
                          </span>
                        </>

                      ) : (

                        <>
                          <span>
                            👤
                          </span>

                          <strong>
                            Свободно
                          </strong>

                          {open && (
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
                        </>

                      )}

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="premium-status">

                    {booking ? (

                      <span className="full">
                        🔴 2/2 Зает
                      </span>

                    ) : open ? (

                      <span className="available">
                        🟢 1 свободно място
                      </span>

                    ) : (

                      <span className="closed">
                        🔒 Часът е затворен
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

        {/* BACK */}

        <a
          className="admin-link"
          href="/"
        >
          ← Към стандартните FACEIT слотове
        </a>

      </section>
    </main>
  );
}
