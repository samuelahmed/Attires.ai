import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhooks/clerk/user", "/api/webhooks/stripe"],
  ignoredRoutes: ["/api/webhooks/clerk/user", "/api/webhooks/stripe"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
