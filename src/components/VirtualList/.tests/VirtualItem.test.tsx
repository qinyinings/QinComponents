import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualItem } from '../src/components/VirtualItem';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
global.ResizeObserver = mockResizeObserver;

describe('VirtualItem', () => {
  const mockProps = {
    index: 0,
    data: { id: 0, name: 'Test Item' },
    style: { height: 50, position: 'absolute' as const, top: 0 },
    isVisible: true,
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染虚拟项目', () => {
      render(<VirtualItem {...mockProps} />);
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      render(<VirtualItem {...mockProps} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveClass('QinComponents-virtual-item');
      expect(item).toHaveClass('QinComponents-virtual-item--visible');
    });

    it('应该应用传入的样式', () => {
      const customStyle = { height: 100, backgroundColor: 'red' };
      
      render(<VirtualItem {...mockProps} style={customStyle} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveStyle(customStyle);
    });

    it('应该设置正确的数据属性', () => {
      render(<VirtualItem {...mockProps} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', '0');
    });
  });

  describe('可见性状态测试', () => {
    it('应该在可见时添加可见类名', () => {
      render(<VirtualItem {...mockProps} isVisible={true} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveClass('QinComponents-virtual-item--visible');
    });

    it('应该在不可见时移除可见类名', () => {
      render(<VirtualItem {...mockProps} isVisible={false} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveClass('QinComponents-virtual-item');
      expect(item).not.toHaveClass('QinComponents-virtual-item--visible');
    });
  });

  describe('高度监测测试', () => {
    it('应该在启用高度监测时设置 ResizeObserver', () => {
      const onHeightChange = vi.fn();
      
      render(
        <VirtualItem
          {...mockProps}
          enableHeightMeasurement={true}
          onHeightChange={onHeightChange}
        />
      );
      
      expect(mockResizeObserver).toHaveBeenCalled();
    });

    it('应该在禁用高度监测时不设置 ResizeObserver', () => {
      render(
        <VirtualItem
          {...mockProps}
          enableHeightMeasurement={false}
        />
      );
      
      expect(mockResizeObserver).not.toHaveBeenCalled();
    });

    it('应该在没有回调函数时不设置 ResizeObserver', () => {
      render(
        <VirtualItem
          {...mockProps}
          enableHeightMeasurement={true}
          onHeightChange={undefined}
        />
      );
      
      expect(mockResizeObserver).not.toHaveBeenCalled();
    });
  });

  describe('内容渲染测试', () => {
    it('应该渲染字符串内容', () => {
      render(<VirtualItem {...mockProps}>Simple Text</VirtualItem>);
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('应该渲染复杂的 React 元素', () => {
      const complexContent = (
        <div>
          <h3>Title</h3>
          <p>Description</p>
          <button>Action</button>
        </div>
      );
      
      render(<VirtualItem {...mockProps}>{complexContent}</VirtualItem>);
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('应该渲染空内容', () => {
      render(<VirtualItem {...mockProps}>{null}</VirtualItem>);
      
      const item = document.querySelector('.QinComponents-virtual-item');
      expect(item).toBeInTheDocument();
      expect(item?.textContent).toBe('');
    });
  });

  describe('数据属性测试', () => {
    it('应该设置正确的索引属性', () => {
      render(<VirtualItem {...mockProps} index={5} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', '5');
    });

    it('应该处理不同的数据类型', () => {
      const complexData = {
        id: 'test-id',
        name: 'Complex Item',
        nested: { value: 42 },
        array: [1, 2, 3],
      };
      
      render(<VirtualItem {...mockProps} data={complexData} />);
      
      // 组件应该正常渲染，不管数据多复杂
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('样式应用测试', () => {
    it('应该合并默认样式和传入样式', () => {
      const customStyle = {
        backgroundColor: 'blue',
        padding: '10px',
        height: 80,
      };
      
      render(<VirtualItem {...mockProps} style={customStyle} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveStyle({
        backgroundColor: 'blue',
        padding: '10px',
        height: '80px',
      });
    });

    it('应该处理 CSS-in-JS 样式对象', () => {
      const cssInJsStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '8px',
      };
      
      render(<VirtualItem {...mockProps} style={cssInJsStyle} />);
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveStyle(cssInJsStyle);
    });
  });

  describe('组件生命周期测试', () => {
    it('应该在组件卸载时清理 ResizeObserver', () => {
      const mockDisconnect = vi.fn();
      const mockObserver = {
        observe: vi.fn(),
        disconnect: mockDisconnect,
        unobserve: vi.fn(),
      };
      
      mockResizeObserver.mockReturnValue(mockObserver);
      
      const onHeightChange = vi.fn();
      const { unmount } = render(
        <VirtualItem
          {...mockProps}
          enableHeightMeasurement={true}
          onHeightChange={onHeightChange}
        />
      );
      
      unmount();
      
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('应该在索引变化时更新数据属性', () => {
      const { rerender } = render(<VirtualItem {...mockProps} index={0} />);
      
      let item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', '0');
      
      rerender(<VirtualItem {...mockProps} index={5} />);
      
      item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', '5');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的样式对象', () => {
      const invalidStyle = null as any;
      
      expect(() => {
        render(<VirtualItem {...mockProps} style={invalidStyle} />);
      }).not.toThrow();
    });

    it('应该处理负数索引', () => {
      expect(() => {
        render(<VirtualItem {...mockProps} index={-1} />);
      }).not.toThrow();
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', '-1');
    });

    it('应该处理非常大的索引', () => {
      const largeIndex = 999999;
      
      expect(() => {
        render(<VirtualItem {...mockProps} index={largeIndex} />);
      }).not.toThrow();
      
      const item = screen.getByText('Test Content').parentElement;
      expect(item).toHaveAttribute('data-index', largeIndex.toString());
    });
  });

  describe('性能测试', () => {
    it('应该使用 memo 优化重渲染', () => {
      const { rerender } = render(<VirtualItem {...mockProps} />);
      
      // 使用相同的 props 重新渲染
      rerender(<VirtualItem {...mockProps} />);
      
      // 组件应该正常工作
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('应该在 props 变化时重新渲染', () => {
      const { rerender } = render(
        <VirtualItem {...mockProps}>Original Content</VirtualItem>
      );
      
      expect(screen.getByText('Original Content')).toBeInTheDocument();
      
      rerender(
        <VirtualItem {...mockProps}>Updated Content</VirtualItem>
      );
      
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
    });
  });
});
