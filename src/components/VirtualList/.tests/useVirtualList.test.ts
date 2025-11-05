import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualList } from '../src/hooks/useVirtualList';
import type { VirtualListConfig } from '../../../types/common';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

// Mock DOM methods
const mockGetBoundingClientRect = vi.fn(() => ({
  width: 800,
  height: 400,
  top: 0,
  left: 0,
  bottom: 400,
  right: 800,
}));

const mockScrollTo = vi.fn();

// 创建测试数据
const createTestItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    value: i * 10,
  }));
};

describe('useVirtualList', () => {
  const testItems = createTestItems(100);
  
  const mockConfig: VirtualListConfig = {
    height: 400,
    itemHeight: 50,
    overscan: 5,
  };

  const mockCallbacks = {
    onScroll: vi.fn(),
    onScrollStart: vi.fn(),
    onScrollEnd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DOM element methods
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    Element.prototype.scrollTo = mockScrollTo;
    
    Object.defineProperty(Element.prototype, 'scrollTop', {
      get: vi.fn(() => 0),
      set: vi.fn(),
      configurable: true,
    });
    
    Object.defineProperty(Element.prototype, 'clientHeight', {
      get: vi.fn(() => 400),
      configurable: true,
    });
    
    Object.defineProperty(Element.prototype, 'scrollHeight', {
      get: vi.fn(() => 5000),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('基础功能测试', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      expect(result.current.scrollState).toBeDefined();
      expect(result.current.visibleItems).toBeDefined();
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.scrollToIndex).toBeInstanceOf(Function);
      expect(result.current.scrollToOffset).toBeInstanceOf(Function);
      expect(result.current.getItemPosition).toBeInstanceOf(Function);
      expect(result.current.updateItemHeight).toBeInstanceOf(Function);
      expect(result.current.recalculate).toBeInstanceOf(Function);
    });

    it('应该计算正确的可视项目', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const { visibleItems } = result.current;
      
      // 应该有可视项目
      expect(visibleItems.length).toBeGreaterThan(0);
      
      // 每个可视项目应该有正确的结构
      visibleItems.forEach((item, index) => {
        expect(item).toHaveProperty('index');
        expect(item).toHaveProperty('data');
        expect(item).toHaveProperty('style');
        expect(item).toHaveProperty('isVisible');
        expect(typeof item.index).toBe('number');
        expect(item.data).toBeDefined();
        expect(typeof item.style).toBe('object');
        expect(typeof item.isVisible).toBe('boolean');
      });
    });

    it('应该计算正确的滚动状态', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const { scrollState } = result.current;
      
      expect(scrollState.scrollTop).toBe(0);
      expect(scrollState.scrollDirection).toBeNull();
      expect(scrollState.isScrolling).toBe(false);
      expect(scrollState.containerHeight).toBe(400);
      expect(scrollState.totalHeight).toBeGreaterThan(0);
      expect(scrollState.range).toBeDefined();
      expect(scrollState.itemPositions).toBeDefined();
    });
  });

  describe('配置选项测试', () => {
    it('应该使用默认配置', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
        })
      );

      // 应该使用默认配置值
      expect(result.current.scrollState.containerHeight).toBe(400);
    });

    it('应该支持自定义高度', () => {
      const customConfig = { ...mockConfig, height: 600 };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: customConfig,
        })
      );

      expect(result.current.scrollState.containerHeight).toBe(600);
    });

    it('应该支持自定义项目高度', () => {
      const customConfig = { ...mockConfig, itemHeight: 80 };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: customConfig,
        })
      );

      const { itemPositions } = result.current.scrollState;
      
      // 检查项目高度是否正确
      if (itemPositions.length > 0) {
        expect(itemPositions[0].height).toBe(80);
      }
    });

    it('应该支持函数形式的项目高度', () => {
      const dynamicHeight = (index: number) => index % 2 === 0 ? 60 : 80;
      const customConfig = { ...mockConfig, itemHeight: dynamicHeight };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: customConfig,
        })
      );

      const { itemPositions } = result.current.scrollState;
      
      // 检查动态高度是否正确应用
      if (itemPositions.length > 1) {
        expect(itemPositions[0].height).toBe(60); // 偶数索引
        expect(itemPositions[1].height).toBe(80); // 奇数索引
      }
    });

    it('应该支持自定义缓冲区大小', () => {
      const customConfig = { ...mockConfig, overscan: 10 };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: customConfig,
        })
      );

      const { range } = result.current.scrollState;
      
      // 缓冲区应该影响渲染范围
      expect(range.startIndex).toBeLessThanOrEqual(range.visibleStartIndex);
      expect(range.endIndex).toBeGreaterThanOrEqual(range.visibleEndIndex);
    });

    it('应该支持禁用虚拟化', () => {
      const customConfig = { ...mockConfig, enabled: false };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems.slice(0, 10), // 使用较少数据
          config: customConfig,
        })
      );

      const { visibleItems } = result.current;
      
      // 禁用虚拟化时，应该渲染所有项目
      expect(visibleItems.length).toBe(10);
    });
  });

  describe('滚动控制测试', () => {
    it('应该能够滚动到指定索引', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      // 模拟容器元素
      const mockContainer = {
        scrollTo: mockScrollTo,
        clientHeight: 400,
        scrollTop: 0,
      };
      
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      act(() => {
        result.current.scrollToIndex(10);
      });

      // 应该调用 scrollTo 方法
      expect(mockScrollTo).toHaveBeenCalled();
    });

    it('应该能够滚动到指定位置', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      // 模拟容器元素
      const mockContainer = {
        scrollTo: mockScrollTo,
        clientHeight: 400,
        scrollTop: 0,
      };
      
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      act(() => {
        result.current.scrollToOffset(500);
      });

      // 应该调用 scrollTo 方法
      expect(mockScrollTo).toHaveBeenCalled();
    });

    it('应该支持不同的滚动对齐方式', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const mockContainer = {
        scrollTo: mockScrollTo,
        clientHeight: 400,
        scrollTop: 0,
      };
      
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // 测试不同的对齐方式
      act(() => {
        result.current.scrollToIndex(10, 'start');
      });
      
      act(() => {
        result.current.scrollToIndex(10, 'center');
      });
      
      act(() => {
        result.current.scrollToIndex(10, 'end');
      });

      // 应该调用多次 scrollTo
      expect(mockScrollTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('项目位置管理测试', () => {
    it('应该能够获取项目位置信息', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const position = result.current.getItemPosition(0);
      
      expect(position).toBeDefined();
      if (position) {
        expect(position.index).toBe(0);
        expect(position.height).toBe(50);
        expect(position.top).toBe(0);
        expect(position.bottom).toBe(50);
      }
    });

    it('应该处理无效的索引', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const invalidPosition = result.current.getItemPosition(-1);
      expect(invalidPosition).toBeNull();

      const outOfRangePosition = result.current.getItemPosition(1000);
      expect(outOfRangePosition).toBeNull();
    });

    it('应该能够更新项目高度', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      act(() => {
        result.current.updateItemHeight(0, 100);
      });

      // 更新后应该重新计算位置
      const position = result.current.getItemPosition(0);
      if (position) {
        expect(position.height).toBe(100);
      }
    });

    it('应该能够重新计算所有位置', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const initialTotalHeight = result.current.scrollState.totalHeight;

      act(() => {
        result.current.recalculate();
      });

      // 重新计算后状态应该更新
      expect(result.current.scrollState.totalHeight).toBeDefined();
    });
  });

  describe('回调函数测试', () => {
    it('应该触发滚动回调', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
          onScroll: mockCallbacks.onScroll,
          onScrollStart: mockCallbacks.onScrollStart,
          onScrollEnd: mockCallbacks.onScrollEnd,
        })
      );

      // 模拟滚动事件
      const mockContainer = document.createElement('div');
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // 触发滚动事件
      const scrollEvent = new Event('scroll');
      act(() => {
        mockContainer.dispatchEvent(scrollEvent);
      });

      // 应该触发滚动开始回调
      expect(mockCallbacks.onScrollStart).toHaveBeenCalled();
    });

    it('应该在滚动结束后触发回调', async () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
          onScrollEnd: mockCallbacks.onScrollEnd,
        })
      );

      const mockContainer = document.createElement('div');
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // 触发滚动事件
      const scrollEvent = new Event('scroll');
      act(() => {
        mockContainer.dispatchEvent(scrollEvent);
      });

      // 快进时间以触发滚动结束
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(mockCallbacks.onScrollEnd).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('数据变化测试', () => {
    it('应该响应数据变化', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useVirtualList({ items, config: mockConfig }),
        { initialProps: { items: testItems.slice(0, 10) } }
      );

      const initialItemCount = result.current.visibleItems.length;

      // 更新数据
      rerender({ items: testItems.slice(0, 20) });

      // 可视项目可能会发生变化
      expect(result.current.scrollState.itemPositions.length).toBe(20);
    });

    it('应该处理空数据', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: [],
          config: mockConfig,
        })
      );

      expect(result.current.visibleItems.length).toBe(0);
      expect(result.current.scrollState.totalHeight).toBe(0);
      expect(result.current.scrollState.itemPositions.length).toBe(0);
    });

    it('应该处理单个项目', () => {
      const singleItem = [testItems[0]];
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: singleItem,
          config: mockConfig,
        })
      );

      expect(result.current.visibleItems.length).toBe(1);
      expect(result.current.scrollState.totalHeight).toBe(50);
      expect(result.current.scrollState.itemPositions.length).toBe(1);
    });
  });

  describe('性能测试', () => {
    it('应该处理大量数据', () => {
      const largeItems = createTestItems(10000);
      
      const startTime = performance.now();
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: largeItems,
          config: mockConfig,
        })
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // 初始化时间应该在合理范围内
      expect(renderTime).toBeLessThan(100);
      
      // 应该只渲染可视区域内的项目
      expect(result.current.visibleItems.length).toBeLessThan(largeItems.length);
    });

    it('应该优化重复计算', () => {
      const { result, rerender } = renderHook(
        ({ config }) => useVirtualList({ items: testItems, config }),
        { initialProps: { config: mockConfig } }
      );

      const initialState = result.current.scrollState;

      // 使用相同配置重新渲染
      rerender({ config: mockConfig });

      // 状态结构应该保持一致
      expect(result.current.scrollState.itemPositions.length).toBe(
        initialState.itemPositions.length
      );
    });
  });

  describe('边界情况测试', () => {
    it('应该处理零高度配置', () => {
      const zeroHeightConfig = { ...mockConfig, height: 0 };
      
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: zeroHeightConfig,
        })
      );

      // 应该不抛出错误
      expect(result.current.scrollState).toBeDefined();
    });

    it('应该处理负数索引滚动', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const mockContainer = {
        scrollTo: mockScrollTo,
        clientHeight: 400,
        scrollTop: 0,
      };
      
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // 应该不抛出错误
      expect(() => {
        act(() => {
          result.current.scrollToIndex(-1);
        });
      }).not.toThrow();
    });

    it('应该处理超出范围的索引滚动', () => {
      const { result } = renderHook(() =>
        useVirtualList({
          items: testItems,
          config: mockConfig,
        })
      );

      const mockContainer = {
        scrollTo: mockScrollTo,
        clientHeight: 400,
        scrollTop: 0,
      };
      
      Object.defineProperty(result.current.containerRef, 'current', {
        value: mockContainer,
        writable: true,
      });

      // 应该不抛出错误
      expect(() => {
        act(() => {
          result.current.scrollToIndex(1000);
        });
      }).not.toThrow();
    });
  });
});
