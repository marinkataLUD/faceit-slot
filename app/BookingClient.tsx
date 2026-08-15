"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  hour: string;
  name: string;
  booking_date: string;
  created_at: string;
};

type SlotControl = {
  hour: string;
  is_open: boolean | null;
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

  // След 10:00 всичко е заключено
  if (currentHour >= 10) {
    return false;
  }

  // Само текущият час е отворен
  return currentHour === startHour;
}

export default function BookingClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slotControls, setSlotControls] = useState<SlotControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [bookingsResponse, slotsResponse] =
        await Promise.all([
          fetch("/api/bookings", {
            cache: "no-store",
          }),

          fetch("/api/admin/slots", {
            cache: "no-store",
          }),
        ]);

      const bookingsData = await bookingsResponse.json();

      if (!bookingsResponse.ok) {
        throw new Error(
          bookingsData.error || "Грешка."
        );
      }

      setBookings(bookingsData.bookings || []);

      if (slotsResponse.ok) {
        const slotsData = await slotsResponse.json();

        setSlotControls(
          slotsData.slots || []
        );
      } else {
        setSlotControls([]);
      }
    } catch (e: any) {
      setError(
        e.message || "Неуспешно зареждане."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const refresh = setInterval(load, 5000);

    return () => {
      clearInterval(refresh);
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

  function getSlotOpen(
    startHour: number,
    range: string
  ) {
    const control = slotControls.find(
      (slot) => slot.hour === range
    );

    if (!control || control.is_open === null) {
      return isSlotOpenAutomatically(
        startHour
      );
    }

    return control.is_open;
  }

  return (
    <main className="page">
      <section className="card">

        <h1>FACEIT Slot Booking</h1>

        <p className="subtitle">
          Избери час и се запиши за FACEIT
        </p>

        {/* PREMIUM BUTTON */}

        <a
          className="premium-link"
          href="/premium"
        >
          👑 Искаш да играеш премка с Керача?
        </a>

        {/* PERMANENT SLOT */}

        <div className="section">

          <div className="section-title">
            🔒 Перманентен слот
          </div>

          <div className="row permanent">

            <b>01:00 - 10:00</b>

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

              const players =
                bookings.filter(
                  (b) =>
                    b.hour ===
                    slot.range
                );

              const playerCount =
                players.length;

              const open =
                getSlotOpen(
                  slot.startHour,
                  slot.range
                );

              const full =
                playerCount >= 4;

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

                    {[0, 1, 2, 3].map(
                      (index) => {

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
                      }
                    )}

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
                        🟢{" "}
                        {4 - playerCount}{" "}
                        свободни места
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
