import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const DOMPurify = createDOMPurify(new JSDOM("").window);

// Removes scripts, event handlers and other unsafe HTML from a note's content.
// Same library and settings as the frontend's NoteContent, so the formatting
// the editor produces (classes, colors, checklists) is kept as it is. Notes
// are cleaned on save because shared notes are shown to other people.
export const sanitizeHtml = (html = "") => DOMPurify.sanitize(html);
