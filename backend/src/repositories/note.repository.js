import Note from "../models/note.model.js";
import { htmlToText } from "../utils/htmlToText.js";
import { NOTE_SORTS, TITLE_COLLATION } from "../utils/noteSort.js";

export const create = (data) => Note.create(data);

export const findById = (id) => Note.findById(id);

export const findByIdAndUser = (id, userId) => Note.findOne({ _id: id, userId });

// Pinned first, then the sort's field; see utils/noteSort.js.
const pageSort = (sort) => {
  const { field, order } = NOTE_SORTS[sort];
  return { isPinned: -1, [field]: order, _id: order };
};

// The user's archived or unarchived notes, optionally only those with a tag.
// Search looks at the title, the plain text of the content (not its HTML, so
// formatting and &nbsp; don't get in the way) and the tags.
const userFilter = (userId, { search, archived = false, tag }) => {
  const filter = { userId, isArchived: archived };
  // exact match on any element of the tags array
  if (tag) filter.tags = tag;

  return search
    ? {
        ...filter,
        $or: [
          { title: { $regex: search } },
          { contentText: { $regex: search } },
          { tags: { $regex: search } },
        ],
      }
    : filter;
};

// Notes that come after the cursor in pageSort(sort) order.
const afterCursor = (sort, { isPinned, value, id }) => {
  const { field, order } = NOTE_SORTS[sort];
  const after = order === 1 ? "$gt" : "$lt";
  const cursorValue = field === "title" ? value : new Date(value);

  return {
    $or: [
      { isPinned: { $lt: isPinned } },
      { isPinned, [field]: { [after]: cursorValue } },
      { isPinned, [field]: cursorValue, _id: { [after]: id } },
    ],
  };
};

// Fetches one extra note so the caller can tell whether another page exists.
export const findPageByUser = (
  userId,
  { search, archived, tag, sort, cursor, limit }
) => {
  const filter = userFilter(userId, { search, archived, tag });

  const query = Note.find(
    cursor ? { $and: [filter, afterCursor(sort, cursor)] } : filter
  )
    .sort(pageSort(sort))
    .limit(limit + 1);

  // compares titles (sorting and the cursor) ignoring case, as the index does
  return sort === "title" ? query.collation(TITLE_COLLATION) : query;
};

export const countByUser = (userId, { search, archived, tag } = {}) =>
  Note.countDocuments(userFilter(userId, { search, archived, tag }));

export const save = (note) => note.save();

export const deleteById = (id) => Note.deleteOne({ _id: id });

// Removes all of a user's notes, when their account is deleted.
export const deleteByUser = (userId) => Note.deleteMany({ userId });

// Gives notes saved before sorting existed an edit date: when they were
// created. Safe to run on every start. Returns how many notes were updated.
export const backfillEditedAt = async () => {
  const result = await Note.updateMany({ editedAt: { $exists: false } }, [
    { $set: { editedAt: "$createdAt" } },
  ]);
  return result.modifiedCount;
};

// Marks notes saved before archiving existed as not archived, so the list
// filter (an exact match, which the index can use) finds them. Safe to run on
// every start. Returns how many notes were updated.
export const backfillIsArchived = async () => {
  const result = await Note.updateMany(
    { isArchived: { $exists: false } },
    { $set: { isArchived: false } }
  );
  return result.modifiedCount;
};

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
