import { useContext } from "solid-js";
import { QueryContext, onCancel } from "@/query/store.js";
import { Confirmation } from "@/layout/components/index.js";

export function BottomLoader() {
  const { store } = useContext(QueryContext);

  return (
    <Show when={store.loading} fallback={<></>}>
      <span>Loading...</span>

      <Confirmation
        action={`cancel`}
        question={"really cancel?"}
        onAction={() => onCancel()}
      />
    </Show>
  );
}
