import type { Server } from "http";
import { createApp } from "./app";

const DEFAULT_PORT = Number(process.env.PORT ?? 4000);

export function startServer(port = DEFAULT_PORT): Server {
  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
