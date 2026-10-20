// Background colors a note can have. The names match NOTE_COLORS in
// backend/src/models/note.model.js. `surface` colors the card and the note
// dialog: a pastel in light mode; in dark mode the color mixed into the card
// color, so it stays muted and text on it readable. Both are opaque, so a
// colored dialog doesn't show the page through it.
export const NOTE_COLORS = [
  { name: "default", label: "Default", surface: "" },
  {
    name: "red",
    label: "Red",
    surface: "bg-red-100 dark:bg-[color-mix(in_oklab,var(--color-red-900)_40%,var(--card))]",
  },
  {
    name: "orange",
    label: "Orange",
    surface: "bg-orange-100 dark:bg-[color-mix(in_oklab,var(--color-orange-900)_40%,var(--card))]",
  },
  {
    name: "yellow",
    label: "Yellow",
    surface: "bg-yellow-100 dark:bg-[color-mix(in_oklab,var(--color-yellow-900)_40%,var(--card))]",
  },
  {
    name: "green",
    label: "Green",
    surface: "bg-green-100 dark:bg-[color-mix(in_oklab,var(--color-green-900)_40%,var(--card))]",
  },
  {
    name: "blue",
    label: "Blue",
    surface: "bg-blue-100 dark:bg-[color-mix(in_oklab,var(--color-blue-900)_40%,var(--card))]",
  },
  {
    name: "purple",
    label: "Purple",
    surface: "bg-purple-100 dark:bg-[color-mix(in_oklab,var(--color-purple-900)_40%,var(--card))]",
  },
];

export const NOTE_COLOR_NAMES = NOTE_COLORS.map((color) => color.name);

// Notes saved before colors existed have none; they use the default.
export const getNoteColor = (name) =>
  NOTE_COLORS.find((color) => color.name === name) ?? NOTE_COLORS[0];
