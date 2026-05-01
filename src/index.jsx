/* @refresh reload */
import { render } from "solid-js/web";
import crud from "@/proxy/index.js";
import { QueryContext, queryStore, setQueryStore } from "@/query/store.js";
import { ProxyContext, proxyStore, onStartup, onMindChange } from "@/proxy/store.js";
import { ApiProvider } from "./context.js";
import { polyfill } from "./polyfill.js";
import App from "./layout/layout.jsx";
import "./index.css";

polyfill();

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

export default function mindbook(provider) {
  const api = { ...provider, crud: crud(provider) };

  await onStartup(api);

  const { mind, schema, searchParams } = await onMindChange(api, history.location.pathname, history.location.search);

  setQueryStore("mind", mind);
  setQueryStore("schema", schema);
  setQueryStore("searchParams", searchParams);

  render(
    () => (
      <ApiProvider value={provider}>
        <ProxyContext.Provider value={{ store: proxyStore }}>
          <QueryContext.Provider value={{ store: queryStore }}>
            <App />
          </QueryContext.Provider>
        </ProxyContext.Provider>
      </ApiProvider>
    ),
    document.getElementById("root"),
  );
}
