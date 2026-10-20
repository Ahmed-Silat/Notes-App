/* eslint-disable react-refresh/only-export-components --
   exports a function, not components; loaded only to build PDFs, so hot reload
   doesn't matter here */
import {
  Document,
  Font,
  Link,
  Page,
  Path,
  pdf,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import interLatin400 from "@fontsource/inter/files/inter-latin-400-normal.woff?url";
import interLatin400Italic from "@fontsource/inter/files/inter-latin-400-italic.woff?url";
import interLatin700 from "@fontsource/inter/files/inter-latin-700-normal.woff?url";
import interLatin700Italic from "@fontsource/inter/files/inter-latin-700-italic.woff?url";
import interLatinExt400 from "@fontsource/inter/files/inter-latin-ext-400-normal.woff?url";
import interLatinExt400Italic from "@fontsource/inter/files/inter-latin-ext-400-italic.woff?url";
import interLatinExt700 from "@fontsource/inter/files/inter-latin-ext-700-normal.woff?url";
import interLatinExt700Italic from "@fontsource/inter/files/inter-latin-ext-700-italic.woff?url";
import { formatDate } from "@/lib/helper";
import { getNoteColor } from "@/lib/noteColors";

// Builds the exported PDFs (one note, or all of them) with react-pdf. Loaded
// only when someone exports (see lib/exportNotes.js), as react-pdf is large.

// Inter, the app's font: Latin first, then Latin Extended (ā, ł, ő, ...) for
// characters the first doesn't have.
const registerInter = (family, [regular, italic, bold, boldItalic]) =>
  Font.register({
    family,
    fonts: [
      { src: regular, fontWeight: 400 },
      { src: italic, fontWeight: 400, fontStyle: "italic" },
      { src: bold, fontWeight: 700 },
      { src: boldItalic, fontWeight: 700, fontStyle: "italic" },
    ],
  });
registerInter("Inter", [interLatin400, interLatin400Italic, interLatin700, interLatin700Italic]);
registerInter("InterExt", [
  interLatinExt400,
  interLatinExt400Italic,
  interLatinExt700,
  interLatinExt700Italic,
]);
// keep words whole instead of hyphenating them at the end of a line
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  text: "#18181b",
  muted: "#71717a",
  faint: "#a1a1aa",
  border: "#e4e4e7",
  code: "#f4f4f5",
  // a darker shade of the brand color, readable on paper
  link: "#b45309",
  brand: "#f0a726",
  brandText: "#3e2104",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: ["Inter", "InterExt"],
    fontSize: 11,
    lineHeight: 1.55,
    color: COLORS.text,
  },
  header: {
    position: "absolute",
    top: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 18,
    height: 18,
    marginRight: 7,
    borderRadius: 4,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 11, fontWeight: 700, lineHeight: 1.3 },
  headerNote: { fontSize: 9, lineHeight: 1.3, color: COLORS.muted },
  footer: {
    position: "absolute",
    // 28pt above the bottom of an A4 page (842pt tall). Positioned from the
    // top on purpose: with `bottom`, react-pdf drew it far above the page.
    top: 802,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    lineHeight: 1.3,
    color: COLORS.faint,
  },

  titleBlock: { flexDirection: "row", borderRadius: 6, marginBottom: 20 },
  // section break between two notes: a line with three dots in the middle
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 26,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  separatorDots: { flexDirection: "row", paddingHorizontal: 10 },
  separatorDot: {
    width: 4,
    height: 4,
    marginHorizontal: 3,
    borderRadius: 2,
    backgroundColor: COLORS.faint,
  },
  // "NOTE 2 OF 4" above a note's title block in a combined export
  eyebrow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  eyebrowDot: { width: 6, height: 6, marginRight: 6, borderRadius: 3 },
  eyebrowText: {
    fontSize: 8,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 1.2,
    color: COLORS.muted,
  },
  accent: { width: 4, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  titleBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 16 },
  title: { fontSize: 20, fontWeight: 700, lineHeight: 1.3 },
  details: { marginTop: 4, fontSize: 9, lineHeight: 1.4, color: COLORS.muted },
  tags: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  tag: {
    marginRight: 4,
    marginBottom: 2,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  tagText: { fontSize: 8.5, lineHeight: 1.3, color: "#3f3f46" },

  p: { marginBottom: 6 },
  heading: { fontWeight: 700, lineHeight: 1.3, marginTop: 6, marginBottom: 6 },
  h1: { fontSize: 18 },
  h2: { fontSize: 15.5 },
  h3: { fontSize: 13.5 },
  h4: { fontSize: 12 },
  h5: { fontSize: 11 },
  h6: { fontSize: 11, color: COLORS.muted },
  link: { color: COLORS.link, textDecoration: "underline" },
  list: { marginBottom: 6 },
  nestedList: { marginTop: 2 },
  listItem: { flexDirection: "row", marginBottom: 2 },
  marker: { minWidth: 16, marginRight: 4, color: COLORS.muted },
  listBody: { flex: 1 },
  checkbox: {
    width: 9,
    height: 9,
    marginTop: 4,
    marginRight: 7,
    borderWidth: 1,
    borderColor: COLORS.faint,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxTicked: { borderColor: COLORS.text, backgroundColor: COLORS.text },
  ticked: { color: COLORS.muted, textDecoration: "line-through" },
  blockquote: {
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
  },
  quoteText: { color: COLORS.muted, fontStyle: "italic" },
  pre: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 4,
    backgroundColor: COLORS.code,
  },
  code: { fontFamily: "Courier", fontSize: 9.5, lineHeight: 1.45 },

  coverTitle: { fontSize: 26, fontWeight: 700, lineHeight: 1.25, marginTop: 8 },
  coverSubtitle: { marginTop: 6, fontSize: 10, lineHeight: 1.4, color: COLORS.muted },
  stats: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, marginBottom: 28 },
  stat: {
    marginRight: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.code,
  },
  statText: { fontSize: 9, lineHeight: 1.3, color: "#3f3f46" },
  sectionLabel: {
    marginBottom: 4,
    fontSize: 8,
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: 1.2,
    color: COLORS.muted,
  },
  tocIndex: { width: 22, fontSize: 9, lineHeight: 1.4, color: COLORS.faint },
  tocRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    textDecoration: "none",
    color: COLORS.text,
  },
  tocDot: { width: 7, height: 7, marginRight: 9, borderRadius: 4 },
  tocTitle: { flex: 1, fontSize: 10.5, lineHeight: 1.4 },
  // "Pinned" / "Archived" after a title
  tocArchived: { fontSize: 9, color: COLORS.muted },
  // a fixed width, so the cover lays out the same with or without the numbers
  tocPage: {
    width: 40,
    marginLeft: 12,
    fontSize: 10,
    lineHeight: 1.4,
    textAlign: "right",
    color: COLORS.muted,
  },
});

// --- note content: the editor's HTML as react-pdf elements

const INLINE_STYLES = {
  STRONG: { fontWeight: 700 },
  B: { fontWeight: 700 },
  EM: { fontStyle: "italic" },
  I: { fontStyle: "italic" },
  U: { textDecoration: "underline" },
  S: { textDecoration: "line-through" },
  STRIKE: { textDecoration: "line-through" },
  DEL: { textDecoration: "line-through" },
  CODE: { fontFamily: "Courier", backgroundColor: COLORS.code },
  SUB: { fontSize: 8 },
  SUP: { fontSize: 8 },
};

const BLOCK_TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6",
  "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "DIV",
]);

const ALIGN_CLASSES = {
  "ql-align-center": "center",
  "ql-align-right": "right",
  "ql-align-justify": "justify",
};

// only real web, mail and phone links become clickable
const SAFE_LINK = /^(https?:|mailto:|tel:)/i;

// "rgb(230, 0, 0)" (how the browser reports the editor's colors) -> "#e60000"
const toHex = (cssColor) => {
  const match = cssColor?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match
    ? `#${match.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`
    : undefined;
};

// Alignment and indents the editor stores as classes.
const blockStyle = (element) => {
  const style = {};
  for (const className of element.classList) {
    if (ALIGN_CLASSES[className]) style.textAlign = ALIGN_CLASSES[className];
    const indent = className.match(/^ql-indent-(\d)$/);
    if (indent) style.marginLeft = Number(indent[1]) * 20;
  }
  return style;
};

const renderInline = (node, key) => {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  if (node.nodeName === "BR") return "\n";

  const children = [...node.childNodes].map(renderInline);
  const href = node.nodeName === "A" ? node.getAttribute("href") : null;
  if (href && SAFE_LINK.test(href)) {
    return (
      <Link key={key} src={href} style={styles.link}>
        {children}
      </Link>
    );
  }

  const style = { ...INLINE_STYLES[node.nodeName] };
  const color = toHex(node.style?.color);
  const background = toHex(node.style?.backgroundColor);
  if (color) style.color = color;
  if (background) style.backgroundColor = background;
  return (
    <Text key={key} style={style}>
      {children}
    </Text>
  );
};

const Checkbox = ({ ticked }) => (
  <View style={[styles.checkbox, ticked ? styles.checkboxTicked : {}]}>
    {ticked && (
      <Svg viewBox="0 0 16 16" style={{ width: 7, height: 7 }}>
        <Path
          d="M3.5 8.5l3 3 6-7"
          stroke="#ffffff"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    )}
  </View>
);

const renderListItem = (item, index, list, context) => {
  const state = item.getAttribute("data-list");
  const isTask = state === "checked" || state === "unchecked";
  const ticked = state === "checked";
  const start = Number(list?.getAttribute("start")) || 1;

  return (
    <View key={index} style={styles.listItem}>
      {isTask ? (
        <Checkbox ticked={ticked} />
      ) : (
        <Text style={styles.marker}>
          {list?.nodeName === "OL" ? `${start + index}.` : "•"}
        </Text>
      )}
      <View style={styles.listBody}>
        {renderBlocks(item, {
          ...context,
          inList: true,
          textStyle: ticked ? styles.ticked : context.textStyle,
        })}
      </View>
    </View>
  );
};

const renderBlock = (element, key, context) => {
  const inline = () => [...element.childNodes].map(renderInline);
  const textStyle = context.textStyle ?? {};

  switch (element.nodeName) {
    case "P":
      return (
        <Text
          key={key}
          style={[context.inList ? {} : styles.p, blockStyle(element), textStyle]}
        >
          {/* an empty line keeps its height */}
          {element.textContent.trim() ? inline() : " "}
        </Text>
      );
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return (
        <Text
          key={key}
          style={[styles.heading, styles[element.nodeName.toLowerCase()], blockStyle(element)]}
        >
          {inline()}
        </Text>
      );
    case "UL":
    case "OL":
      return (
        <View key={key} style={context.inList ? styles.nestedList : styles.list}>
          {[...element.children]
            .filter((child) => child.nodeName === "LI")
            .map((item, index) => renderListItem(item, index, element, context))}
        </View>
      );
    case "LI":
      return renderListItem(element, key, null, context);
    case "BLOCKQUOTE":
      return (
        <View key={key} style={styles.blockquote}>
          {renderBlocks(element, { inList: true, textStyle: styles.quoteText })}
        </View>
      );
    case "PRE":
      return (
        <View key={key} style={styles.pre}>
          <Text style={styles.code}>
            {element.textContent.replace(/^\n|\n$/g, "")}
          </Text>
        </View>
      );
    default:
      return (
        <View key={key} style={blockStyle(element)}>
          {renderBlocks(element, context)}
        </View>
      );
  }
};

// The children of `parent`: block elements as they are, and runs of inline
// content between them as one paragraph each.
const renderBlocks = (parent, context = {}) => {
  const blocks = [];
  let run = [];

  const flushRun = () => {
    if (run.some((part) => typeof part !== "string" || part.trim())) {
      blocks.push(
        <Text
          key={blocks.length}
          style={[context.inList ? {} : styles.p, context.textStyle ?? {}]}
        >
          {run}
        </Text>
      );
    }
    run = [];
  };

  for (const node of parent.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.nodeName)) {
      flushRun();
      blocks.push(renderBlock(node, blocks.length, context));
    } else {
      const part = renderInline(node, run.length);
      if (part !== null) run.push(part);
    }
  }
  flushRun();

  return blocks;
};

const isChecklist = (element) =>
  element?.nodeName === "UL" && element.querySelector(":scope > li[data-list]");

const renderContent = (html) => {
  // the editor saves every space as &nbsp;, which would stop lines wrapping
  const body = new DOMParser().parseFromString(
    (html ?? "").replaceAll("&nbsp;", " "),
    "text/html"
  ).body;

  // The editor saves each run of ticked or unticked items as its own list;
  // join neighbouring checklists so they're spaced as one list.
  for (const list of [...body.querySelectorAll("ul")].reverse()) {
    const previous = list.previousElementSibling;
    if (isChecklist(list) && isChecklist(previous)) {
      previous.append(...list.children);
      list.remove();
    }
  }

  return renderBlocks(body);
};

// --- the document

// The app's logo (lucide's "notebook-pen") on the brand color.
const LogoMark = () => (
  <View style={styles.brandMark}>
    <Svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }}>
      {[
        "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",
        "M2 6h4",
        "M2 10h4",
        "M2 14h4",
        "M2 18h4",
        "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
      ].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={COLORS.brandText}
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  </View>
);

const PageHeader = ({ exportedOn }) => (
  <View fixed style={styles.header}>
    <View style={styles.brand}>
      <LogoMark />
      <Text style={styles.brandName}>Good Notes</Text>
    </View>
    <Text style={styles.headerNote}>Exported {exportedOn}</Text>
  </View>
);

const PageFooter = () => (
  <View fixed style={styles.footer}>
    <Text>Good Notes</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

const noteDetails = (note) =>
  [
    `Created ${formatDate(note.createdAt)}`,
    note.editedAt &&
      note.editedAt !== note.createdAt &&
      `Edited ${formatDate(note.editedAt)}`,
    note.isPinned && "Pinned",
    note.isArchived && "Archived",
  ]
    .filter(Boolean)
    .join("   ·   ");

// Section break before a note that follows another one. It's its own element,
// so at a page break it stays at the bottom of the previous page and the note
// starts at the top of the next one like any other.
const NoteSeparator = () => (
  <View style={styles.separator}>
    <View style={styles.separatorLine} />
    <View style={styles.separatorDots}>
      {[0, 1, 2].map((dot) => (
        <View key={dot} style={styles.separatorDot} />
      ))}
    </View>
    <View style={styles.separatorLine} />
  </View>
);

// A note: its title block in the note's color, then its content. In a combined
// export, `position` ({ index, total }) adds a section break before every note
// but the first, and a "NOTE 2 OF 4" label above the title block.
const NoteBlock = ({ note, id, position, onPage }) => {
  const { tint, accent } = getNoteColor(note.color).pdf;

  return (
    <>
      {position?.index > 0 && <NoteSeparator />}
      <View
        id={id}
        wrap={false}
        // moves to the next page instead of ending a page without any content
        minPresenceAhead={60}
      >
        {position && (
          <View style={styles.eyebrow}>
            <View style={[styles.eyebrowDot, { backgroundColor: accent }]} />
            <Text style={styles.eyebrowText}>
              {`NOTE ${position.index + 1} OF ${position.total}`}
            </Text>
          </View>
        )}
        <View style={[styles.titleBlock, { backgroundColor: tint }]}>
          <View style={[styles.accent, { backgroundColor: accent }]} />
          <View style={styles.titleBody}>
            {/* Draws nothing; reports the page the note starts on. react-pdf
                calls it with provisional numbers while laying out, then with
                the final one, so the last call wins. */}
            <Text
              render={({ pageNumber }) => {
                onPage?.(pageNumber);
                return "";
              }}
            />
            <Text style={styles.title}>{note.title}</Text>
            <Text style={styles.details}>{noteDetails(note)}</Text>
            {note.tags?.length > 0 && (
              <View style={styles.tags}>
                {note.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      {renderContent(note.content)}
    </>
  );
};

// Pages holding `notes` one after another: each takes the space it needs and
// the next starts right after it, flowing onto as many pages as needed.
// `onNotePage(i, page)` is told which page note i starts on. With a single
// note (a one-note export) there are no section breaks or "NOTE 1 OF 1".
const NotesPages = ({ notes, exportedOn, onNotePage }) => (
  <Page size="A4" style={styles.page}>
    <PageHeader exportedOn={exportedOn} />
    <PageFooter />
    {notes.map((note, index) => (
      <NoteBlock
        key={note._id ?? index}
        note={note}
        id={`note-${index}`}
        position={notes.length > 1 ? { index, total: notes.length } : undefined}
        onPage={(page) => onNotePage?.(index, page)}
      />
    ))}
  </Page>
);

// "45 notes", "2 pinned", "1 archived" chips on the cover.
const coverStats = (notes) => {
  const count = (label, n) => n > 0 && `${n} ${label}`;
  return [
    `${notes.length} ${notes.length === 1 ? "note" : "notes"}`,
    count("pinned", notes.filter((note) => note.isPinned).length),
    count("archived", notes.filter((note) => note.isArchived).length),
  ].filter(Boolean);
};

// First page of a combined export: every note with the page it starts on,
// each linking to it. `pageNumbers[i]` is note i's page (unknown on the first
// layout pass, when the column stays empty but keeps its width).
const CoverPage = ({ notes, owner, exportedOn, pageNumbers = [] }) => (
  <Page size="A4" style={styles.page}>
    <PageHeader exportedOn={exportedOn} />
    <PageFooter />
    <Text style={styles.coverTitle}>Your notes</Text>
    <Text style={styles.coverSubtitle}>
      {[owner, `Exported ${exportedOn}`].filter(Boolean).join("   ·   ")}
    </Text>
    <View style={styles.stats}>
      {coverStats(notes).map((stat) => (
        <View key={stat} style={styles.stat}>
          <Text style={styles.statText}>{stat}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.sectionLabel}>CONTENTS</Text>
    {notes.map((note, index) => (
      <Link key={note._id ?? index} src={`#note-${index}`} style={styles.tocRow}>
        <Text style={styles.tocIndex}>{String(index + 1).padStart(2, "0")}</Text>
        <View
          style={[styles.tocDot, { backgroundColor: getNoteColor(note.color).pdf.accent }]}
        />
        <Text style={styles.tocTitle}>
          {note.title}
          {note.isPinned && <Text style={styles.tocArchived}>{"   Pinned"}</Text>}
          {note.isArchived && <Text style={styles.tocArchived}>{"   Archived"}</Text>}
        </Text>
        <Text style={styles.tocPage}>{pageNumbers[index] ?? ""}</Text>
      </Link>
    ))}
  </Page>
);

// A PDF of `notes`, one after another; with `cover`, a first page lists them
// all with their page numbers. `owner` is the user's name, shown on the cover.
export const renderNotesPdf = async (notes, { cover = false, owner } = {}) => {
  const exportedOn = formatDate(new Date());

  const notesPdf = (pageNumbers, onNotePage) =>
    pdf(
      <Document
        title={cover ? "Good Notes export" : notes[0]?.title}
        author={owner}
        creator="Good Notes"
        producer="Good Notes"
      >
        {cover && (
          <CoverPage
            notes={notes}
            owner={owner}
            exportedOn={exportedOn}
            pageNumbers={pageNumbers}
          />
        )}
        <NotesPages notes={notes} exportedOn={exportedOn} onNotePage={onNotePage} />
      </Document>
    ).toBlob();

  if (!cover) return notesPdf();

  // The cover's page numbers are only known once the notes are laid out, so
  // lay the PDF out once to find them, then again with them filled in. The
  // cover looks the same both times, so the pages don't move.
  const pageNumbers = [];
  await notesPdf([], (index, page) => {
    pageNumbers[index] = page;
  });
  return notesPdf(pageNumbers);
};
