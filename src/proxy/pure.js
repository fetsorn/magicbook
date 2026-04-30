/**
 * This adds trunk field from schema record to branch records
 * @name enrichBranchRecords
 * @function
 * @param {object} schemaRecord -
 * @param {object[]} metaRecords -
 * @returns {object[]}
 */
export function enrichBranchRecords(schemaRecord, metaRecords) {
  // [[branch1, [branch2]]]
  const schemaRelations = Object.entries(schemaRecord).filter(
    ([key]) => key !== "_",
  );

  // list of unique branches in the schema
  const branches = [...new Set(schemaRelations.flat(Infinity))];

  const branchRecords = branches.reduce((withBranch, branch) => {
    // check each key of schemaRecord, if array has branch, push trunk to metaRecord.trunks
    const relationsPartial = schemaRelations.reduce(
      (withTrunk, [trunk, leaves]) => {
        // if old is array, [ ...old, new ]
        // if old is string, [ old, new ]
        // is old is undefined, [ new ]
        const trunkPartial = leaves.includes(branch) ? [trunk] : [];

        const leavesPartial = trunk === branch ? leaves : [];

        return {
          trunk: [...withTrunk.trunk, ...trunkPartial],
          leaf: [...withTrunk.leaf, ...leavesPartial],
        };
      },
      { trunk: [], leaf: [] },
    );

    const branchPartial = { _: "branch", branch };

    const metaPartial =
      metaRecords.find((record) => record.branch === branch) ?? {};

    // if branch has no trunks, it's a root
    if (relationsPartial.trunk.length === 0) {
      const rootRecord = {
        ...branchPartial,
        ...metaPartial,
        ...relationsPartial,
      };

      return [...withBranch, rootRecord];
    }

    const branchRecord = {
      ...branchPartial,
      ...metaPartial,
      ...relationsPartial,
    };

    return [...withBranch, branchRecord];
  }, []);

  return branchRecords;
}

/**
 * This extracts schema record with trunks from branch records
 * @name extractSchemaRecords
 * @function
 * @param {object} branchRecords -
 * @returns {object[]}
 */
export function extractSchemaRecords(branchRecords) {
  const records = branchRecords.reduce(
    (withBranch, branchRecord) => {
      const { trunk, leaf: omit, ...branchRecordOmitted } = branchRecord;

      const trunks = Array.isArray(trunk) ? trunk : [trunk];

      const schemaRecord = trunks
        .filter((t) => t !== undefined)
        .reduce((withTrunk, trunk) => {
          const leaves = withBranch.schemaRecord[trunk] ?? [];

          const schemaRecord = {
            ...withBranch.schemaRecord,
            [trunk]: [...new Set([branchRecord.branch, ...leaves])],
          };

          return schemaRecord;
        }, withBranch.schemaRecord);

      const metaRecords = [branchRecordOmitted, ...withBranch.metaRecords];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

/**
 * This converts schema to schema record and branch records
 * @name schemaToBranchRecords
 * @function
 * @param {object} schema -
 * @returns {object}
 */
export function schemaToBranchRecords(schema) {
  const records = Object.entries(schema).reduce(
    (withEntry, [branch, { leaves, task, cognate, description }]) => {
      const leavesPartial = withEntry.schemaRecord[branch] ?? [];

      const schemaRecord =
        leaves.length > 0
          ? {
              ...withEntry.schemaRecord,
              [branch]: [...new Set([...leaves, ...leavesPartial])],
            }
          : withEntry.schemaRecord;

      const partialEn =
        description && description.en !== undefined
          ? { description_en: description.en }
          : {};

      const partialRu =
        description && description.ru !== undefined
          ? { description_ru: description.ru }
          : {};

      const partialTask = task ? { task } : {};

      const partialCognate = cognate ? { cognate } : {};

      const metaRecords = [
        ...withEntry.metaRecords,
        {
          _: "branch",
          branch,
          ...partialTask,
          ...partialCognate,
          ...partialEn,
          ...partialRu,
        },
      ];

      return { schemaRecord, metaRecords };
    },
    { schemaRecord: { _: "_" }, metaRecords: [] },
  );

  return [records.schemaRecord, ...records.metaRecords];
}

export async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}
