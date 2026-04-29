import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rider from "@/models/Rider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { feId, fullName, phone } = body;

    if (!feId || !fullName || !phone) {
      return NextResponse.json(
        { error: "feId, fullName, phone are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    /* 🔍 Find today's entry */
    const existing = await Rider.findOne({
      phone,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    /* ───── CASE: Already checked in ───── */
    if (existing) {
      if (existing.checkedOutAt) {
        return NextResponse.json(
          { error: "Already checked in & out today." },
          { status: 400 },
        );
      }

      // ✅ Update checkout
      existing.checkedOutAt = new Date();
      await existing.save();

      return NextResponse.json({
        success: true,
        message: "Checked out successfully",
        data: existing,
      });
    }

    /* ───── CASE: New check-in ───── */

    const todayCount = await Rider.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const token = todayCount + 1;

    const newEntry = await Rider.create({
      feId,
      fullName,
      phone,
      token,
    });

    return NextResponse.json({
      success: true,
      message: "Checked in successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const dateRange = searchParams.get("dateRange") || "all";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // Search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { feId: { $regex: search, $options: "i" } },
      ];
    }

    // Status
    if (status === "checked-in") {
      query.checkedOutAt = null;
    } else if (status === "checked-out") {
      query.checkedOutAt = { $ne: null };
    }

    // Date
    if (dateRange !== "all") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      if (dateRange === "today") {
        query.createdAt = { $gte: start, $lte: end };
      } else if (dateRange === "yesterday") {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        query.createdAt = { $gte: start, $lte: end };
      } else if (dateRange === "last7") {
        start.setDate(start.getDate() - 7);
        query.createdAt = { $gte: start };
      } else if (dateRange === "custom" && from && to) {
        const customStart = new Date(from);
        customStart.setHours(0, 0, 0, 0);
        const customEnd = new Date(to);
        customEnd.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: customStart, $lte: customEnd };
      }
    }

    const skip = (page - 1) * limit;

    const [riders, total] = await Promise.all([
      Rider.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Rider.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: riders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("RIDER_API_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching riders." },
      { status: 500 },
    );
  }
}
