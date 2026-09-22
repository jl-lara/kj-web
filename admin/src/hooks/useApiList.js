import { useCallback, useEffect, useState } from 'react';

export function useApiList(fetcher) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setItems(res.data ?? []);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, setItems, meta, loading, error, reload: load };
}
