import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/axios";
import {
  createNumberFormat,
  deleteNumberFormat,
  getNumberFormatById,
  getNumberFormatsList,
  updateNumberFormat,
} from "./number_format.service";
import type { NumberFormatItem, NumberFormatPayload } from "../types";

vi.mock("@/lib/axios", () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedPut = vi.mocked(api.put);
const mockedDelete = vi.mocked(api.delete);

const samplePayload: NumberFormatPayload = {
  menuId: "menu-1",
  segments: [{ prefixId: "p-1", index: 0 }],
  isActive: true,
};

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

  it("forwards the show status filter verbatim", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: [], pagination: {} },
    } as never);

    await getNumberFormatsList({ show: "active" });

    expect(mockedGet).toHaveBeenCalledWith("admin/number-formats", {
      params: { show: "active" },
    });
  });
});

describe("getNumberFormatById", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it("fetches the detail endpoint and unwraps the envelope", async () => {
    mockedGet.mockResolvedValueOnce({
      data: { success: true, data: sampleItem },
    } as never);

    const result = await getNumberFormatById("fmt-1");

    expect(mockedGet).toHaveBeenCalledWith("admin/number-formats/fmt-1");
    expect(result).toEqual(sampleItem);
  });
});

describe("createNumberFormat", () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it("posts the payload verbatim and unwraps the created item", async () => {
    mockedPost.mockResolvedValueOnce({
      data: { success: true, data: sampleItem },
    } as never);

    const result = await createNumberFormat(samplePayload);

    expect(mockedPost).toHaveBeenCalledWith(
      "admin/number-formats",
      samplePayload,
    );
    expect(result).toEqual(sampleItem);
  });
});

describe("updateNumberFormat", () => {
  beforeEach(() => {
    mockedPut.mockReset();
  });

  it("puts the payload to the detail endpoint and unwraps the item", async () => {
    mockedPut.mockResolvedValueOnce({
      data: { success: true, data: sampleItem },
    } as never);

    const result = await updateNumberFormat("fmt-1", samplePayload);

    expect(mockedPut).toHaveBeenCalledWith(
      "admin/number-formats/fmt-1",
      samplePayload,
    );
    expect(result).toEqual(sampleItem);
  });
});

describe("deleteNumberFormat", () => {
  beforeEach(() => {
    mockedDelete.mockReset();
  });

  it("deletes the detail endpoint and unwraps the response", async () => {
    mockedDelete.mockResolvedValueOnce({
      data: { success: true, data: { success: true } },
    } as never);

    const result = await deleteNumberFormat("fmt-1");

    expect(mockedDelete).toHaveBeenCalledWith("admin/number-formats/fmt-1");
    expect(result).toEqual({ success: true });
  });
});
