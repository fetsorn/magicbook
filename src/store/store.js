/* try to keep store interactions only in this file */
import { makeURL } from "@/proxy/pure.js";
import { produce } from "solid-js/store";
import { buildRecord } from "@/proxy/impure.js";
import { selectStream } from "@/store/impure.js";
import { resolve, readSchema } from "@/proxy/record.js";
import { proxyStore, setProxyStore } from "@/proxy/store.js";
import {
  queryStore,
  setQueryStore,
  appendRecord,
  getSortedRecords,
} from "@/query/store.js";

export async function getRecord(api, record) {
  const base = getBase();

  const grain = { _: base, [base]: record };

  if (queryStore.recordMap[record] === undefined) {
    const recordNew = await buildRecord(api, queryStore.mind.mind, grain);

    setQueryStore("recordMap", { [record]: recordNew });
  }

  const recordNew = queryStore.recordMap[record];

  return recordNew;
}

/**
 * This
 * @name onRecordSave
 * @export function
 * @param {object} recordOld -
 * @param {object} recordNew -
 */
export async function onRecordSave(api, recordOld, recordNew) {
  setQueryStore("loading", true);

  const base = new URLSearchParams(queryStore.searchParams).get("_");

  await api.crud.d(queryStore.mind.mind, recordOld);

  await api.crud.u(queryStore.mind.mind, recordNew);

  const keyOld = recordOld[base];

  const keyNew = recordNew[base];

  const records = queryStore.recordSet
    .filter((r) => r !== keyOld)
    .concat([keyNew]);

  // force reload
  setQueryStore("recordSet", []);

  setQueryStore("recordMap", { [keyNew]: recordNew });

  setQueryStore(
    produce((state) => {
      state.recordSet = records;
      state.record = undefined;
    }),
  );

  setQueryStore("loading", false);
}

/**
 * This
 * @name onRecordWipe
 * @export function
 * @param {object} record -
 */
export async function onRecordWipe(api, record) {
  setQueryStore("loading", true);

  await api.crud.d(queryStore.mind.mind, record);

  const base = new URLSearchParams(queryStore.searchParams).get("_");

  const key = record[base];

  const records = queryStore.recordSet.filter((r) => r !== key);

  setQueryStore(
    produce((state) => {
      state.recordSet = records;
      state.recordMap[record] = undefined;
    }),
  );

  setQueryStore("loading", false);
}

/**
 * This
 * @name onSearch
 * @export function
 */
export async function onSearch(api) {
  setQueryStore("loading", true);

  setQueryStore("streamCounter", queryStore.streamCounter + 1);

  try {
    // if search bar can be parsed as url, clone
    const url = new URL(queryStore.searchBar);

    if (url.protocol === "http:" || url.protocol === "https:") {
      const searchString = url.hash.replace("#", "");

      // reset searchbar to avoid a loop
      // after onMindChange calls onSearch
      setQueryStore(
        produce((state) => {
          state.searchBar = "";
        }),
      );

      await onMindChange(api, "/", searchString);

      setQueryStore("loading", false);

      return undefined;
    }
  } catch (e) {
    console.log(e);
    // do nothing
  }

  const url = makeURL(
    new URLSearchParams(queryStore.searchParams),
    queryStore.mind.mind,
  );

  window.history.replaceState(null, null, url);

  // TODO: reset loading on the end of the stream
  try {
    const { abortPreviousStream, startStream } = await selectStream(
      api,
      queryStore.schema,
      queryStore.mind.mind,
      appendRecord,
      new URLSearchParams(queryStore.searchParams),
      queryStore.streamCounter,
    );

    // stop previous stream
    await queryStore.abortPreviousStream();

    setQueryStore(
      produce((state) => {
        // solid store tries to call the function, so pass a factory here
        state.abortPreviousStream = () => () => {
          return abortPreviousStream();
        };
        // erase existing records
        state.recordSet = [];
      }),
    );

    // start appending records
    await startStream();

    // TODO does it stop main?
    for (const record of queryStore.recordSet) {
      await getRecord(api, record);
    }
  } catch (e) {
    console.error(e);

    setQueryStore(
      produce((state) => {
        // erase existing records
        state.recordSet = [];
      }),
    );
  }

  const scroll = new URLSearchParams(queryStore.searchParams).get(".scroll");

  if (scroll !== null) {
    // SEC-16: null-check before calling scrollIntoView
    const element = document.getElementById(scroll);

    if (element) {
      element.scrollIntoView();
    }
  }

  setQueryStore("loading", false);
}

/**
 * This lateral jumps
 * @name leapfrog
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function leapfrog(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(
    api,
    "_",
    new URLSearchParams(queryStore.searchParams).get("_"),
  );

  await onSearch(api, "__", cognate);

  await onSearch(api, branch, value);
}

/**
 * This deep jumps
 * @name backflip
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function backflip(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", cognate);

  await onSearch(api, "__", branch);

  await onSearch(api, cognate, value);
}

/**
 * This
 * @name sidestep
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function sidestep(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", cognate);

  await onSearch(api, cognate, value);
}

/**
 * This side jumps
 * @name warp
 * @export function
 * @param {String} branch -
 * @param {String} value -
 * @param {String} cognate -
 */
export async function warp(branch, value, cognate) {
  await onSearch(api, undefined, undefined);

  await onSearch(api, "_", queryStore.schema[cognate].trunks[0]);

  await onSearch(api, "__", cognate);

  await onSearch(api, queryStore.schema[cognate].trunks[0], value);
}
