import { getUserAllNotes, getUserArchivedNotes } from "@/Service/NotesService";

// Exporting notes as PDFs: one note from its view dialog, or all of them in one
// file from Settings. The PDF itself is built by lib/notesPdf.jsx, which is
// only downloaded when someone exports.

const loadPdfRenderer = () => import("@/lib/notesPdf");

// The title as a file name that works on every system.
const toFileName = (title) =>
  title
    .replace(/[\\/:*?"<>|\p{Cc}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100)
    .replace(/[. ]+$/, "") || "Untitled";

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // give the download a moment to start before freeing the file
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportNotePdf = async (note) => {
  const { renderNotesPdf } = await loadPdfRenderer();
  downloadBlob(await renderNotesPdf([note]), `${toFileName(note.title)}.pdf`);
};

// Every page of a list of notes, 100 at a time (the API's maximum).
const fetchAllPages = async (fetchPage) => {
  const notes = [];
  let cursor;
  do {
    const res = await fetchPage({ limit: 100, cursor });
    if (!res.data.success) throw new Error(res.data.message);
    notes.push(...res.data.notes);
    cursor = res.data.nextCursor;
  } while (cursor);
  return notes;
};

// Downloads all the user's notes in one PDF: a cover page listing them, then
// the notes one after another, archived ones last. `owner` (the user's name) is
// shown on the cover. Resolves to how many notes were exported (nothing is
// downloaded when there are none).
export const exportAllNotesPdf = async (owner) => {
  const [notes, archived, { renderNotesPdf }] = await Promise.all([
    fetchAllPages(getUserAllNotes),
    fetchAllPages(getUserArchivedNotes),
    loadPdfRenderer(),
  ]);

  const all = [...notes, ...archived];
  if (all.length === 0) return 0;

  // today's date where the user is, e.g. 2026-10-21 (as on the cover)
  const date = new Date().toLocaleDateString("en-CA");
  downloadBlob(
    await renderNotesPdf(all, { cover: true, owner }),
    `good-notes-${date}.pdf`
  );
  return all.length;
};
