import { app, env } from "./app";
import { initDb } from "./db/sqlite";
import { seed } from "./db/seed";

async function start() {
  initDb();
  await seed();

  const port = env.port;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

void start();
