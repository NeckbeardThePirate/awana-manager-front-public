// Simple hook to read/update URL query params in React (no router needed)
// Usage: Handles ?key=value on load, and updates URL via history API

import { useEffect, useState, useCallback } from 'react';

interface UrlParams {
  [key: string]: string;
}

export const useUrlParams = () => {
  const [params, setParams] = useState<UrlParams>({});

  // Read params from URL on mount/update
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const parsed: UrlParams = {};
    for (const [key, value] of urlParams) {
      parsed[key] = value;
    }
    setParams(parsed);
  }, []);

  // Update URL params (append/update, no page reload)
  const updateParams = useCallback((newParams: UrlParams, replace = true) => {
    const urlParams = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        urlParams.delete(key);
      } else {
        urlParams.set(key, value);
      }
    });

    const method = replace ? 'replaceState' : 'pushState';
    (window.history as any)[method]({}, '', `${window.location.pathname}?${urlParams.toString()}`);
    
    setParams(Object.fromEntries(urlParams));
  }, []);

  return { params, updateParams };
};

