import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VirtualList } from '../src';
import type { VirtualListConfig, VirtualListRef } from '../src';
import { useRef } from 'react';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  width: 800,
  height: 400,
  top: 0,
  left: 0,
  bottom: 400,
  right: 800,
}));

// 创建测试数据
const createTestData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    value: i * 10,
  }));
};

// 基础渲染函数
const basicRenderItem = ({ index, data }: any) => (
  <div data-testid={`item-${index}`} style={{ height: '50px', padding: '10px' }}>
    <div>{data.name}</div>
    <div>{data.description}</div>
  </div>
);

// 测试组件包装器
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div style={{ height: '400px', width: '800px' }}>{children}</div>;
};

describe('VirtualList', () => {
  const testData = createTestData(100);
  
  const mockConfig: VirtualListConfig = {
    height: 400,
    itemHeight: 50,
    overscan: 5,
  };

  const mockCallbacks = {
    onScroll: vi.fn(),
    onScrollStart: vi.fn(),
    onScrollEnd: vi.fn(),
    onItemClick: vi.fn(),
    onReachBottom: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock container element methods
    Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
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

  describe('基础渲染测试', () => {
    it('应该正确渲染虚拟列表', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('QinComponents-virtual-list');
    });

    it('应该渲染可视区域内的项目', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      // 应该渲染前几个项目（可视区域 + 缓冲区）
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        expect(screen.getByText('Item 0')).toBeInTheDocument();
      });
    });

    it('应该应用正确的容器样式', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveStyle({
        height: '400px',
      });
    });
  });

  describe('空状态和加载状态测试', () => {
    it('应该显示默认空状态', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={[]}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该显示自定义空状态', () => {
      const customEmpty = () => <div>自定义空状态</div>;
      
      render(
        <TestWrapper>
          <VirtualList
            items={[]}
            config={mockConfig}
            renderItem={basicRenderItem}
            renderEmpty={customEmpty}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('自定义空状态')).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={[]}
            loading={true}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该显示自定义加载状态', () => {
      const customLoading = () => <div>自定义加载中...</div>;
      
      render(
        <TestWrapper>
          <VirtualList
            items={[]}
            loading={true}
            config={mockConfig}
            renderItem={basicRenderItem}
            renderLoading={customLoading}
          />
        </TestWrapper>
      );
      
      expect(screen.getByText('自定义加载中...')).toBeInTheDocument();
    });

    it('应该在有数据时显示底部加载状态', async () => {
      const customLoading = () => <div>底部加载中...</div>;
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            loading={true}
            config={mockConfig}
            renderItem={basicRenderItem}
            renderLoading={customLoading}
          />
        </TestWrapper>
      );
      
      // 应该显示数据和底部加载状态
      await waitFor(() => {
        expect(screen.getByText('Item 0')).toBeInTheDocument();
        expect(screen.getByText('底部加载中...')).toBeInTheDocument();
      });
    });
  });

  describe('配置选项测试', () => {
    it('应该支持自定义高度', () => {
      const customConfig = { ...mockConfig, height: 600 };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={customConfig}
            renderItem={basicRenderItem}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveStyle({ height: '600px' });
    });

    it('应该支持字符串高度', () => {
      const customConfig = { ...mockConfig, height: '100%' };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={customConfig}
            renderItem={basicRenderItem}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveStyle({ height: '100%' });
    });

    it('应该支持水平滚动模式', () => {
      const horizontalConfig = { ...mockConfig, horizontal: true };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={horizontalConfig}
            renderItem={basicRenderItem}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveClass('QinComponents-virtual-list--horizontal');
    });

    it('应该支持禁用虚拟化', async () => {
      const disabledConfig = { ...mockConfig, enabled: false };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData.slice(0, 10)} // 使用较少数据
            config={disabledConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      // 禁用虚拟化时，所有项目都应该被渲染
      await waitFor(() => {
        for (let i = 0; i < 10; i++) {
          expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
        }
      });
    });
  });

  describe('动态高度测试', () => {
    it('应该支持函数形式的项目高度', async () => {
      const dynamicConfig = {
        ...mockConfig,
        itemHeight: (index: number) => index % 2 === 0 ? 60 : 80,
      };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={dynamicConfig}
            renderItem={({ index, data, style }) => (
              <div data-testid={`item-${index}`} style={style}>
                <div>{data.name}</div>
              </div>
            )}
          />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
      });
    });

    it('应该使用预估高度', () => {
      const estimatedConfig = {
        ...mockConfig,
        estimatedItemHeight: 75,
        itemHeight: (index: number) => index % 2 === 0 ? 60 : 90,
      };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={estimatedConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      // 组件应该正常渲染
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  describe('交互事件测试', () => {
    it('应该触发项目点击事件', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            onItemClick={mockCallbacks.onItemClick}
          />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const firstItem = screen.getByTestId('item-0');
        fireEvent.click(firstItem);
        
        expect(mockCallbacks.onItemClick).toHaveBeenCalledWith(
          testData[0],
          0,
          expect.any(Object)
        );
      });
    });

    it('应该触发滚动事件', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            onScroll={mockCallbacks.onScroll}
            onScrollStart={mockCallbacks.onScrollStart}
            onScrollEnd={mockCallbacks.onScrollEnd}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      
      // 模拟滚动事件
      fireEvent.scroll(container, { target: { scrollTop: 100 } });
      
      await waitFor(() => {
        expect(mockCallbacks.onScrollStart).toHaveBeenCalled();
        expect(mockCallbacks.onScroll).toHaveBeenCalled();
      });
    });

    it('应该在到达底部时触发回调', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            onReachBottom={mockCallbacks.onReachBottom}
            reachBottomThreshold={50}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      
      // 模拟滚动到接近底部
      Object.defineProperty(container, 'scrollTop', { value: 4900, configurable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 5000, configurable: true });
      Object.defineProperty(container, 'clientHeight', { value: 400, configurable: true });
      
      fireEvent.scroll(container);
      
      await waitFor(() => {
        expect(mockCallbacks.onReachBottom).toHaveBeenCalled();
      });
    });
  });

  describe('引用方法测试', () => {
    it('应该暴露滚动控制方法', () => {
      const TestComponent = () => {
        const listRef = useRef<VirtualListRef>(null);
        
        const handleScrollToIndex = () => {
          listRef.current?.scrollToIndex(10);
        };
        
        const handleScrollToOffset = () => {
          listRef.current?.scrollToOffset(500);
        };
        
        return (
          <TestWrapper>
            <button onClick={handleScrollToIndex} data-testid="scroll-to-index">
              Scroll to Index
            </button>
            <button onClick={handleScrollToOffset} data-testid="scroll-to-offset">
              Scroll to Offset
            </button>
            <VirtualList
              ref={listRef}
              items={testData}
              config={mockConfig}
              renderItem={basicRenderItem}
            />
          </TestWrapper>
        );
      };
      
      render(<TestComponent />);
      
      const scrollToIndexBtn = screen.getByTestId('scroll-to-index');
      const scrollToOffsetBtn = screen.getByTestId('scroll-to-offset');
      
      // 应该不抛出错误
      expect(() => {
        fireEvent.click(scrollToIndexBtn);
        fireEvent.click(scrollToOffsetBtn);
      }).not.toThrow();
    });

    it('应该提供获取状态的方法', () => {
      const TestComponent = () => {
        const listRef = useRef<VirtualListRef>(null);
        
        const handleGetState = () => {
          const state = listRef.current?.getScrollState();
          console.log('Current state:', state);
        };
        
        const handleGetContainer = () => {
          const container = listRef.current?.getContainer();
          console.log('Container:', container);
        };
        
        return (
          <TestWrapper>
            <button onClick={handleGetState} data-testid="get-state">
              Get State
            </button>
            <button onClick={handleGetContainer} data-testid="get-container">
              Get Container
            </button>
            <VirtualList
              ref={listRef}
              items={testData}
              config={mockConfig}
              renderItem={basicRenderItem}
            />
          </TestWrapper>
        );
      };
      
      render(<TestComponent />);
      
      const getStateBtn = screen.getByTestId('get-state');
      const getContainerBtn = screen.getByTestId('get-container');
      
      // 应该不抛出错误
      expect(() => {
        fireEvent.click(getStateBtn);
        fireEvent.click(getContainerBtn);
      }).not.toThrow();
    });
  });

  describe('自定义键值测试', () => {
    it('应该使用自定义键值函数', async () => {
      const getItemKey = (item: any, index: number) => `custom-${item.id}-${index}`;
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            getItemKey={getItemKey}
          />
        </TestWrapper>
      );
      
      await waitFor(() => {
        // 检查是否使用了自定义键值
        const firstItem = screen.getByTestId('item-0');
        expect(firstItem).toBeInTheDocument();
      });
    });

    it('应该使用默认键值函数', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      await waitFor(() => {
        // 应该使用索引作为默认键值
        const firstItem = screen.getByTestId('item-0');
        expect(firstItem).toBeInTheDocument();
      });
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的配置', () => {
      const invalidConfig = {} as VirtualListConfig;
      
      expect(() => {
        render(
          <TestWrapper>
            <VirtualList
              items={testData}
              config={invalidConfig}
              renderItem={basicRenderItem}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('应该处理空的渲染函数', () => {
      const emptyRenderItem = () => null;
      
      expect(() => {
        render(
          <TestWrapper>
            <VirtualList
              items={testData}
              config={mockConfig}
              renderItem={emptyRenderItem}
            />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('应该处理渲染函数抛出的错误', () => {
      const errorRenderItem = () => {
        throw new Error('Render error');
      };
      
      // 应该捕获并处理渲染错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(
          <TestWrapper>
            <VirtualList
              items={testData.slice(0, 1)}
              config={mockConfig}
              renderItem={errorRenderItem}
            />
          </TestWrapper>
        );
      }).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('性能测试', () => {
    it('应该处理大量数据', async () => {
      const largeData = createTestData(10000);
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <VirtualList
            items={largeData}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 渲染时间应该在合理范围内（小于100ms）
      expect(renderTime).toBeLessThan(100);
      
      await waitFor(() => {
        expect(screen.getByText('Item 0')).toBeInTheDocument();
      });
    });

    it('应该只渲染可视区域内的项目', async () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
          />
        </TestWrapper>
      );
      
      await waitFor(() => {
        // 应该只渲染可视区域 + 缓冲区的项目
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        
        // 远离可视区域的项目不应该被渲染
        expect(screen.queryByTestId('item-50')).not.toBeInTheDocument();
      });
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的测试标识', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            data-testid="accessible-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('accessible-list');
      expect(container).toBeInTheDocument();
    });

    it('应该支持自定义类名', () => {
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            className="custom-virtual-list"
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveClass('custom-virtual-list');
      expect(container).toHaveClass('QinComponents-virtual-list');
    });

    it('应该支持自定义样式', () => {
      const customStyle = { backgroundColor: 'red', border: '1px solid blue' };
      
      render(
        <TestWrapper>
          <VirtualList
            items={testData}
            config={mockConfig}
            renderItem={basicRenderItem}
            style={customStyle}
            data-testid="virtual-list"
          />
        </TestWrapper>
      );
      
      const container = screen.getByTestId('virtual-list');
      expect(container).toHaveStyle(customStyle);
    });
  });
});
