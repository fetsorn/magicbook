import { useContext } from "solid-js";
import { useApi } from "@/context.js";
import { QueryContext } from "@/query/store.js";
import { onMindChange } from "@/store/store.js";

export function NavigationBack() {
  const { store } = useContext(QueryContext);

  const api = useApi();

  return (
    <Show when={store.mind.mind !== "root"} fallback={<span></span>}>
      <button
        className="navigationBack"
        onClick={() => onMindChange(api, "/", "_=mind")}
      >
        back
      </button>
    </Show>
  );
}
