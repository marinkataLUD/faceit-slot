import { NextResponse } from "next/server";
import { supabase } from "@/lib";

const MAX_PLAYERS_PER_SLOT = 4;

function getToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
  }).format(new Date());
}

export async function GET() {
  const today = getToday();

  const { data, error } = await supabase
    .from("bookings")
    .select("id,hour,name,booking_date,created_at")
    .eq("booking_date", today)
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

    const today = getToday();

    // Проверяваме колко човека вече са записани за ТОЗИ час
    const { count, error: countError } = await supabase
      .from("bookings")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("hour", hour)
      .eq("booking_date", today);

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    if ((count || 0) >= MAX_PLAYERS_PER_SLOT) {
      return NextResponse.json(
        { error: "Този час вече е пълен (4/4)." },
        { status: 409 }
      );
    }

    // Записваме новия играч
    const { error: insertError } = await supabase
      .from("bookings")
      .insert({
        hour,
        name: name.trim(),
        booking_date: today,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
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
