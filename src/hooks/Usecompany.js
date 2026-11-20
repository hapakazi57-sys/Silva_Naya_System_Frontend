import { useState, useEffect } from 'react';
import { api } from '../utils/api';


let cache = null;
const subs = new Set();

export const refreshCompany = () =>
  api.get('/settings').then((r) => { cache = r.data; subs.forEach((f) => f(cache)); return cache; });

export default function useCompany() {
  const [c, setC] = useState(cache);
  useEffect(() => {
    subs.add(setC);
    if (!cache) refreshCompany().catch(() => {});
    return () => { subs.delete(setC); };
  }, []);
  return c;
}