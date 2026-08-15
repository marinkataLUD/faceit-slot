import { NextResponse } from "next/server";
import { supabase } from "@/lib";

export async function GET() {
  const { data, error } = await supabase
    .from("premium_slot_controls")
    .select("*")
    .order("hour", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    slots: data || [],
  });
}

export async function POST(req: Request) {
  try {
    const { hour, is_open } = await req.json();

    if (!hour || typeof is_open !== "boolean") {
      return NextResponse.json(
        { error: "Невалидни данни." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("premium_slot_controls")
      .upsert(
        {
          hour,
          is_open,
        },
        {
          onConflict: "hour",
        }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slot: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Невалидна заявка." },
      { status: 400 }
    );
  }
}
