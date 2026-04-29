import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

export const StoreContext = createContext();

export const [queryStore, setQueryStore] = createStore({
  searchParams: "_=mind", // sets the state of search bar
  schema: {}, // TODO set schemaRoot somehow
  record: undefined,
  recordSet: [],
  recordMap: {},
  spoilerMap: {},
  loading: false,
  searchBar: "", // remembers the last state of search bar
});

/**
 * This
 * @name getSpoilerOpen
 * @param {String} index -
 * @export function
 */
export function getSpoilerOpen(index) {
  return queryStore.spoilerMap[index];
}

/**
 * This
 * @name setSpoilerOpen
 * @param {String} index -
 * @param {boolean} isOpen -
 * @export function
 */
export function setSpoilerOpen(index, isOpen) {
  setQueryStore("spoilerMap", { [index]: isOpen });
}

/**
 * This
 * @name onRecordEdit
 * @export function
 * @param {String[]} path -
 * @param {String} value -
 */
export function onRecordEdit(path, value) {
  setQueryStore(...path, value);
}

export async function onSort(field, value) {
  updateSearchParams(field, value);

  setQueryStore(
    produce((state) => {
      state.recordSet = getSortedRecords();
    }),
  );
}

export function getBase() {
  return new URLSearchParams(queryStore.searchParams).get("_");
}
