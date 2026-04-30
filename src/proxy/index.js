import { deleteRecord, resolve } from "@/proxy/record.js";
import { setProxyStore } from "@/proxy/store.js";

async function c(api) {}

async function r(api) {}

async function u(api) {}

async function d(api, mind, record) {
  await deleteRecord(api, mind, record);

  try {
    const syncResult = await resolve(api, mind);

    setProxyStore(
      produce((state) => {
        state.mergeResult = syncResult.ok;
        state.syncError = undefined;
      }),
    );
  } catch (e) {
    // sync is best-effort after local delete — surface but don't fail
    console.error("sync after delete failed:", e);
    setProxyStore("syncError", e?.message ?? String(e));
  }
}

export default (provider) => {
  return {
    c: async () => c(provider),
    r: async () => r(provider),
    u: async () => u(provider),
    d: async (mind, record) => d(provider, mind, record),
  };
};
