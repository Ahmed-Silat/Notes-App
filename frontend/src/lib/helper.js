export const getInitials = (name) => {
  if (!name) {
    return "";
  }

  const words = name.trim().split(/\s+/);

  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (date) => (date ? dateFormatter.format(new Date(date)) : "");

// Plain-text version of the rich-text (HTML) note content, keeping line breaks.
export const htmlToText = (html) => {
  if (!html) {
    return "";
  }

  const withBreaks = html.replace(
    /<\/(p|div|h[1-6]|li|blockquote|pre)>|<br\s*\/?>/gi,
    "$&\n"
  );
  const text = new DOMParser().parseFromString(withBreaks, "text/html").body
    .textContent;

  return text.replace(/\n{3,}/g, "\n\n").trim();
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
