import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import {
  backfillContentText,
  backfillEditedAt,
  backfillIsArchived,
} from "./src/repositories/note.repository.js";
import { ensureCredentialAccounts } from "./src/repositories/user.repository.js";

try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to mongoDB", err);
  process.exit(1);
}

// Lets users who signed up before Better Auth log in with their same password.
// Does nothing once every user is set up.
try {
  const added = await ensureCredentialAccounts();
  if (added > 0) console.log(`Prepared ${added} existing users for Better Auth`);
} catch (err) {
  console.error("Failed to prepare existing users for Better Auth", err);
}

// Gives notes saved before search used plain text their searchable copy.
// Does nothing once every note has one; a failure only affects search.
try {
  const updated = await backfillContentText();
  if (updated > 0) console.log(`Prepared ${updated} notes for search`);
} catch (err) {
  console.error("Failed to prepare notes for search", err);
}

// Notes saved before archiving existed need isArchived: false to show up in
// the notes list. Does nothing once every note has it.
try {
  const updated = await backfillIsArchived();
  if (updated > 0) console.log(`Prepared ${updated} notes for archiving`);
} catch (err) {
  console.error("Failed to prepare notes for archiving", err);
}

// Notes saved before sorting existed need an edit date for the "recently
// edited" sort. Does nothing once every note has one.
try {
  const updated = await backfillEditedAt();
  if (updated > 0) console.log(`Prepared ${updated} notes for sorting`);
} catch (err) {
  console.error("Failed to prepare notes for sorting", err);
}

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
