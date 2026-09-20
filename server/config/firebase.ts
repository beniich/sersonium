import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import fs from "fs";
import path from "path";

// Initialize server-side Firebase connection
let db: ReturnType<typeof getFirestore>;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  const configContent = fs.readFileSync(configPath, "utf-8");
  const firebaseConfig = JSON.parse(configContent);

  const app = initializeApp(firebaseConfig, "server-app");
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
  console.log("[Firebase] Server-side database connection established.");
} catch (err) {
  console.error("[Firebase] Failed to initialize server-side DB:", err);
}

export { db };
