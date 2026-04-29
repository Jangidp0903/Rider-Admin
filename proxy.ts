import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function proxy(request: NextRequest) {
  // Handle CORS for /api routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    const response =
      request.method === "OPTIONS"
        ? new NextResponse(null, { status: 204 })
        : NextResponse.next();

    // Allow your frontend origin
    response.headers.set(
      "Access-Control-Allow-Origin",
      "https://ev-bikerentals.vercel.app",
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    // If it's an OPTIONS request, return immediately
    if (request.method === "OPTIONS") {
      return response;
    }

    // For other methods, continue to the route handler
    const res = await (async () => {
      // Normal middleware logic for other routes (if any)
      return response;
    })();

    return res;
  }

  const token = request.cookies.get("token")?.value;

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      // Access token expired or invalid, check for refresh token
      // Note: Full auto-refresh in middleware is complex due to DB access needs.
      // For this project, we'll redirect to login if access token fails.
      // A more robust implementation would involve a client-side interceptor calling /api/auth/refresh.
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (request.nextUrl.pathname === "/login" && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } catch {
      // Invalid token, ignore and let them access login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
