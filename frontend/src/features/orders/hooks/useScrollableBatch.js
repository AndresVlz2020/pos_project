import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/**
 * Limita la cantidad de elementos montados inicialmente en el DOM dentro de un
 * contenedor con desplazamiento interno, cargando más lotes al deslizar.
 */
export function useScrollableBatch(items = [], resetKey = "", batchSize = 10) {
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [prevBatchSize, setPrevBatchSize] = useState(batchSize);
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const scrollContainerRef = useRef(null);

  if (prevResetKey !== resetKey || prevBatchSize !== batchSize) {
    setPrevResetKey(resetKey);
    setPrevBatchSize(batchSize);
    setVisibleCount(batchSize);
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [resetKey, batchSize]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  }, [batchSize, items.length]);

  const handleScroll = useCallback(
    (e) => {
      if (!hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollTop + clientHeight >= scrollHeight - 96) {
        loadMore();
      }
    },
    [hasMore, loadMore]
  );

  return {
    scrollContainerRef,
    visibleItems,
    totalCount: items.length,
    visibleCount: visibleItems.length,
    hasMore,
    loadMore,
    handleScroll,
  };
}
