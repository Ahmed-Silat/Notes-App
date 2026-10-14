const NAMED_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const decodeEntities = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] !== "#") return NAMED_ENTITIES[entity.toLowerCase()] ?? match;

    const code =
      entity[1].toLowerCase() === "x"
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
    try {
      return String.fromCodePoint(code);
    } catch {
      return match;
    }
  });

// Plain text of a note's rich-text HTML, used for searching: tags removed,
// entities like &nbsp; (which the editor uses for spaces) decoded, and all
// whitespace collapsed to single spaces.
export const htmlToText = (html = "") =>
  decodeEntities(
    html
      // keep words from neighbouring blocks apart ("<p>a</p><p>b</p>" -> "a b")
      .replace(/<br\s*\/?>|<\/(p|div|h[1-6]|li|blockquote|pre)>/gi, " ")
      .replace(/<[^>]*>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();
