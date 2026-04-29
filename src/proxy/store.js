import { createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

export const ProxyContext = createContext();

export const [proxyStore, setProxyStore] = createStore({
  abortPreviousStream: async () => {},
  mergeResult: false,
  syncError: undefined,
  streamCounter: 0,
});
