import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
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

// matches the list sort (pinned, newest, _id) so each page is a fast index scan
noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1, _id: -1 });

const Note = mongoose.model("Note", noteSchema);

export default Note;
