export function GET() {
  return Response.json({ status: "ok", service: "sotahub-web", timestamp: new Date().toISOString() });
}
