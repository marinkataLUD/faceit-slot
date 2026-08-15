import { NextResponse } from "next/server";
import { supabase } from "@/lib";

export async function POST() {
  try {
    const bookingDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Sofia",
    }).format(new Date());

    const { error } = await supabase
      .from("premium_bookings")
      .delete()
      .eq("booking_date", bookingDate);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Premium играчите са изчистени.",
    });
  } catch {
    return NextResponse.json(
      { error: "Грешка при изчистване." },
      { status: 500 }
    );
  }
}
