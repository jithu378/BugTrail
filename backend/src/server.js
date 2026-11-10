import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`BugTrail API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received. Closing server...`);

    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Failed to start BugTrail API:', error);
  process.exit(1);
});
