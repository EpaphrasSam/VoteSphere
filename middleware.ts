import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }: any) => {
      const isApiRoute = req.nextUrl.pathname.startsWith("/api");
      if (!token && !isApiRoute && req.nextUrl.pathname !== "/sign-in") {
        return false;
      }
      if (token && isApiRoute) {
        return true;
      }
      if (token && req.nextUrl.pathname === "/sign-in") {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-in",
  },
});
