import mongoose from "mongoose";
import { htmlToText } from "../utils/htmlToText.js";
import { TITLE_COLLATION } from "../utils/noteSort.js";

// Background colors a note can have. Names, not hex values, so the frontend can
// pick a matching shade for light and dark mode (frontend/src/lib/noteColors.js).
export const NOTE_COLORS = [
  "default",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
];

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // plain text of `content` (no HTML tags or &nbsp;), kept in sync on save and
  // used for searching; not sent to the client
  contentText: {
    type: String,
    default: "",
    select: false,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  // archived notes leave the main list for the Archive page; an archived note
  // is never pinned
  isArchived: {
    type: Boolean,
    default: false,
  },
  // when the note was moved to Trash; null while it isn't in Trash. Notes
  // saved before Trash existed have no value, which `deletedAt: null` matches
  // too. MongoDB deletes trashed notes for good after TRASH_DAYS (see below).
  deletedAt: {
    type: Date,
    default: null,
  },
  // notes saved before colors existed read back as "default" too
  color: {
    type: String,
    enum: NOTE_COLORS,
    default: "default",
  },
  userId: {
    type: String,
    required: true,
  },
  // the secret part of the note's public read-only link (/s/<shareId>); only
  // set while the note is shared. Sparse, so notes without one don't clash.
  shareId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // when the title, content or tags last changed (pinning, archiving and
  // colors don't count), for the "recently edited" sort; set on save
  editedAt: {
    type: Date,
  },
});

noteSchema.pre("save", function () {
  if (this.isModified("content")) {
    this.contentText = htmlToText(this.content);
  }

  if (this.isNew) {
    this.editedAt = this.createdAt;
  } else if (["title", "content", "tags"].some((path) => this.isModified(path))) {
    this.editedAt = new Date();
  }
});

// One index per sort order (utils/noteSort.js), each matching the list filter
// (user, archived or not) and the sort, so each page is a fast index scan.
const LIST_KEYS = { userId: 1, isArchived: 1, isPinned: -1 };
noteSchema.index({ ...LIST_KEYS, createdAt: -1, _id: -1 }); // newest
noteSchema.index({ ...LIST_KEYS, createdAt: 1, _id: 1 }); // oldest
noteSchema.index({ ...LIST_KEYS, editedAt: -1, _id: -1 }); // edited
noteSchema.index(
  { ...LIST_KEYS, title: 1, _id: 1 },
  { collation: TITLE_COLLATION }
); // title
noteSchema.index({ userId: 1, isPinned: -1, deletedAt: -1, _id: -1 }); // Trash

// MongoDB removes a note TRASH_DAYS after it was moved to Trash (its
// background job runs about once a minute). Notes with deletedAt: null are
// never removed.
export const TRASH_DAYS = 30;
noteSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: TRASH_DAYS * 24 * 60 * 60 }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
