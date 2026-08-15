"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: number;
  hour: string;
  name: string;
  booking_date: string;
  created_at: string;
};

type PremiumBooking = {
  id: number;
  hour: string;
  name: string;
  booking_date: string;
  created_at: string;
};

type SlotControl = {
  hour: string;
  is_open: boolean;
};

type PremiumSlotControl = {
  id: number;
  hour: string;
  is_open: boolean;
};

export default function AdminClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [premiumBookings, setPremiumBookings] = useState<
    PremiumBooking[]
  >([]);

  const [slots, setSlots] = useState<SlotControl[]>([]);
  const [premiumSlots, setPremiumSlots] = useState<
    PremiumSlotControl[]
  >([]);

  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const [
        bookingsResponse,
        slotsResponse,
        premiumSlotsResponse,
        premiumBookingsResponse,
      ] = await Promise.all([
        fetch("/api/bookings", {
          cache: "no-store",
        }),

        fetch("/api/admin/slots", {
          cache: "no-store",
        }),

        fetch("/api/admin/premium-slots", {
          cache: "no-store",
        }),

        fetch("/api/premium", {
          cache: "no-store",
        }),
      ]);

      const bookingsData =
        await bookingsResponse.json();

      const slotsData =
        await slotsResponse.json();

      const premiumSlotsData =
        await premiumSlotsResponse.json();

      const premiumBookingsData =
        await premiumBookingsResponse.json();

      setBookings(
        bookingsData.bookings || []
      );

      setSlots(
        slotsData.slots || []
      );

      setPremiumSlots(
        premiumSlotsData.slots || []
      );

      setPremiumBookings(
        premiumBookingsData.bookings || []
      );
    } catch {
      setMsg("Грешка при зареждане.");
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // NORMAL DELETE
  // =========================

  async function remove(
    id: number,
    name: string
  ) {
    if (!confirm(`Премахни ${name}?`)) {
      return;
    }

    const r = await fetch(
      "/api/admin/delete",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      `${name} беше премахнат.`
    );

    load();
  }

  // =========================
  // PREMIUM DELETE
  // =========================

  async function removePremium(
    id: number,
    name: string
  ) {
    if (
      !confirm(
        `Премахни Premium играча ${name}?`
      )
    ) {
      return;
    }

    const r = await fetch(
      "/api/admin/premium-delete",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      `Premium играчът ${name} беше премахнат.`
    );

    load();
  }

  // =========================
  // RESET NORMAL
  // =========================

  async function reset() {
    if (
      !confirm(
        "Сигурен ли си? Ще бъдат премахнати ВСИЧКИ записани играчи. MagicSlien_ остава permanent."
      )
    ) {
      return;
    }

    const r = await fetch(
      "/api/admin/reset",
      {
        method: "POST",
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      "Всички временни играчи са изчистени."
    );

    load();
  }

  // =========================
  // RESET PREMIUM
  // =========================

  async function resetPremium() {
    if (
      !confirm(
        "Сигурен ли си? Ще бъдат премахнати ВСИЧКИ Premium играчи."
      )
    ) {
      return;
    }

    const r = await fetch(
      "/api/admin/premium-reset",
      {
        method: "POST",
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      "Всички Premium играчи са изчистени."
    );

    load();
  }

  // =========================
  // NORMAL SLOT TOGGLE
  // =========================

  async function toggleSlot(
    hour: string,
    isOpen: boolean
  ) {
    const r = await fetch(
      "/api/admin/slots",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          hour,
          is_open: !isOpen,
        }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      !isOpen
        ? `${hour} е отключен.`
        : `${hour} е заключен.`
    );

    load();
  }

  // =========================
  // PREMIUM SLOT TOGGLE
  // =========================

  async function togglePremiumSlot(
    hour: string,
    isOpen: boolean
  ) {
    const r = await fetch(
      "/api/admin/premium-slots",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          hour,
          is_open: !isOpen,
        }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return setMsg(
        data.error || "Грешка."
      );
    }

    setMsg(
      !isOpen
        ? `Premium ${hour} е отключен.`
        : `Premium ${hour} е заключен.`
    );

    load();
  }

  async function logout() {
    await fetch(
      "/api/admin/logout",
      {
        method: "POST",
      }
    );

    location.href = "/";
  }

  const hours = Array.from(
    new Set(
      bookings.map(
        (b) => b.hour
      )
    )
  );

  return (
    <main className="page">
      <section className="card admin">

        <h1>
          FACEIT Admin Panel
        </h1>

        <p className="subtitle">
          Управление на FACEIT играчите
          и слотовете
        </p>

        {/* NORMAL SLOT CONTROL */}

        <div className="section">

          <div className="section-title">
            🔐 Управление на слотовете
          </div>

          {slots.map((slot) => (
            <div
              className="saved"
              key={slot.hour}
            >
              <div>
                <b>{slot.hour}</b>
              </div>

              <strong>
                {slot.is_open
                  ? "🟢 Отключен"
                  : "🔒 Заключен"}
              </strong>

              <button
                className={
                  slot.is_open
                    ? "remove"
                    : "admin-toggle"
                }
                onClick={() =>
                  toggleSlot(
                    slot.hour,
                    slot.is_open
                  )
                }
              >
                {slot.is_open
                  ? "Заключи"
                  : "Отключи"}
              </button>
            </div>
          ))}

        </div>

        {/* PREMIUM SLOT CONTROL */}

        <div className="section">

          <div className="section-title">
            👑 FACEIT Premium with Kera4a
          </div>

          {premiumSlots.map(
            (slot) => (
              <div
                className="saved"
                key={slot.hour}
              >
                <div>
                  <b>{slot.hour}</b>
                </div>

                <strong>
                  {slot.is_open
                    ? "🟢 Отключен"
                    : "🔒 Заключен"}
                </strong>

                <button
                  className={
                    slot.is_open
                      ? "remove"
                      : "admin-toggle"
                  }
                  onClick={() =>
                    togglePremiumSlot(
                      slot.hour,
                      slot.is_open
                    )
                  }
                >
                  {slot.is_open
                    ? "Заключи"
                    : "Отключи"}
                </button>
              </div>
            )
          )}

        </div>

        {/* NORMAL RESET */}

        <div className="danger-box">

          <h2>
            🔄 Reset All Players
          </h2>

          <p>
            Изчиства всички записани
            стандартни играчи.
            <b> MagicSlien_</b>{" "}
            остава permanent.
          </p>

          <button
            className="danger"
            onClick={reset}
          >
            RESET PLAYERS
          </button>

        </div>

        {/* NORMAL PLAYERS */}

        <div className="section">

          <div className="section-title">
            📋 Записани играчи (
            {bookings.length}
            )
          </div>

          {bookings.length === 0 ? (

            <div className="empty">
              Няма записани играчи.
            </div>

          ) : (

            hours.map(
              (hour) => {

                const players =
                  bookings.filter(
                    (b) =>
                      b.hour ===
                      hour
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

                      {players.map(
                        (player) => (
                          <div
                            className="player"
                            key={player.id}
                          >

                            <span>
                              👤{" "}
                              {player.name}
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
                        )
                      )}

                      {Array.from({
                        length:
                          4 -
                          players.length,
                      }).map(
                        (_, index) => (
                          <div
                            className="player"
                            key={`empty-${index}`}
                          >
                            <span>
                              👤 Свободно
                            </span>
                          </div>
                        )
                      )}

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

        {/* PREMIUM PLAYERS */}

        <div className="section">

          <div className="section-title">
            👑 Premium играчи (
            {premiumBookings.length}
            )
          </div>

          {premiumBookings.length === 0 ? (

            <div className="empty">
              Няма записани Premium играчи.
            </div>

          ) : (

            premiumBookings.map(
              (booking) => (

                <div
                  className="saved"
                  key={booking.id}
                >

                  <div>
                    <b>
                      {booking.hour}
                    </b>
                  </div>

                  <strong>
                    👤 {booking.name}
                  </strong>

                  <button
                    className="remove"
                    onClick={() =>
                      removePremium(
                        booking.id,
                        booking.name
                      )
                    }
                  >
                    Премахни
                  </button>

                </div>

              )
            )

          )}

        </div>

        {/* PREMIUM RESET */}

        <div className="danger-box">

          <h2>
            👑 Reset Premium Players
          </h2>

          <p>
            Изчиства всички записани
            Premium играчи.
          </p>

          <button
            className="danger"
            onClick={resetPremium}
          >
            RESET PREMIUM
          </button>

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
