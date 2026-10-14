import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import { backfillContentText } from "./src/repositories/note.repository.js";

try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to mongoDB", err);
  process.exit(1);
}

// Gives notes saved before search used plain text their searchable copy.
// Does nothing once every note has one; a failure only affects search.
try {
  const updated = await backfillContentText();
  if (updated > 0) console.log(`Prepared ${updated} notes for search`);
} catch (err) {
  console.error("Failed to prepare notes for search", err);
}

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
