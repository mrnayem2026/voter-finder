import { config } from "./config/index.js";
import app from "./app.js";

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════╗
  ║   🗳️  Voter Management System - Backend API      ║
  ║                                                  ║
  ║   🚀 Server running on port ${String(PORT).padEnd(5)}                ║
  ║   📡 API: http://localhost:${String(PORT).padEnd(5)}                 ║
  ║   🏥 Health: http://localhost:${String(PORT).padEnd(5)}/api/health   ║
  ╚══════════════════════════════════════════════════╝
  `);
});
