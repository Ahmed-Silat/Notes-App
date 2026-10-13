import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";

try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to mongoDB", err);
  process.exit(1);
}

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
