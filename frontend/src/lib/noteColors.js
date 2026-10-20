// Background colors a note can have. The names match NOTE_COLORS in
// backend/src/models/note.model.js. `surface` colors the card and the note
// dialog: a pastel in light mode; in dark mode the color mixed into the card
// color, so it stays muted and text on it readable. Both are opaque, so a
// colored dialog doesn't show the page through it. `pdf` holds the same color
// as hex values for exported PDFs (lib/notesPdf.jsx): a light tint behind the
// note's title and a stronger accent next to it.
export const NOTE_COLORS = [
  {
    name: "default",
    label: "Default",
    surface: "",
    pdf: { tint: "#f4f4f5", accent: "#d4d4d8" },
  },
  {
    name: "red",
    label: "Red",
    surface: "bg-red-100 dark:bg-[color-mix(in_oklab,var(--color-red-900)_40%,var(--card))]",
    pdf: { tint: "#fee2e2", accent: "#ef4444" },
  },
  {
    name: "orange",
    label: "Orange",
    surface: "bg-orange-100 dark:bg-[color-mix(in_oklab,var(--color-orange-900)_40%,var(--card))]",
    pdf: { tint: "#ffedd5", accent: "#f97316" },
  },
  {
    name: "yellow",
    label: "Yellow",
    surface: "bg-yellow-100 dark:bg-[color-mix(in_oklab,var(--color-yellow-900)_40%,var(--card))]",
    pdf: { tint: "#fef9c3", accent: "#eab308" },
  },
  {
    name: "green",
    label: "Green",
    surface: "bg-green-100 dark:bg-[color-mix(in_oklab,var(--color-green-900)_40%,var(--card))]",
    pdf: { tint: "#dcfce7", accent: "#22c55e" },
  },
  {
    name: "blue",
    label: "Blue",
    surface: "bg-blue-100 dark:bg-[color-mix(in_oklab,var(--color-blue-900)_40%,var(--card))]",
    pdf: { tint: "#dbeafe", accent: "#3b82f6" },
  },
  {
    name: "purple",
    label: "Purple",
    surface: "bg-purple-100 dark:bg-[color-mix(in_oklab,var(--color-purple-900)_40%,var(--card))]",
    pdf: { tint: "#f3e8ff", accent: "#a855f7" },
  },
];

export const NOTE_COLOR_NAMES = NOTE_COLORS.map((color) => color.name);

// Notes saved before colors existed have none; they use the default.
export const getNoteColor = (name) =>
  NOTE_COLORS.find((color) => color.name === name) ?? NOTE_COLORS[0];
