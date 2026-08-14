import { NextResponse } from "next/server";
import { supabase } from "@/lib";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("faceit_players")
    .select("id, hour, name, booking_date, created_at")
    .eq("booking_date", today)
    .order("hour", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    bookings: data || [],
  });
}

export async function POST(req: Request) {
  try {
    const { hour, name } = await req.json();

    if (!hour || !name?.trim()) {
      return NextResponse.json(
        { error: "Името и часът са задължителни." },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
const currentHour = now.getHours();

const match = hour.match(/^(\d{2}):00/);

if (!match) {
  return NextResponse.json(
    { error: "Невалиден час." },
    { status: 400 }
  );
}

const slotHour = Number(match[1]);

// Няма записвания след 10:00
if (currentHour >= 10) {
  return NextResponse.json(
    { error: "Записванията за днес са приключили." },
    { status: 409 }
  );
}

// Слотът се заключва точно когато започне
if (slotHour <= currentHour) {
  return NextResponse.json(
    { error: "Този час вече е започнал или е приключил." },
    { status: 409 }
  );
}

    // Проверяваме колко играчи има за този час
    const { count, error: countError } = await supabase
      .from("faceit_players")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("booking_date", today)
      .eq("hour", hour);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    // Максимум 4 играчи за една игра
    if ((count || 0) >= 4) {
      return NextResponse.json(
        { error: "Този час вече е пълен (4/4)." },
        { status: 409 }
      );
    }

    // Проверяваме дали играчът вече е записан за този час
    const { data: existing } = await supabase
      .from("faceit_players")
      .select("id")
      .eq("booking_date", today)
      .eq("hour", hour)
      .eq("name", name.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Вече си записан за този час." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("faceit_players")
      .insert({
        booking_date: today,
        hour,
        name: name.trim(),
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
