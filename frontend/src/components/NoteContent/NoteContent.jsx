import { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

// open links from a note in a new tab, without giving that page access to ours
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

// The editor saves every space as &nbsp;, which stops long lines from wrapping;
// turn them back into spaces (white-space: pre-wrap keeps runs of them).
const toSafeHtml = (html) =>
  DOMPurify.sanitize((html ?? "").replaceAll("&nbsp;", " "));

// Read-only rendering of a note's rich-text (HTML) content, keeping its
// formatting: colors, lists, headings, quotes, code blocks, links, alignment.
// `compact` scales headings down for the note cards.
const NoteContent = ({ html, compact = false, className }) => {
  const safeHtml = useMemo(() => toSafeHtml(html), [html]);

  return (
    <div
      className={cn("note-content", compact && "note-content-compact", className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};

export default NoteContent;
