// Auth middleware — no-op in local mode (auth is handled client-side)
export function createAuthMiddleware() {
  return async (ctx: any, next: () => Promise<void>) => {
    await next();
  };
}
