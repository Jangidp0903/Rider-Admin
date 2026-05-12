import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Admin from "@/models/Admin";
import { verifyPassword, generateAccessToken, generateRefreshToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email: rawEmail, password } = await req.json();

    if (!rawEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Sanitize input to prevent NoSQL injection
    const email = String(rawEmail);

    let user = await Admin.findOne({ email });
    let role = "admin";

    if (!user) {
      const SubAdmin = (await import("@/models/SubAdmin")).default;
      user = await SubAdmin.findOne({ email });
      role = "subadmin";
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Check if sub admin is active
    if (role === "subadmin" && user.status !== "active") {
      return NextResponse.json(
        { error: "Your account is inactive. Please contact admin." },
        { status: 403 },
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      username: (user as any).username || (user as any).name,
      role: role,
    });
    const refreshToken = generateRefreshToken({ id: user._id, role: role });

    // Store refresh token in database for revocation
    user.refreshToken = refreshToken;
    await user.save();

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 },
    );

    // Access Token Cookie (Short-lived)
    response.cookies.set({
      name: "token",
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    // Refresh Token Cookie (Long-lived)
    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 },
    );
  }
}
