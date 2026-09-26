export type PageItem =
  { type: "page"; page: number } | { type: "gap"; after: number };

/** Pages to display around the current one, with gaps ("…") in between. */
export function pageItems(page: number, totalPages: number): PageItem[] {
  const pages = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  return pages.flatMap((p, index): PageItem[] => {
    const previous = pages[index - 1];
    return previous !== undefined && p - previous > 1
      ? [
          { type: "gap", after: previous },
          { type: "page", page: p },
        ]
      : [{ type: "page", page: p }];
  });
}
