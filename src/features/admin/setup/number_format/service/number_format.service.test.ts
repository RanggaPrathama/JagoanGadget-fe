import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios";
import { getNumberFormatsList } from "./number_format.service";
import type { NumberFormatItem } from "../types";

vi.mock("@/lib/axios", () => ({
  api: { get: vi.fn() },
}));

const mockedGet = vi.mocked(api.get);

const sampleItem: NumberFormatItem = {
  id: "fmt-1",
  menuId: null,
  segments: [
    { prefixId: "p-2", index: 1 },
    { prefixId: "p-1", index: 0 },
  ],
  isActive: true,
};

describe("getNumberFormatsList", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("unwraps a paginated envelope into items + pagination", async () => {
    const pagination = {
      page: 1,
      limit: 25,
      totalItems: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: [sampleItem], pagination },
    } as never);

    const result = await getNumberFormatsList({ page: 1, limit: 25 });

    expect(result.items).toEqual([sampleItem]);
    expect(result.pagination).toEqual(pagination);
  });

  it("forwards search/page/limit params verbatim to the endpoint", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: [], pagination: {} },
    } as never);

    await getNumberFormatsList({ search: "abc", page: 2, limit: 10 });

    expect(mockedGet).toHaveBeenCalledWith("admin/number-formats", {
      params: { search: "abc", page: 2, limit: 10 },
    });
  });

  it("passes undefined params when called without arguments", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: [], pagination: {} },
    } as never);

    await getNumberFormatsList();

    expect(mockedGet).toHaveBeenCalledWith("admin/number-formats", {
      params: undefined,
    });
  });

  it("falls back gracefully for an array-shaped body", async () => {
    mockedGet.mockResolvedValueOnce({ data: [sampleItem] } as never);

    const result = await getNumberFormatsList();

    expect(result.items).toEqual([sampleItem]);
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("propagates request errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("network down"));

    await expect(getNumberFormatsList()).rejects.toThrow("network down");
  });
});
