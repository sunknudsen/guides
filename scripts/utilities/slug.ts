// Slug function. Computes the anchor GitHub gives a markdown heading: closing
// hashes, link syntax, HTML tags and backticks are dropped, the text is
// lowercased, everything but letters, digits, marks, connector punctuation
// (underscore), hyphens and spaces is removed and each space becomes a hyphen,
// matching github-slugger. GitHub also suffixes duplicates with -1, -2… which
// callers handle. scripts/preview-markdown.ts has a browser copy of the same
// rules for rendered headings.

export const slug = (heading: string): string =>
  heading
    .replace(/\s+#+\s*$/, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>|`/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd}\p{Nl}\p{M}\p{Pc} -]/gu, "")
    .replace(/ /g, "-")
