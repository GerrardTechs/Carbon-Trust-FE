/**
 * useAsyncData.js
 * Hook standar untuk semua data fetching di CarbonTrust.
 * Mengelola: loading state, error state, retry, abort on unmount.
 *
 * Usage:
 *   const { data, loading, error, retry } = useAsyncData(
 *     () => apiFetch(`/parcels?companyId=${id}`),
 *     [id]            // ← dependencies, seperti useEffect
 *   );
 */
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * @template T
 * @param {() => Promise<T>} fetcher  - fungsi async yang return data
 * @param {any[]} deps                - dependency array (default: [])
 * @param {{ initialData?: T, enabled?: boolean }} options
 * @returns {{ data: T|null, loading: boolean, error: Error|null, retry: () => void }}
 */
export function useAsyncData(fetcher, deps = [], options = {}) {
  const { initialData = null, enabled = true } = options;

  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error,   setError]   = useState(null);

  // ref agar closure di useEffect selalu pakai fetcher terbaru
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetcherRef.current()
      .then(result => {
        if (!controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return controller;
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const controller = run();
    return () => controller?.abort();
  }, [run]);

  return { data, loading, error, retry: run };
}

/**
 * useAsyncAction — untuk POST/PATCH/DELETE yang dipicu oleh user action,
 * bukan saat mount.
 *
 * Usage:
 *   const { execute, loading, error, data } = useAsyncAction(
 *     (body) => apiFetch("/bids", { method: "POST", body: JSON.stringify(body) })
 *   );
 *   <button onClick={() => execute({ price: 18.5, volume: 100 })}>Submit</button>
 */
export function useAsyncAction(actionFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [data,    setData]    = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await actionFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [actionFn]);

  return { execute, loading, error, data };
}