import { NextResponse } from "next/server";
import { supabase } from "@/lib";

export async function GET() {
  const { data, error } = await supabase
    .from("premium_bookings")
    .select("*")
    .order("hour", { ascending: true });

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
        { error: "Моля, въведи име." },
        { status: 400 }
      );
    }

    const bookingDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Sofia",
    }).format(new Date());

    const { data: existing } = await supabase
      .from("premium_bookings")
      .select("id")
      .eq("booking_date", bookingDate)
      .eq("hour", hour)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Този Premium слот вече е зает." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("premium_bookings")
      .insert({
        hour,
        name: name.trim(),
        booking_date: bookingDate,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      booking: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
