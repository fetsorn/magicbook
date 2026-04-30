import { recordsToSchema } from "@/query/pure.js";
import schemaRoot from "@/proxy/default_root_schema.json";

/**
 * This
 * @name readSchema
 * @export function
 * @param {String} mind -
 * @returns {object}
 */
export async function readSchema(api, mind) {
  if (mind === "root") {
    return schemaRoot;
  }

  const [schemaRecord] = await api.select(mind, { _: "_" });

  const branchRecords = await api.select(mind, { _: "branch" });

  const schema = recordsToSchema(schemaRecord, branchRecords);

  return schema;
}
