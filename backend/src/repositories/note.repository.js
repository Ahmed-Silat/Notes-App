import Note from "../models/note.model.js";
import { htmlToText } from "../utils/htmlToText.js";

export const create = (data) => Note.create(data);

export const findById = (id) => Note.findById(id);

export const findByIdAndUser = (id, userId) => Note.findOne({ _id: id, userId });

// Pinned first, then newest; _id breaks ties so the order is always the same
// and pages never overlap or skip notes. Backed by the index on the model.
const PAGE_SORT = { isPinned: -1, createdAt: -1, _id: -1 };

// Search looks at the title, the plain text of the content (not its HTML, so
// formatting and &nbsp; don't get in the way) and the tags.
const userFilter = (userId, search) =>
  search
    ? {
        userId,
        $or: [
          { title: { $regex: search } },
          { contentText: { $regex: search } },
          { tags: { $regex: search } },
        ],
      }
    : { userId };

// Notes that come after the cursor in PAGE_SORT order.
const afterCursor = ({ isPinned, createdAt, id }) => {
  const date = new Date(createdAt);
  return {
    $or: [
      { isPinned: { $lt: isPinned } },
      { isPinned, createdAt: { $lt: date } },
      { isPinned, createdAt: date, _id: { $lt: id } },
    ],
  };
};

// Fetches one extra note so the caller can tell whether another page exists.
export const findPageByUser = (userId, { search, cursor, limit }) => {
  const filter = userFilter(userId, search);

  return Note.find(cursor ? { $and: [filter, afterCursor(cursor)] } : filter)
    .sort(PAGE_SORT)
    .limit(limit + 1);
};

export const countByUser = (userId, { search } = {}) =>
  Note.countDocuments(userFilter(userId, search));

export const save = (note) => note.save();

export const deleteById = (id) => Note.deleteOne({ _id: id });

// Fills in contentText for notes saved before it existed (or written without
// the model's save hook). Safe to run on every start: only touches notes that
// are missing it. Returns how many notes were updated.
export const backfillContentText = async () => {
  const BATCH_SIZE = 500;
  let updated = 0;
  let batch = [];

  const flush = async () => {
    if (batch.length === 0) return;
    await Note.bulkWrite(batch);
    updated += batch.length;
    batch = [];
  };

  const cursor = Note.find({ contentText: { $exists: false } })
    .select("content")
    .lean()
    .cursor();

  for await (const note of cursor) {
    batch.push({
      updateOne: {
        filter: { _id: note._id },
        update: { $set: { contentText: htmlToText(note.content) } },
      },
    });
    if (batch.length === BATCH_SIZE) await flush();
  }
  await flush();

  return updated;
};
