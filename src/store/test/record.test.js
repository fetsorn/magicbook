import { describe, expect, test, vi } from "vitest";
import { readSchema } from "@/store/record.js";
import schemaRoot from "@/proxy/default_root_schema.json";
import stub from "./stub.js";

describe("readSchema", () => {
  test("root", async () => {
    const api = { select: () => {} };

    const schema = await readSchema(api, "root");

    expect(schema).toStrictEqual(schemaRoot);
  });

  test("id", async () => {
    const testCase = stub.cases.trunk;

    const api = {
      select: vi
        .fn()
        .mockImplementationOnce(() => [testCase.schemaRecord])
        .mockImplementationOnce(() => testCase.branchRecords),
    };

    const schema = await readSchema(api, stub.id);

    expect(api.select).toHaveBeenCalledWith(stub.id, { _: "_" });

    expect(api.select).toHaveBeenCalledWith(stub.id, { _: "branch" });

    expect(schema).toStrictEqual(testCase.schema);
  });
});
