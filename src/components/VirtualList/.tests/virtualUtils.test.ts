import { describe, it, expect } from 'vitest';
import {
  binarySearch,
  findStartIndex,
  findEndIndex,
  calculateOptimizedRange,
  calculateTotalHeight,
  throttle,
  debounce,
  getElementHeight,
  isElementVisible,
  calculateScrollToIndex,
  formatFileSize,
  generateId,
  deepEqual,
  createItemStyle,
} from '../src/utils/virtualUtils';
import type { VirtualItemPosition } from '../../../types/common';

// 创建测试用的项目位置数据
const createItemPositions = (count: number, itemHeight: number = 50): VirtualItemPosition[] => {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    height: itemHeight,
    top: i * itemHeight,
    bottom: (i + 1) * itemHeight,
  }));
};

describe('virtualUtils', () => {
  describe('binarySearch', () => {
    const positions = createItemPositions(100);

    it('应该找到正确的索引', () => {
      const result = binarySearch(
        positions,
        250, // 查找 top >= 250 的第一个项目
        (item, target) => item.top >= target ? 1 : -1
      );
      
      expect(result).toBe(5); // 第5个项目的 top = 250
    });

    it('应该处理找不到的情况', () => {
      const result = binarySearch(
        positions,
        10000, // 超出范围的值
        (item, target) => item.top >= target ? 1 : -1
      );
      
      expect(result).toBe(-1);
    });

    it('应该处理空数组', () => {
      const result = binarySearch(
        [],
        100,
        (item, target) => item.top >= target ? 1 : -1
      );
      
      expect(result).toBe(-1);
    });
  });

  describe('findStartIndex', () => {
    const positions = createItemPositions(100);

    it('应该找到可视区域的开始索引', () => {
      const startIndex = findStartIndex(positions, 250);
      expect(startIndex).toBe(5); // 第5个项目的 bottom > 250
    });

    it('应该处理滚动位置为0的情况', () => {
      const startIndex = findStartIndex(positions, 0);
      expect(startIndex).toBe(0);
    });

    it('应该处理超出范围的滚动位置', () => {
      const startIndex = findStartIndex(positions, 10000);
      expect(startIndex).toBe(0); // 应该返回有效索引
    });

    it('应该处理空位置数组', () => {
      const startIndex = findStartIndex([], 100);
      expect(startIndex).toBe(0);
    });
  });

  describe('findEndIndex', () => {
    const positions = createItemPositions(100);

    it('应该找到可视区域的结束索引', () => {
      const endIndex = findEndIndex(positions, 750);
      expect(endIndex).toBe(14); // 第14个项目的 top < 750
    });

    it('应该处理滚动底部超出范围的情况', () => {
      const endIndex = findEndIndex(positions, 10000);
      expect(endIndex).toBe(99); // 最后一个项目的索引
    });

    it('应该处理滚动底部为0的情况', () => {
      const endIndex = findEndIndex(positions, 0);
      expect(endIndex).toBe(0);
    });

    it('应该处理空位置数组', () => {
      const endIndex = findEndIndex([], 100);
      expect(endIndex).toBe(0);
    });
  });

  describe('calculateOptimizedRange', () => {
    const positions = createItemPositions(100);

    it('应该计算正确的可视范围', () => {
      const range = calculateOptimizedRange(250, 400, positions, 5);
      
      expect(range.visibleStartIndex).toBe(5);
      expect(range.visibleEndIndex).toBe(12);
      expect(range.startIndex).toBe(0); // 5 - 5 = 0
      expect(range.endIndex).toBe(17); // 12 + 5 = 17
    });

    it('应该处理缓冲区超出边界的情况', () => {
      const range = calculateOptimizedRange(0, 400, positions, 10);
      
      expect(range.startIndex).toBe(0); // 不能小于0
      expect(range.endIndex).toBeLessThanOrEqual(99); // 不能超过最大索引
    });

    it('应该处理空位置数组', () => {
      const range = calculateOptimizedRange(0, 400, [], 5);
      
      expect(range.startIndex).toBe(0);
      expect(range.endIndex).toBe(0);
      expect(range.visibleStartIndex).toBe(0);
      expect(range.visibleEndIndex).toBe(0);
    });

    it('应该使用默认缓冲区大小', () => {
      const range = calculateOptimizedRange(250, 400, positions);
      
      expect(range.startIndex).toBeLessThanOrEqual(range.visibleStartIndex);
      expect(range.endIndex).toBeGreaterThanOrEqual(range.visibleEndIndex);
    });
  });

  describe('calculateTotalHeight', () => {
    it('应该计算正确的总高度', () => {
      const positions = createItemPositions(10, 50);
      const totalHeight = calculateTotalHeight(positions);
      
      expect(totalHeight).toBe(500); // 10 * 50
    });

    it('应该处理空位置数组', () => {
      const totalHeight = calculateTotalHeight([]);
      expect(totalHeight).toBe(0);
    });

    it('应该处理不同高度的项目', () => {
      const positions: VirtualItemPosition[] = [
        { index: 0, height: 50, top: 0, bottom: 50 },
        { index: 1, height: 80, top: 50, bottom: 130 },
        { index: 2, height: 60, top: 130, bottom: 190 },
      ];
      
      const totalHeight = calculateTotalHeight(positions);
      expect(totalHeight).toBe(190);
    });
  });

  describe('throttle', () => {
    it('应该限制函数调用频率', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const throttledFn = throttle(fn, 100);

      // 快速连续调用
      throttledFn();
      throttledFn();
      throttledFn();

      expect(callCount).toBe(1); // 应该只执行一次

      // 等待延迟后再次调用
      await new Promise(resolve => setTimeout(resolve, 150));
      throttledFn();

      expect(callCount).toBe(2);
    });

    it('应该传递参数', () => {
      let lastArgs: any[] = [];
      const fn = (...args: any[]) => { lastArgs = args; };
      const throttledFn = throttle(fn, 50);

      throttledFn('test', 123);
      expect(lastArgs).toEqual(['test', 123]);
    });
  });

  describe('debounce', () => {
    it('应该延迟执行函数', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debouncedFn = debounce(fn, 100);

      // 快速连续调用
      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0); // 应该还没执行

      // 等待延迟后执行
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1); // 应该只执行一次
    });

    it('应该取消之前的调用', async () => {
      let callCount = 0;
      const fn = () => callCount++;
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      await new Promise(resolve => setTimeout(resolve, 50));
      debouncedFn(); // 这会取消之前的调用

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1); // 应该只执行最后一次
    });
  });

  describe('getElementHeight', () => {
    it('应该返回元素的高度', () => {
      const mockElement = {
        getBoundingClientRect: () => ({ height: 100, width: 200, top: 0, left: 0, bottom: 100, right: 200 }),
      } as HTMLElement;

      const height = getElementHeight(mockElement);
      expect(height).toBe(100);
    });
  });

  describe('isElementVisible', () => {
    it('应该正确判断元素是否可见', () => {
      // 完全可见
      expect(isElementVisible(100, 200, 50, 400)).toBe(true);
      
      // 部分可见（顶部）
      expect(isElementVisible(0, 100, 50, 400)).toBe(true);
      
      // 部分可见（底部）
      expect(isElementVisible(400, 500, 50, 400)).toBe(true);
      
      // 完全不可见（上方）
      expect(isElementVisible(0, 30, 50, 400)).toBe(false);
      
      // 完全不可见（下方）
      expect(isElementVisible(500, 600, 50, 400)).toBe(false);
    });

    it('应该处理边界情况', () => {
      // 刚好在边界上
      expect(isElementVisible(50, 50, 50, 400)).toBe(false);
      expect(isElementVisible(450, 450, 50, 400)).toBe(false);
      
      // 刚好接触边界
      expect(isElementVisible(49, 51, 50, 400)).toBe(true);
      expect(isElementVisible(449, 451, 50, 400)).toBe(true);
    });
  });

  describe('calculateScrollToIndex', () => {
    const positions = createItemPositions(100);

    it('应该计算滚动到开始位置', () => {
      const scrollTop = calculateScrollToIndex(10, positions, 400, 'start');
      expect(scrollTop).toBe(500); // 第10个项目的 top
    });

    it('应该计算滚动到中心位置', () => {
      const scrollTop = calculateScrollToIndex(10, positions, 400, 'center');
      expect(scrollTop).toBe(325); // 500 - (400 - 50) / 2
    });

    it('应该计算滚动到结束位置', () => {
      const scrollTop = calculateScrollToIndex(10, positions, 400, 'end');
      expect(scrollTop).toBe(150); // 550 - 400
    });

    it('应该处理自动对齐模式', () => {
      // 项目已经可见，不需要滚动
      const scrollTop1 = calculateScrollToIndex(5, positions, 400, 'auto', 200);
      expect(scrollTop1).toBe(200); // 保持当前位置

      // 项目在上方，滚动到顶部
      const scrollTop2 = calculateScrollToIndex(2, positions, 400, 'auto', 200);
      expect(scrollTop2).toBe(100); // 项目的 top

      // 项目在下方，滚动到底部
      const scrollTop3 = calculateScrollToIndex(15, positions, 400, 'auto', 200);
      expect(scrollTop3).toBe(400); // 800 - 400
    });

    it('应该处理无效索引', () => {
      const scrollTop1 = calculateScrollToIndex(-1, positions, 400, 'start', 100);
      expect(scrollTop1).toBe(100); // 保持当前位置

      const scrollTop2 = calculateScrollToIndex(1000, positions, 400, 'start', 100);
      expect(scrollTop2).toBe(100); // 保持当前位置
    });

    it('应该限制滚动范围', () => {
      // 不能滚动到负数位置
      const scrollTop1 = calculateScrollToIndex(0, positions, 400, 'center');
      expect(scrollTop1).toBeGreaterThanOrEqual(0);

      // 不能超过最大滚动位置
      const scrollTop2 = calculateScrollToIndex(99, positions, 400, 'start');
      expect(scrollTop2).toBeLessThanOrEqual(5000 - 400); // totalHeight - containerHeight
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化字节大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('应该处理大数值', () => {
      const result = formatFileSize(1099511627776); // 1TB
      expect(result).toBe('1 TB');
    });

    it('应该保留两位小数', () => {
      const result = formatFileSize(1234567);
      expect(result).toBe('1.18 MB');
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^virtual_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^virtual_\d+_[a-z0-9]+$/);
    });

    it('应该生成指定格式的ID', () => {
      const id = generateId();
      expect(id).toMatch(/^virtual_/);
    });
  });

  describe('deepEqual', () => {
    it('应该比较基本类型', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('test', 'test')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
      
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('test', 'other')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });

    it('应该比较对象', () => {
      const obj1 = { a: 1, b: 'test' };
      const obj2 = { a: 1, b: 'test' };
      const obj3 = { a: 1, b: 'other' };
      const obj4 = { a: 1 };
      
      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
      expect(deepEqual(obj1, obj4)).toBe(false);
    });

    it('应该比较嵌套对象', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      const obj3 = { a: { b: { c: 2 } } };
      
      expect(deepEqual(obj1, obj2)).toBe(true);
      expect(deepEqual(obj1, obj3)).toBe(false);
    });

    it('应该比较数组', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];
      const arr3 = [1, 2, 4];
      
      expect(deepEqual(arr1, arr2)).toBe(true);
      expect(deepEqual(arr1, arr3)).toBe(false);
    });

    it('应该处理循环引用', () => {
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      
      const obj2: any = { a: 1 };
      obj2.self = obj2;
      
      // 这个测试可能会导致无限递归，但我们的实现应该能处理
      // 注意：当前实现可能不能完美处理循环引用
      expect(() => deepEqual(obj1, obj2)).not.toThrow();
    });
  });

  describe('createItemStyle', () => {
    const position: VirtualItemPosition = {
      index: 0,
      height: 50,
      top: 100,
      bottom: 150,
    };

    it('应该创建垂直样式', () => {
      const style = createItemStyle(position, false);
      
      expect(style).toEqual({
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        height: 50,
      });
    });

    it('应该创建水平样式', () => {
      const style = createItemStyle(position, true);
      
      expect(style).toEqual({
        position: 'absolute',
        top: 0,
        left: 100,
        width: 50,
        height: '100%',
      });
    });

    it('应该使用默认垂直模式', () => {
      const style = createItemStyle(position);
      
      expect(style).toEqual({
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        height: 50,
      });
    });
  });
});
