import { describe, expect, it } from "vitest";
import { pageItems } from "./pagination.ts";

const labels = (page: number, total: number) =>
  pageItems(page, total).map((item) => (item.type === "gap" ? "…" : item.page));

describe("pageItems", () => {
  it("lists every page when there are few", () => {
    expect(labels(2, 3)).toEqual([1, 2, 3]);
  });

  it("keeps the ends and the neighbours of the current page", () => {
    expect(labels(10, 47)).toEqual([1, "…", 9, 10, 11, "…", 47]);
  });

  it("does not add a gap next to the first and last pages", () => {
    expect(labels(1, 47)).toEqual([1, 2, "…", 47]);
    expect(labels(46, 47)).toEqual([1, "…", 45, 46, 47]);
  });
});
