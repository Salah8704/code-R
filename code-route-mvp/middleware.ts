import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/quiz/:path*",
    "/exam/:path*",
    "/traps/:path*",
    "/readiness/:path*",
    "/booking/:path*",
    "/admin/:path*",
    "/api/quiz/:path*",
    "/api/exam/:path*",
    "/api/traps/:path*",
    "/api/readiness/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
    "/api/checkout/:path*",
  ],
};
