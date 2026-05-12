import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import SubAdmin from "@/models/SubAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, hubName } = body;

    if (!name || !email || !phoneNumber || !hubName) {
      return NextResponse.json(
        { error: "Name, email, phone number and hub name are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Check if email already exists
    const existing = await SubAdmin.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "A sub admin with this email already exists." },
        { status: 400 },
      );
    }

    const newSubAdmin = await SubAdmin.create({
      name,
      email,
      phoneNumber,
      hubName,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Sub admin created successfully",
      data: newSubAdmin,
    });
  } catch (error) {
    console.error("SUB_ADMIN_POST_ERROR:", error);
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

    await connectToDatabase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { hubName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [subAdmins, total] = await Promise.all([
      SubAdmin.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SubAdmin.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: subAdmins,
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
    console.error("SUB_ADMIN_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching sub admins." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required." },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updated = await SubAdmin.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Sub admin not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("SUB_ADMIN_PATCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
