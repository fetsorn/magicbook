import {
  enrichBranchRecords,
  schemaToBranchRecords,
  digestMessage,
} from "@/proxy/pure.js";
import { newUUID } from "@/proxy/record.js";
import { saveMindRecord, updateMind } from "@/proxy/record.js";

/**
 * This
 * @name find
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @returns {object}
 */
export async function find(api, mind, name) {
  if (mind === "root")
    return {
      mind: { _: "mind", mind: "root", name: "minds" },
    };

  const mindPartial = mind !== undefined ? { mind: mind } : {};

  const namePartial = name !== undefined ? { name } : {};

  const query = {
    _: "mind",
    ...mindPartial,
    ...namePartial,
  };

  // find mind in root folder
  const [mindRecord] = await api.select("root", query);

  if (mindRecord === undefined) throw Error("where is my mind");

  return { mind: mindRecord };
}

async function findMind(api, mind) {
  const query = {
    _: "mind",
    mind,
  };

  // find mind in root folder
  const mindRecords = await api.select("root", query);

  return mindRecords !== undefined && mindRecords.length > 0;
}

/**
 * This
 * @name clone
 * @function
 * @param {String} mind -
 * @param {String} name -
 * @param {String} url -
 * @param {String} token -
 * @returns {object}
 */
export async function clone(api, url, token) {
  // if uri specifies a remote
  // try to clone remote
  // where mind string is a digest of remote
  // and mind name is uri-encoded remote
  const mindRemote = await digestMessage(url);

  await api.clone(mindRemote, { url, token });

  // TODO validate and sanitize cloned dataset, get uuid

  const pathname = new URL(url).pathname;

  // get mind name from remote
  const nameClone = pathname.substring(pathname.lastIndexOf("/") + 1);

  const [schemaRecordClone] = await api.select(mindRemote, { _: "_" });

  const metaRecordsClone = await api.select(mindRemote, { _: "branch" });

  const branchRecordsClone = enrichBranchRecords(
    schemaRecordClone,
    metaRecordsClone,
  );

  // if repo has no uuid, create new mind
  const mind = await newUUID();

  // search root for mind
  const mindExists = await findMind(api, mind);

  const recordClone = {
    _: "mind",
    mind: mind,
    name: nameClone,
    branch: branchRecordsClone,
    origin_url: {
      _: "origin_url",
      origin_url: url,
      origin_token: token,
    },
  };

  // if there is no such mind
  if (mindExists === false) {
    // clone mindRemote to mind and write to root
    await api.rename(mind, mindRemote);

    await updateMind(api, recordClone);

    await saveMindRecord(api, recordClone);
  } else {
    // TODO if there is such remote, do nothing
    // TODO if this is a new remote, ask user
    // TODO if user rejects, do nothing
    // TODO if user approves write new remote to mind
  }

  // TODO remove mindRemote

  return { mind: recordClone };
}
