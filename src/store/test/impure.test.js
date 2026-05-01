import { describe, expect, test, vi } from "vitest";
import { selectStream } from "@/store/impure.js";
import { loadMindRecord } from "@/proxy/record.js";
import stub from "./stub.js";

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    readSchema: vi.fn(),
  };
});

vi.mock("@/proxy/record.js", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    loadMindRecord: vi.fn(),
  };
});

describe("selectStream", () => {
  test("root", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    const api = {
      selectStream: vi
        .fn()
        .mockImplementationOnce(() => ({
          done: false,
          value: {},
        }))
        .mockImplementationOnce(() => ({
          done: true,
        })),
    };

    loadMindRecord.mockReset();

    loadMindRecord.mockImplementation(() => ({}));

    const { startStream } = await selectStream(
      api,
      stub.schema,
      "root",
      appendRecord,
      new URLSearchParams(testCase.queryString),
      0,
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();
  });

  test("id", async () => {
    const testCase = stub.cases.baseValue;

    const appendRecord = vi.fn();

    const api = {
      selectStream: vi
        .fn()
        .mockImplementationOnce(() => ({
          done: false,
          value: {},
        }))
        .mockImplementationOnce(() => ({
          done: true,
        })),
    };

    loadMindRecord.mockReset();

    const { startStream } = await selectStream(
      api,
      stub.schema,
      stub.id,
      appendRecord,
      new URLSearchParams(testCase.queryString),
      0,
    );

    // mock api.selectStream to return stub.record
    // call start stream and check stub.record
    await startStream();
  });
});
