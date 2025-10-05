import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { searchBooks, type BookResponse } from "../../lib/books";
import LoadingSpinner from "../common/LoadingSpinner";

type Props = {
  minChars?: number;
  debounceMs?: number;
  initialQuery?: string;
  pageSize?: number;
  onSelect?: (payload: { id?: number | null; external_id?: string; source?: string; title: string; author?: string }) => void;
};

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='120'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' alignment-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'>No Cover</text></svg>";

export default function BookSearch({ minChars = 3, debounceMs = 300, initialQuery = "", pageSize = 10, onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [page, setPage] = useState(0);
  // showingMore state removed (not needed currently)

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [highlight, setHighlight] = useState<number>(-1);

  // debounce
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, debounceMs]);

  const enabled = debounced.trim().length >= minChars;

  // Note: loosen typing here to avoid tight overloads with different library versions
  // Simple client cache (in-memory). Keyed by query string.
  const cacheRef = useRef<Map<string, BookResponse[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchResults = useCallback(async (q: string, attempts = 0): Promise<BookResponse[]> => {
    setIsFetching(true);
    setError(null);
    try {
      const items = await searchBooks(q, { limit: pageSize * (page + 1), source: "all" });
      cacheRef.current.set(q, items);
      return items;
    } catch (err) {
      if (attempts < 3) {
        // exponential backoff
        await new Promise(r => setTimeout(r, Math.min(1000 * 2 ** attempts, 10000)));
        return await fetchResults(q, attempts + 1);
      }
      setError(err as Error);
      throw err;
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    let mounted = true;
    if (!enabled) return;
    const cached = cacheRef.current.get(debounced);
    if (cached) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchResults(debounced).catch(() => {
      if (!mounted) return;
    });

    return () => { mounted = false; };
  }, [debounced, enabled, fetchResults]);

  const data = cacheRef.current.get(debounced);
  const results = useMemo(() => (data ?? []).slice(0, pageSize * (page + 1)), [data, page, pageSize]);

  // keyboard navigation
  const memoResults = useMemo(() => results, [results]);

  const handleSelectCb = useCallback((b: BookResponse) => {
    const payload = b.id ? { id: b.id, title: b.title, author: b.author } : { external_id: b.external_id, source: b.source, title: b.title, author: b.author };
    onSelect?.(payload);
  }, [onSelect]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!memoResults.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight(h => Math.min(h + 1, memoResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight(h => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        if (highlight >= 0 && highlight < memoResults.length) {
          e.preventDefault();
          handleSelectCb(memoResults[highlight]);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [memoResults, highlight, handleSelectCb]);

  useEffect(() => {
    setPage(0);
  }, [debounced]);

  // use memoized callback for selection

  return (
    <div className="w-full max-w-xl">
      <div className="relative">
        <input
          ref={inputRef}
          className="w-full border rounded px-3 py-2"
          placeholder={`Search books (min ${minChars} chars)...`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search books"
        />
        {(isLoading || isFetching) && (
          <div className="absolute right-2 top-2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {!enabled ? (
        <div className="mt-2 text-sm text-gray-500">Type at least {minChars} characters to search.</div>
      ) : error ? (
        <div className="mt-2 text-sm text-red-600">Failed to search. <button className="underline" onClick={() => fetchResults(debounced).catch(() => {})}>Try again</button></div>
      ) : results.length === 0 && debounced ? (
        <div className="mt-2 p-4 bg-gray-50 rounded text-sm text-gray-600">No results. Try different keywords or try again later.</div>
      ) : (
        <>
          <ul ref={listRef} className="mt-2 space-y-2">
            {results.map((b, idx) => (
              <li key={`${b.external_id ?? b.id}-${idx}`} className="flex items-start space-x-3 p-2 rounded hover:bg-purple-50" onClick={() => handleSelectCb(b)} role="button" tabIndex={0} aria-selected={highlight === idx}>
                <img src={b.cover_url ?? PLACEHOLDER} alt={`${b.title} cover`} className="w-12 h-16 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{b.title}</div>
                      <div className="text-xs text-gray-600">{b.author ?? "Unknown author"}</div>
                    </div>
                    <div className="text-xs">
                      <span className={`px-2 py-1 text-xs rounded ${b.source === 'openlibrary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{b.source ?? 'local'}</span>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
                    <div>{b.published_year ? `Published ${b.published_year}` : ''}</div>
                    <div className="text-xs text-gray-400">{b.read_count} reads • {b.rating_count} ratings</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {results.length >= pageSize && (
            <div className="mt-2 text-center">
                <button
                className="px-4 py-2 rounded border text-sm bg-white"
                onClick={() => {
                  setPage(p => p + 1);
                }}
              >Show more</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
