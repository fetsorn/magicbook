import { describe, expect, test } from "vitest";
import {
  enrichBranchRecords,
  extractSchemaRecords,
  schemaToBranchRecords,
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
