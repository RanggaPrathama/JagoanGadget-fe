import { describe, it, expect } from "vitest";
import { formatSegmentsPreview, sortSegmentsByIndex } from "./segments";

describe("sortSegmentsByIndex", () => {
  it("sorts unsorted segments ascending by index", () => {
    const input = [
      { prefixId: "c", index: 2 },
      { prefixId: "a", index: 0 },
      { prefixId: "b", index: 1 },
    ];
    expect(sortSegmentsByIndex(input).map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it("does not mutate the input array", () => {
    const input = [
      { prefixId: "b", index: 1 },
      { prefixId: "a", index: 0 },
    ];
    sortSegmentsByIndex(input);
    expect(input.map((s) => s.index)).toEqual([1, 0]);
  });

  it("is stable for equal indices (input order preserved)", () => {
    const first = { prefixId: "first", index: 1 };
    const second = { prefixId: "second", index: 1 };
    expect(sortSegmentsByIndex([second, first])).toEqual([second, first]);
  });

  it("returns empty array for empty input", () => {
    expect(sortSegmentsByIndex([])).toEqual([]);
  });
});

describe("formatSegmentsPreview", () => {
  it("renders sorted occupied slots as 1-based tokens", () => {
    const input = [
      { prefixId: "b", index: 2 },
      { prefixId: "a", index: 0 },
    ];
    expect(formatSegmentsPreview(input)).toBe("#1 #3");
  });

  it("returns empty string for empty input", () => {
    expect(formatSegmentsPreview([])).toBe("");
  });

  it("renders a single segment", () => {
    expect(formatSegmentsPreview([{ prefixId: "x", index: 0 }])).toBe("#1");
  });

  it("emits a token per segment even with duplicate indices", () => {
    const input = [
      { prefixId: "a", index: 1 },
      { prefixId: "b", index: 1 },
    ];
    expect(formatSegmentsPreview(input)).toBe("#2 #2");
  });
});
