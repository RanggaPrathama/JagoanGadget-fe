import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Smart Phone")).toBe("smart-phone");
  });
  it("strips non-alphanumeric characters", () => {
    expect(slugify("HP & Accessories!")).toBe("hp-accessories");
  });
  it("collapses repeated dashes and trims edges", () => {
    expect(slugify("  New--Arrival  ")).toBe("new-arrival");
  });
  it("keeps an already-valid slug unchanged", () => {
    expect(slugify("laptop-gaming")).toBe("laptop-gaming");
  });
});
