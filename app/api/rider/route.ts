import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rider from "@/models/Rider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feId, fullName, phone, token } = body;

    /* ── Validation ───────────────────── */

    if (!feId || !fullName || !phone) {
      return NextResponse.json(
        {
          error: "Missing required fields: feId, fullName, phone are required.",
        },
        { status: 400 },
      );
    }

    // Phone validation (India)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format." },
        { status: 400 },
      );
    }

    /* ── DB Connection ───────────────── */

    await connectToDatabase();

    /* ── Check Duplicate FE ID ───────── */

    const existingRider = await Rider.findOne({ feId });

    if (existingRider) {
      return NextResponse.json(
        { error: "Rider with this FE ID already exists." },
        { status: 409 },
      );
    }

    /* ── Create Rider ────────────────── */

    const newRider = await Rider.create({
      feId,
      fullName,
      phone,
      token,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Rider created successfully",
        data: newRider,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("RIDER_API_ERROR:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }

    // Duplicate key error (safety)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate FE ID detected." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all riders, sort by createdAt descending (newest first)
    const riders = await Rider.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: riders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("RIDER_API_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching riders." },
      { status: 500 }
    );
  }
}
