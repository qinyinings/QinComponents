import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type {
  VirtualListConfig,
  VirtualRange,
  VirtualItemPosition,
  VirtualScrollState,
  VirtualScrollCallback,
} from '../../../../types/common';
import { createItemStyle } from '../utils/virtualUtils';

interface UseVirtualListProps<T = any> {
  /**
   * 数据列表
   */
  items: T[];
  
  /**
   * 虚拟滚动配置
   */
  config?: VirtualListConfig;
  
  /**
   * 滚动回调
   */
  onScroll?: VirtualScrollCallback;
  
  /**
   * 滚动开始回调
   */
  onScrollStart?: () => void;
  
  /**
   * 滚动结束回调
   */
  onScrollEnd?: () => void;
}

interface UseVirtualListReturn<T = any> {
  /**
   * 当前滚动状态
   */
  scrollState: VirtualScrollState;
  
  /**
   * 可视区域内的项目
   */
  visibleItems: Array<{
    index: number;
    data: T;
    style: React.CSSProperties;
    isVisible: boolean;
  }>;
  
  /**
   * 容器引用
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  
  /**
   * 滚动到指定索引
   */
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  
  /**
   * 滚动到指定位置
   */
  scrollToOffset: (offset: number) => void;
  
  /**
   * 获取项目位置信息
   */
  getItemPosition: (index: number) => VirtualItemPosition | null;
  
  /**
   * 更新项目高度（用于动态高度）
   */
  updateItemHeight: (index: number, height: number) => void;
  
  /**
   * 重新计算所有项目位置
   */
  recalculate: () => void;
}

const DEFAULT_CONFIG: Required<VirtualListConfig> = {
  itemHeight: 50,
  overscan: 5,
  enabled: true,
  height: 400,
  width: '100%',
  horizontal: false,
  scrollThreshold: 1,
  smoothScroll: true,
  estimatedItemHeight: 50,
};

export const useVirtualList = <T = any>({
  items,
  config = {},
  onScroll,
  onScrollStart,
  onScrollEnd,
}: UseVirtualListProps<T>): UseVirtualListReturn<T> => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTopRef = useRef(0);
  const itemHeightsRef = useRef<Map<number, number>>(new Map());
  const itemPositionsRef = useRef<VirtualItemPosition[]>([]);
  
  // 合并配置
  const mergedConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
  }), [config]);
  
  // 滚动状态
  const [scrollState, setScrollState] = useState<VirtualScrollState>(() => ({
    scrollTop: 0,
    scrollDirection: null,
    isScrolling: false,
    containerHeight: typeof mergedConfig.height === 'number' ? mergedConfig.height : 400,
    totalHeight: 0,
    range: {
      startIndex: 0,
      endIndex: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
    },
    itemPositions: [],
  }));
  
  // 计算项目高度
  const getItemHeight = useCallback((index: number): number => {
    const cachedHeight = itemHeightsRef.current.get(index);
    if (cachedHeight !== undefined) {
      return cachedHeight;
    }
    
    if (typeof mergedConfig.itemHeight === 'function') {
      return mergedConfig.itemHeight(index, items[index]);
    }
    
    return mergedConfig.itemHeight;
  }, [mergedConfig.itemHeight, items]);
  
  // 计算所有项目位置
  const calculateItemPositions = useCallback((): VirtualItemPosition[] => {
    const positions: VirtualItemPosition[] = [];
    let top = 0;
    
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      positions.push({
        index: i,
        height,
        top,
        bottom: top + height,
      });
      top += height;
    }
    
    return positions;
  }, [items.length, getItemHeight]);
  
  // 计算可视范围
  const calculateRange = useCallback((
    scrollTop: number,
    containerHeight: number,
    itemPositions: VirtualItemPosition[]
  ): VirtualRange => {
    if (!mergedConfig.enabled || itemPositions.length === 0) {
      return {
        startIndex: 0,
        endIndex: items.length - 1,
        visibleStartIndex: 0,
        visibleEndIndex: items.length - 1,
      };
    }
    
    const scrollBottom = scrollTop + containerHeight;
    
    // 二分查找可视区域的开始和结束索引
    let visibleStartIndex = 0;
    let visibleEndIndex = itemPositions.length - 1;
    
    // 查找第一个底部位置大于scrollTop的项目
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i].bottom > scrollTop) {
        visibleStartIndex = i;
        break;
      }
    }
    
    // 查找最后一个顶部位置小于scrollBottom的项目
    for (let i = itemPositions.length - 1; i >= 0; i--) {
      if (itemPositions[i].top < scrollBottom) {
        visibleEndIndex = i;
        break;
      }
    }
    
    // 确保索引在有效范围内
    visibleStartIndex = Math.max(0, Math.min(visibleStartIndex, itemPositions.length - 1));
    visibleEndIndex = Math.max(0, Math.min(visibleEndIndex, itemPositions.length - 1));
    
    // 确保startIndex <= endIndex
    if (visibleStartIndex > visibleEndIndex) {
      visibleEndIndex = visibleStartIndex;
    }
    
    // 添加缓冲区，快速滚动时增加额外缓冲
    const isScrolling = isScrollingRef.current;
    const extraOverscan = isScrolling ? Math.floor(mergedConfig.overscan * 1.5) : 0;
    const totalOverscan = mergedConfig.overscan + extraOverscan;
    
    const startIndex = Math.max(0, visibleStartIndex - totalOverscan);
    const endIndex = Math.min(itemPositions.length - 1, visibleEndIndex + totalOverscan);
    
    return {
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex,
    };
  }, [mergedConfig.enabled, mergedConfig.overscan, items.length]);
  
  // 更新滚动状态
  const updateScrollState = useCallback((scrollOffset: number) => {
    // 防护：确保scrollOffset是有效数值
    if (typeof scrollOffset !== 'number' || isNaN(scrollOffset) || scrollOffset < 0) {
      console.warn('Invalid scroll offset:', scrollOffset);
      return;
    }
    
    const containerSize = mergedConfig.horizontal
      ? (typeof mergedConfig.width === 'number' 
          ? mergedConfig.width 
          : containerRef.current?.clientWidth || 800)
      : (typeof mergedConfig.height === 'number' 
          ? mergedConfig.height 
          : containerRef.current?.clientHeight || 400);
    
    const itemPositions = calculateItemPositions();
    const totalHeight = itemPositions.length > 0 
      ? itemPositions[itemPositions.length - 1].bottom 
      : 0;
    
    // 防护：确保scrollOffset不超过最大滚动范围
    const maxScroll = Math.max(0, totalHeight - containerSize);
    const clampedScrollOffset = Math.min(scrollOffset, maxScroll);
    
    const range = calculateRange(clampedScrollOffset, containerSize, itemPositions);
    
    const scrollDirection = clampedScrollOffset > lastScrollTopRef.current 
      ? (mergedConfig.horizontal ? 'down' : 'down') // 保持一致的方向命名
      : clampedScrollOffset < lastScrollTopRef.current 
      ? (mergedConfig.horizontal ? 'up' : 'up') 
      : null;
    
    lastScrollTopRef.current = clampedScrollOffset;
    itemPositionsRef.current = itemPositions;
    
    const newState: VirtualScrollState = {
      scrollTop: clampedScrollOffset, // 在水平模式下这实际上是scrollLeft
      scrollDirection,
      isScrolling: isScrollingRef.current,
      containerHeight: containerSize,
      totalHeight,
      range,
      itemPositions,
    };
    
    setScrollState(newState);
    onScroll?.(newState);
  }, [mergedConfig.height, mergedConfig.width, mergedConfig.horizontal, calculateItemPositions, calculateRange, onScroll]);
  
  // 用于存储最新的滚动位置
  const latestScrollOffsetRef = useRef(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 创建更安全的节流更新函数
  const throttledUpdateScrollState = useCallback((scrollOffset: number) => {
    latestScrollOffsetRef.current = scrollOffset;
    
    if (updateTimeoutRef.current) {
      return; // 如果已有更新在等待，只更新最新位置
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateScrollState(latestScrollOffsetRef.current);
      updateTimeoutRef.current = null;
    }, 16); // 约60fps
  }, [updateScrollState]);
  
  // 滚动事件处理
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    const scrollOffset = mergedConfig.horizontal ? target.scrollLeft : target.scrollTop;
    
    if (Math.abs(scrollOffset - lastScrollTopRef.current) < mergedConfig.scrollThreshold) {
      return;
    }
    
    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      onScrollStart?.();
    }
    
    // 使用改进的节流版本
    throttledUpdateScrollState(scrollOffset);
    
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // 设置滚动结束定时器
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      // 滚动结束时确保使用最新的滚动位置
      const finalScrollOffset = mergedConfig.horizontal 
        ? target.scrollLeft 
        : target.scrollTop;
      updateScrollState(finalScrollOffset);
      onScrollEnd?.();
    }, 150);
  }, [mergedConfig.scrollThreshold, mergedConfig.horizontal, throttledUpdateScrollState, updateScrollState, onScrollStart, onScrollEnd]);
  
  // 滚动到指定索引
  const scrollToIndex = useCallback((
    index: number, 
    align: 'start' | 'center' | 'end' | 'auto' = 'auto'
  ) => {
    if (!containerRef.current || index < 0 || index >= items.length) {
      return;
    }
    
    const itemPositions = itemPositionsRef.current;
    if (itemPositions.length === 0) {
      return;
    }
    
    const item = itemPositions[index];
    const containerSize = mergedConfig.horizontal 
      ? containerRef.current.clientWidth 
      : containerRef.current.clientHeight;
    const currentScroll = mergedConfig.horizontal 
      ? containerRef.current.scrollLeft 
      : containerRef.current.scrollTop;
    
    let targetScroll = item.top;
    
    switch (align) {
      case 'center':
        targetScroll = item.top - (containerSize - item.height) / 2;
        break;
      case 'end':
        targetScroll = item.bottom - containerSize;
        break;
      case 'auto':
        // 如果项目已经完全可见，不需要滚动
        if (item.top >= currentScroll && item.bottom <= currentScroll + containerSize) {
          return;
        }
        // 如果项目在上方/左方，滚动到顶部/左侧
        if (item.top < currentScroll) {
          targetScroll = item.top;
        }
        // 如果项目在下方/右方，滚动到底部/右侧
        else if (item.bottom > currentScroll + containerSize) {
          targetScroll = item.bottom - containerSize;
        }
        break;
      default:
        targetScroll = item.top;
    }
    
    const maxScroll = Math.max(0, 
      itemPositions[itemPositions.length - 1].bottom - containerSize);
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    
    if (mergedConfig.smoothScroll) {
      const scrollOptions: ScrollToOptions = { behavior: 'smooth' };
      if (mergedConfig.horizontal) {
        scrollOptions.left = targetScroll;
      } else {
        scrollOptions.top = targetScroll;
      }
      containerRef.current.scrollTo(scrollOptions);
    } else {
      if (mergedConfig.horizontal) {
        containerRef.current.scrollLeft = targetScroll;
      } else {
        containerRef.current.scrollTop = targetScroll;
      }
    }
  }, [items.length, mergedConfig.smoothScroll, mergedConfig.horizontal]);
  
  // 滚动到指定位置
  const scrollToOffset = useCallback((offset: number) => {
    if (!containerRef.current) {
      return;
    }
    
    const containerSize = mergedConfig.horizontal 
      ? containerRef.current.clientWidth 
      : containerRef.current.clientHeight;
    
    const maxScroll = Math.max(0, 
      (itemPositionsRef.current[itemPositionsRef.current.length - 1]?.bottom || 0) - 
      containerSize
    );
    
    const targetScroll = Math.max(0, Math.min(offset, maxScroll));
    
    if (mergedConfig.smoothScroll) {
      const scrollOptions: ScrollToOptions = { behavior: 'smooth' };
      if (mergedConfig.horizontal) {
        scrollOptions.left = targetScroll;
      } else {
        scrollOptions.top = targetScroll;
      }
      containerRef.current.scrollTo(scrollOptions);
    } else {
      if (mergedConfig.horizontal) {
        containerRef.current.scrollLeft = targetScroll;
      } else {
        containerRef.current.scrollTop = targetScroll;
      }
    }
  }, [mergedConfig.smoothScroll, mergedConfig.horizontal]);
  
  // 获取项目位置信息
  const getItemPosition = useCallback((index: number): VirtualItemPosition | null => {
    if (index < 0 || index >= itemPositionsRef.current.length) {
      return null;
    }
    return itemPositionsRef.current[index];
  }, []);
  
  // 更新项目高度
  const updateItemHeight = useCallback((index: number, height: number) => {
    if (itemHeightsRef.current.get(index) !== height) {
      itemHeightsRef.current.set(index, height);
      // 重新计算位置，使用正确的滚动位置
      const currentScroll = mergedConfig.horizontal
        ? (containerRef.current?.scrollLeft || 0)
        : (containerRef.current?.scrollTop || 0);
      updateScrollState(currentScroll);
    }
  }, [updateScrollState, mergedConfig.horizontal]);
  
  // 重新计算
  const recalculate = useCallback(() => {
    const currentScroll = mergedConfig.horizontal
      ? (containerRef.current?.scrollLeft || 0)
      : (containerRef.current?.scrollTop || 0);
    updateScrollState(currentScroll);
  }, [updateScrollState, mergedConfig.horizontal]);
  
  // 计算可视项目
  const visibleItems = useMemo(() => {
    if (!mergedConfig.enabled) {
      return items.map((data, index) => ({
        index,
        data,
        style: {
          height: getItemHeight(index),
        },
        isVisible: true,
      }));
    }
    
    // 添加安全检查
    if (!scrollState.range || !scrollState.itemPositions || scrollState.itemPositions.length === 0) {
      return [];
    }
    
    const { startIndex, endIndex, visibleStartIndex, visibleEndIndex } = scrollState.range;
    const result = [];
    
    // 确保索引范围有效
    const safeStartIndex = Math.max(0, Math.min(startIndex, items.length - 1));
    const safeEndIndex = Math.max(0, Math.min(endIndex, items.length - 1));
    
    for (let i = safeStartIndex; i <= safeEndIndex; i++) {
      if (i >= 0 && i < items.length && i < scrollState.itemPositions.length) {
        const position = scrollState.itemPositions[i];
        if (position && position.height > 0) { // 确保位置有效
          result.push({
            index: i,
            data: items[i],
            style: createItemStyle(position, mergedConfig.horizontal),
            isVisible: i >= visibleStartIndex && i <= visibleEndIndex,
          });
        }
      }
    }
    
    return result;
  }, [
    mergedConfig.enabled,
    mergedConfig.horizontal,
    items,
    scrollState.range,
    scrollState.itemPositions,
    getItemHeight,
  ]);
  
  // 监听容器大小变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(() => {
      recalculate();
    });
    
    resizeObserver.observe(container);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [recalculate]);
  
  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  // 初始化计算
  useEffect(() => {
    updateScrollState(0);
  }, [items.length, updateScrollState]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    scrollState,
    visibleItems,
    containerRef,
    scrollToIndex,
    scrollToOffset,
    getItemPosition,
    updateItemHeight,
    recalculate,
  };
};
