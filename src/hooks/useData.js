import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { fail } from '../utils/alerts';


export default function useData(url, enabled = true, initial = []) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(enabled);

  const load = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    api.get(url).then((r) => setData(r.data)).catch(fail).finally(() => setLoading(false));
  }, [url, enabled]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, reload: load };
}
