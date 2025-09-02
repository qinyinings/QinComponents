import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileList } from '../src/components/FileList';
import type { UploadFileInfo } from '../../../types/common';

// Mock FileItem component
vi.mock('../src/components/FileItem', () => ({
  FileItem: ({ file, onRemove, onStart, onPause, onResume, onCancel, onRetry }: any) => (
    <div data-testid={`file-item-${file.id}`}>
      <span>{file.name}</span>
      <span>{file.status}</span>
      <button onClick={onRemove}>Remove</button>
      <button onClick={onStart}>Start</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onResume}>Resume</button>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('FileList', () => {
  const createMockFile = (overrides: Partial<UploadFileInfo> = {}): UploadFileInfo => ({
    id: `file-${Math.random()}`,
    file: new File(['content'], 'test.txt', { type: 'text/plain' }),
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    status: 'idle',
    progress: 0,
    uploadedSize: 0,
    chunks: [],
    ...overrides,
  });

  const mockCallbacks = {
    onRemove: vi.fn(),
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onCancel: vi.fn(),
    onRetry: vi.fn(),
    onClearCompleted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该渲染文件列表标题', () => {
      const files = [createMockFile()];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('文件列表 (1)')).toBeInTheDocument();
    });

    it('应该根据文件数量显示正确的计数', () => {
      const files = [
        createMockFile({ id: '1' }),
        createMockFile({ id: '2' }),
        createMockFile({ id: '3' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('文件列表 (3)')).toBeInTheDocument();
    });

    it('应该为每个文件渲染FileItem组件', () => {
      const files = [
        createMockFile({ id: '1', name: 'file1.txt' }),
        createMockFile({ id: '2', name: 'file2.txt' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByTestId('file-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('file-item-2')).toBeInTheDocument();
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('应该在没有文件时仍然渲染基本结构', () => {
      render(<FileList files={[]} {...mockCallbacks} />);
      
      expect(screen.getByText('文件列表 (0)')).toBeInTheDocument();
    });
  });

  describe('清除已完成按钮测试', () => {
    it('应该在有已完成文件时显示清除按钮', () => {
      const files = [
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'idle' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('清除已完成 (1)')).toBeInTheDocument();
    });

    it('应该显示正确的已完成文件数量', () => {
      const files = [
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'idle' }),
        createMockFile({ status: 'uploading' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('清除已完成 (3)')).toBeInTheDocument();
    });

    it('应该在没有已完成文件时不显示清除按钮', () => {
      const files = [
        createMockFile({ status: 'idle' }),
        createMockFile({ status: 'uploading' }),
        createMockFile({ status: 'error' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.queryByText(/清除已完成/)).not.toBeInTheDocument();
    });

    it('应该在点击清除按钮时调用onClearCompleted', () => {
      const files = [
        createMockFile({ status: 'completed' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      const clearButton = screen.getByText('清除已完成 (1)');
      fireEvent.click(clearButton);
      
      expect(mockCallbacks.onClearCompleted).toHaveBeenCalledTimes(1);
    });
  });

  describe('回调函数传递测试', () => {
    it('应该将所有回调函数正确传递给FileItem', () => {
      const file = createMockFile({ id: 'test-file' });
      render(<FileList files={[file]} {...mockCallbacks} />);
      
      // 测试每个回调函数是否正确传递
      fireEvent.click(screen.getByText('Remove'));
      expect(mockCallbacks.onRemove).toHaveBeenCalledWith('test-file');
      
      fireEvent.click(screen.getByText('Start'));
      expect(mockCallbacks.onStart).toHaveBeenCalledWith('test-file');
      
      fireEvent.click(screen.getByText('Pause'));
      expect(mockCallbacks.onPause).toHaveBeenCalledWith('test-file');
      
      fireEvent.click(screen.getByText('Resume'));
      expect(mockCallbacks.onResume).toHaveBeenCalledWith('test-file');
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockCallbacks.onCancel).toHaveBeenCalledWith('test-file');
      
      fireEvent.click(screen.getByText('Retry'));
      expect(mockCallbacks.onRetry).toHaveBeenCalledWith('test-file');
    });

    it('应该为不同的文件传递正确的ID', () => {
      const files = [
        createMockFile({ id: 'file1' }),
        createMockFile({ id: 'file2' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      const removeButtons = screen.getAllByText('Remove');
      
      fireEvent.click(removeButtons[0]);
      expect(mockCallbacks.onRemove).toHaveBeenCalledWith('file1');
      
      fireEvent.click(removeButtons[1]);
      expect(mockCallbacks.onRemove).toHaveBeenCalledWith('file2');
    });
  });

  describe('样式类名测试', () => {
    it('应该应用正确的CSS类名', () => {
      const files = [createMockFile()];
      const { container } = render(<FileList files={files} {...mockCallbacks} />);
      
      expect(container.firstChild).toHaveClass('QinComponents-file-list');
      
      const header = screen.getByText('文件列表 (1)').closest('.QinComponents-file-list__header');
      expect(header).toBeInTheDocument();
      
      const items = container.querySelector('.QinComponents-file-list__items');
      expect(items).toBeInTheDocument();
    });

    it('应该为标题应用正确的类名', () => {
      const files = [createMockFile()];
      render(<FileList files={files} {...mockCallbacks} />);
      
      const title = screen.getByText('文件列表 (1)');
      expect(title).toHaveClass('QinComponents-file-list__title');
    });

    it('应该为清除按钮应用正确的类名', () => {
      const files = [createMockFile({ status: 'completed' })];
      render(<FileList files={files} {...mockCallbacks} />);
      
      const clearButton = screen.getByText('清除已完成 (1)');
      expect(clearButton).toHaveClass('QinComponents-file-list__clear-btn');
    });
  });

  describe('文件状态统计测试', () => {
    it('应该正确计算已完成文件数量', () => {
      const files = [
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'idle' }),
        createMockFile({ status: 'error' }),
        createMockFile({ status: 'cancelled' }), // cancelled不算completed
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('清除已完成 (2)')).toBeInTheDocument();
    });

    it('应该在只有一个已完成文件时显示单数形式', () => {
      const files = [
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'idle' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('清除已完成 (1)')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空文件列表', () => {
      render(<FileList files={[]} {...mockCallbacks} />);
      
      expect(screen.getByText('文件列表 (0)')).toBeInTheDocument();
      expect(screen.queryByText(/清除已完成/)).not.toBeInTheDocument();
    });

    it('应该处理所有文件都是已完成状态', () => {
      const files = [
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'completed' }),
        createMockFile({ status: 'completed' }),
      ];
      render(<FileList files={files} {...mockCallbacks} />);
      
      expect(screen.getByText('文件列表 (3)')).toBeInTheDocument();
      expect(screen.getByText('清除已完成 (3)')).toBeInTheDocument();
    });

    it('应该处理没有回调函数的情况', () => {
      const files = [createMockFile()];
      const propsWithoutCallbacks = {
        files,
        onRemove: undefined as any,
        onStart: undefined as any,
        onPause: undefined as any,
        onResume: undefined as any,
        onCancel: undefined as any,
        onRetry: undefined as any,
        onClearCompleted: undefined as any,
      };
      
      expect(() => {
        render(<FileList {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });
  });

  describe('可访问性测试', () => {
    it('清除按钮应该具有正确的type属性', () => {
      const files = [createMockFile({ status: 'completed' })];
      render(<FileList files={files} {...mockCallbacks} />);
      
      const clearButton = screen.getByText('清除已完成 (1)');
      expect(clearButton).toHaveAttribute('type', 'button');
    });

    it('应该为文件列表提供语义化的结构', () => {
      const files = [createMockFile()];
      const { container } = render(<FileList files={files} {...mockCallbacks} />);
      
      const header = container.querySelector('.QinComponents-file-list__header');
      const items = container.querySelector('.QinComponents-file-list__items');
      
      expect(header).toBeInTheDocument();
      expect(items).toBeInTheDocument();
    });
  });
});
