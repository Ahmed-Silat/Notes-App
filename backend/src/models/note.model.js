import mongoose from "mongoose";
import { htmlToText } from "../utils/htmlToText.js";

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

noteSchema.pre("save", function () {
  if (this.isModified("content")) {
    this.contentText = htmlToText(this.content);
  }
});

// matches the list filter (user, archived or not) and sort (pinned, newest,
// _id) so each page is a fast index scan
noteSchema.index({ userId: 1, isArchived: 1, isPinned: -1, createdAt: -1, _id: -1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
