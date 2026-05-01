import { describe, expect, test } from "vitest";
import {
  enrichBranchRecords,
  extractSchemaRecords,
  schemaToBranchRecords,
  makeURL,
  pickDefaultSortBy,
  getDefaultBase,
  recordsToSchema,
} from "@/proxy/pure.js";
import stub from "./stub.js";

describe("enrichBranchRecords", () => {
  test("enriches", () => {
    const testCase = stub.cases.trunk;

    expect(
      enrichBranchRecords(testCase.schemaRecord, testCase.metaRecords),
    ).toStrictEqual(testCase.branchRecords);
  });
});

describe("extractSchemaRecords", () => {
  test("extracts", () => {
    const testCase = stub.cases.trunk;

    expect(extractSchemaRecords(testCase.branchRecords)).toStrictEqual([
      testCase.schemaRecord,
      ...testCase.metaRecords,
    ]);
  });
});

describe("schemaToBranchRecords", () => {
  test("converts", () => {
    const testCase = stub.cases.description;

    expect(schemaToBranchRecords(testCase.schema)).toStrictEqual([
      testCase.schemaRecord,
      ...testCase.metaRecords,
    ]);
  });
});

describe("makeURL", () => {
  test("sets root", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "root")).toStrictEqual(
      "#?_=a&a=1&b=2",
    );
  });

  test("sets mind", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "id")).toStrictEqual(
      "#/id?_=a&a=1&b=2",
    );
  });

  test("sets sortBy", () => {
    expect(makeURL(new URLSearchParams("_=a&a=1&b=2"), "id")).toStrictEqual(
      "#/id?_=a&a=1&b=2",
    );
  });
});

describe("getDefaultBase", () => {
  test("", () => {
    expect(getDefaultBase(stub.schema)).toBe("a");
  });
});

describe("pickDefaultSortBy", () => {
  test("", () => {
    expect(pickDefaultSortBy(stub.schema, "b")).toBe("b");
  });
});

describe("recordsToSchema", () => {
  test("converts", () => {
    const testCase = stub.cases.description;

    expect(
      recordsToSchema(testCase.schemaRecord, testCase.metaRecords),
    ).toStrictEqual(testCase.schema);
  });
});
