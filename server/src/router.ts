import { URL } from "url";
import { enableCORS } from "./cors.ts";
import type { Server } from "bun";
import type { ServerHandler } from "./server.ts";

export const routeRequest = (
  request: Request,
  server: Server,
  serverHandler: ServerHandler
): Response | undefined => {
  const url = new URL(request.url);

  
  if (request.method === "OPTIONS") {
    return enableCORS(new Response(null, { status: 204 }));
  }

  if (url.pathname === "/rlgl") {
    const data = {
      id: url.searchParams.get("userId") || 0,
      isSpectator: url.searchParams.get("spectator") === "true",
      isAdmin: url.searchParams.get("admin") === "true",
    };
    server.upgrade(request, {
      data: data,
    });
    return;
  }

  if (url.pathname === "/api/currentRoom") {
    return enableCORS(
      new Response(
        JSON.stringify({
          room: serverHandler.room.getType(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  }

  return enableCORS(new Response("hello world"));
};
