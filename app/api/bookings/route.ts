import { NextResponse } from "next/server";
import { supabase, MAX_BOOKINGS } from "@/lib";

export async function GET() {
  const { data, error } = await supabase
    .from("bookings")
    .select("hour,name,created_at,booking_date")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data || [] });
}

export async function POST(req: Request) {
  try {
    const { hour, name } = await req.json();

    const booking_date = new Date().toISOString().split("T")[0];

    if (!hour || !name?.trim()) {
      return NextResponse.json(
        { error: "Името и часът са задължителни." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("bookings")
      .select("hour")
      .eq("hour", hour)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Този час вече е зает." },
        { status: 409 }
      );
    }

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    if ((count || 0) >= MAX_BOOKINGS) {
      return NextResponse.json(
        { error: "Всичките 4 слота вече са заети." },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("bookings")
      .insert({
        hour,
        name: name.trim(),
        booking_date,
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
