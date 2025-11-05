import type { VirtualItemPosition, VirtualRange } from '../../../../types/common';

/**
 * 二分查找：找到第一个满足条件的索引
 */
export const binarySearch = (
  items: VirtualItemPosition[],
  target: number,
  compareFn: (item: VirtualItemPosition, target: number) => number
): number => {
  let left = 0;
  let right = items.length - 1;
  let result = -1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(items[mid], target);
    
    if (comparison >= 0) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  
  return result;
};

/**
 * 查找可视区域的开始索引
 */
export const findStartIndex = (
  itemPositions: VirtualItemPosition[],
  scrollTop: number
): number => {
  const index = binarySearch(
    itemPositions,
    scrollTop,
    (item, target) => item.bottom > target ? 1 : -1
  );
  return Math.max(0, index);
};

/**
 * 查找可视区域的结束索引
 */
export const findEndIndex = (
  itemPositions: VirtualItemPosition[],
  scrollBottom: number
): number => {
  let index = binarySearch(
    itemPositions,
    scrollBottom,
    (item, target) => item.top < target ? -1 : 1
  );
  
  if (index === -1) {
    index = itemPositions.length - 1;
  } else {
    index = Math.max(0, index - 1);
  }
  
  return Math.min(itemPositions.length - 1, index);
};

/**
 * 计算优化的可视范围
 */
export const calculateOptimizedRange = (
  scrollTop: number,
  containerHeight: number,
  itemPositions: VirtualItemPosition[],
  overscan: number = 5
): VirtualRange => {
  if (itemPositions.length === 0) {
    return {
      startIndex: 0,
      endIndex: 0,
      visibleStartIndex: 0,
      visibleEndIndex: 0,
    };
  }
  
  const scrollBottom = scrollTop + containerHeight;
  
  const visibleStartIndex = findStartIndex(itemPositions, scrollTop);
  const visibleEndIndex = findEndIndex(itemPositions, scrollBottom);
  
  const startIndex = Math.max(0, visibleStartIndex - overscan);
  const endIndex = Math.min(itemPositions.length - 1, visibleEndIndex + overscan);
  
  return {
    startIndex,
    endIndex,
    visibleStartIndex,
    visibleEndIndex,
  };
};

/**
 * 计算总高度
 */
export const calculateTotalHeight = (itemPositions: VirtualItemPosition[]): number => {
  if (itemPositions.length === 0) {
    return 0;
  }
  return itemPositions[itemPositions.length - 1].bottom;
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
        timeoutId = null;
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
};

/**
 * 获取元素的精确高度
 */
export const getElementHeight = (element: HTMLElement): number => {
  const rect = element.getBoundingClientRect();
  return rect.height;
};

/**
 * 检查元素是否在可视区域内
 */
export const isElementVisible = (
  elementTop: number,
  elementBottom: number,
  scrollTop: number,
  containerHeight: number
): boolean => {
  const scrollBottom = scrollTop + containerHeight;
  return elementBottom > scrollTop && elementTop < scrollBottom;
};

/**
 * 计算滚动到指定索引的目标位置
 */
export const calculateScrollToIndex = (
  index: number,
  itemPositions: VirtualItemPosition[],
  containerHeight: number,
  align: 'start' | 'center' | 'end' | 'auto' = 'auto',
  currentScrollTop: number = 0
): number => {
  if (index < 0 || index >= itemPositions.length) {
    return currentScrollTop;
  }
  
  const item = itemPositions[index];
  const totalHeight = calculateTotalHeight(itemPositions);
  const maxScrollTop = Math.max(0, totalHeight - containerHeight);
  
  let targetScrollTop = item.top;
  
  switch (align) {
    case 'center':
      targetScrollTop = item.top - (containerHeight - item.height) / 2;
      break;
    case 'end':
      targetScrollTop = item.bottom - containerHeight;
      break;
    case 'auto':
      const scrollBottom = currentScrollTop + containerHeight;
      // 如果项目已经完全可见，不需要滚动
      if (item.top >= currentScrollTop && item.bottom <= scrollBottom) {
        return currentScrollTop;
      }
      // 如果项目在上方，滚动到顶部
      if (item.top < currentScrollTop) {
        targetScrollTop = item.top;
      }
      // 如果项目在下方，滚动到底部
      else if (item.bottom > scrollBottom) {
        targetScrollTop = item.bottom - containerHeight;
      }
      break;
    default:
      targetScrollTop = item.top;
  }
  
  return Math.max(0, Math.min(targetScrollTop, maxScrollTop));
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `virtual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 深度比较两个对象是否相等
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

/**
 * 创建样式对象
 */
export const createItemStyle = (
  position: VirtualItemPosition,
  horizontal: boolean = false
): React.CSSProperties => {
  if (horizontal) {
    return {
      position: 'absolute',
      top: 0,
      left: position.top,
      width: position.height,
      height: '100%',
    };
  }
  
  return {
    position: 'absolute',
    top: position.top,
    left: 0,
    right: 0,
    height: position.height,
  };
};
