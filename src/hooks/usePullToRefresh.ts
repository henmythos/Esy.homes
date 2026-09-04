import { useState, useRef, useCallback, useEffect } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // px to pull before triggering
  disabled?: boolean;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
}

/**
 * usePullToRefresh — Touch-based pull-to-refresh hook for mobile.
 *
 * Usage:
 *   const { containerProps, indicator } = usePullToRefresh({ onRefresh: async () => { ... } });
 *   return <div {...containerProps}>{indicator}{children}</div>;
 */
export function usePullToRefresh({ onRefresh, threshold = 70, disabled = false }: PullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
  });

  const startYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    const container = containerRef.current;
    if (!container) return;
    // Only start pull-to-refresh if scrolled to very top
    if (container.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || startYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - startYRef.current;
    if (delta > 0) {
      // Resist pull with ease (diminishing returns)
      const eased = Math.min(delta * 0.5, threshold * 1.5);
      setState(prev => ({ ...prev, isPulling: true, pullDistance: eased }));
      if (eased > 10) {
        e.preventDefault(); // prevent native scroll while pulling
      }
    }
  }, [disabled, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled) return;
    const { pullDistance } = state;
    startYRef.current = null;

    if (pullDistance >= threshold) {
      setState({ isPulling: false, isRefreshing: true, pullDistance: 0 });
      try {
        await onRefresh();
      } finally {
        setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
      }
    } else {
      setState({ isPulling: false, isRefreshing: false, pullDistance: 0 });
    }
  }, [disabled, state, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const indicatorProgress = Math.min(state.pullDistance / threshold, 1);

  return {
    containerRef,
    isPulling: state.isPulling,
    isRefreshing: state.isRefreshing,
    pullDistance: state.pullDistance,
    indicatorProgress,
  };
}
