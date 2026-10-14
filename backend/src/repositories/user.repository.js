import mongoose from "mongoose";

// Better Auth keeps a user's password in a separate "credential" account
// record. Users who signed up before Better Auth only have the bcrypt hash on
// their user record, so give each of them that account (same hash, so the same
// password keeps working). Only ever adds data, and only for users that need
// it, so it is safe to run on every start. Returns how many were added.
export const ensureCredentialAccounts = async () => {
  const db = mongoose.connection.db;
  const users = db.collection("users");
  const accounts = db.collection("account");

  const withAccount = await accounts.distinct("userId", { providerId: "credential" });
  const missing = await users
    .find(
      { password: { $type: "string" }, _id: { $nin: withAccount } },
      { projection: { password: 1, createdAt: 1 } }
    )
    .toArray();

  if (missing.length > 0) {
    const now = new Date();
    await accounts.insertMany(
      missing.map((user) => ({
        accountId: user._id.toHexString(),
        providerId: "credential",
        userId: user._id,
        password: user.password,
        createdAt: user.createdAt ?? now,
        updatedAt: now,
      }))
    );
  }

  // fields Better Auth expects on every user record
  await users.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: false } }
  );
  await users.updateMany({ updatedAt: { $exists: false } }, [
    { $set: { updatedAt: { $ifNull: ["$createdAt", "$$NOW"] } } },
  ]);

  return missing.length;
};
