import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileItem } from '../src/components/FileItem';
import type { UploadFileInfo } from '../../../types/common';

// Mock the utility functions
vi.mock('../src/utils/fileUtils', () => ({
  formatFileSize: vi.fn((bytes) => `${bytes} B`),
  formatUploadSpeed: vi.fn((speed) => `${speed} B/s`),
  formatRemainingTime: vi.fn((time) => `${time}s`),
  getFileTypeIcon: vi.fn(() => '📄'),
}));

vi.mock('../src/utils/uploadUtils', () => ({
  calculateUploadSpeed: vi.fn(() => 1024),
  calculateRemainingTime: vi.fn(() => 30),
}));

describe('FileItem', () => {
  const createMockFile = (overrides: Partial<UploadFileInfo> = {}): UploadFileInfo => ({
    id: 'test-file-1',
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
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该渲染文件基本信息', () => {
      const file = createMockFile();
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('1024 B')).toBeInTheDocument();
      expect(screen.getByText('等待上传')).toBeInTheDocument();
      expect(screen.getByText('📄')).toBeInTheDocument();
    });

    it('应该渲染错误信息', () => {
      const file = createMockFile({
        status: 'error',
        error: '上传失败：网络错误',
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('上传失败')).toBeInTheDocument();
      expect(screen.getByText('上传失败：网络错误')).toBeInTheDocument();
    });
  });

  describe('状态显示测试', () => {
    const statusTests = [
      { status: 'idle' as const, text: '等待上传', className: 'idle' },
      { status: 'uploading' as const, text: '上传中', className: 'uploading' },
      { status: 'paused' as const, text: '已暂停', className: 'paused' },
      { status: 'completed' as const, text: '上传完成', className: 'completed' },
      { status: 'error' as const, text: '上传失败', className: 'error' },
      { status: 'cancelled' as const, text: '已取消', className: 'cancelled' },
    ];

    statusTests.forEach(({ status, text, className }) => {
      it(`应该正确显示${status}状态`, () => {
        const file = createMockFile({ status });
        const { container } = render(<FileItem file={file} {...mockCallbacks} />);
        
        expect(screen.getByText(text)).toBeInTheDocument();
        expect(container.firstChild).toHaveClass(`QinComponents-file-item--${className}`);
      });
    });
  });

  describe('进度显示测试', () => {
    it('应该在上传中时显示进度条', () => {
      const file = createMockFile({
        status: 'uploading',
        progress: 50,
        uploadedSize: 512,
        startTime: Date.now() - 10000,
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
      
      const progressFill = document.querySelector('.QinComponents-file-item__progress-fill');
      expect(progressFill).toHaveStyle({ width: '50%' });
    });

    it('应该在暂停时显示进度条', () => {
      const file = createMockFile({
        status: 'paused',
        progress: 30,
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('应该在错误且有进度时显示进度条', () => {
      const file = createMockFile({
        status: 'error',
        progress: 25,
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('应该在空闲状态时不显示进度条', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });
  });

  describe('上传统计显示测试', () => {
    it('应该在上传中时显示统计信息', () => {
      const file = createMockFile({
        status: 'uploading',
        uploadedSize: 512,
        startTime: Date.now() - 10000,
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('1024 B/s')).toBeInTheDocument();
      expect(screen.getByText('剩余 30s')).toBeInTheDocument();
      expect(screen.getByText('512 B / 1024 B')).toBeInTheDocument();
    });

    it('应该在非上传状态时不显示统计信息', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.queryByText('B/s')).not.toBeInTheDocument();
      expect(screen.queryByText('剩余')).not.toBeInTheDocument();
    });
  });

  describe('分片信息显示测试', () => {
    it('应该在有多个分片时显示分片信息', () => {
      const file = createMockFile({
        chunks: [
          { index: 0, status: 'completed' } as any,
          { index: 1, status: 'completed' } as any,
          { index: 2, status: 'pending' } as any,
        ],
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('分片: 2 / 3')).toBeInTheDocument();
    });

    it('应该显示失败的分片数量', () => {
      const file = createMockFile({
        chunks: [
          { index: 0, status: 'completed' } as any,
          { index: 1, status: 'error' } as any,
          { index: 2, status: 'error' } as any,
        ],
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('失败: 2')).toBeInTheDocument();
    });

    it('应该在单个分片时不显示分片信息', () => {
      const file = createMockFile({
        chunks: [{ index: 0, status: 'completed' } as any],
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.queryByText('分片:')).not.toBeInTheDocument();
    });
  });

  describe('操作按钮测试', () => {
    it('应该在idle状态显示开始和移除按钮', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('开始')).toBeInTheDocument();
      expect(screen.getByText('移除')).toBeInTheDocument();
    });

    it('应该在uploading状态显示暂停和取消按钮', () => {
      const file = createMockFile({ status: 'uploading' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('暂停')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });

    it('应该在paused状态显示继续和取消按钮', () => {
      const file = createMockFile({ status: 'paused' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('继续')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });

    it('应该在error状态显示重试和移除按钮', () => {
      const file = createMockFile({ status: 'error' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('重试')).toBeInTheDocument();
      expect(screen.getByText('移除')).toBeInTheDocument();
    });

    it('应该在completed状态只显示移除按钮', () => {
      const file = createMockFile({ status: 'completed' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('移除')).toBeInTheDocument();
      expect(screen.queryByText('开始')).not.toBeInTheDocument();
    });

    it('应该在cancelled状态只显示移除按钮', () => {
      const file = createMockFile({ status: 'cancelled' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(screen.getByText('移除')).toBeInTheDocument();
    });
  });

  describe('按钮点击事件测试', () => {
    it('应该正确处理开始按钮点击', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('开始'));
      expect(mockCallbacks.onStart).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理暂停按钮点击', () => {
      const file = createMockFile({ status: 'uploading' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('暂停'));
      expect(mockCallbacks.onPause).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理继续按钮点击', () => {
      const file = createMockFile({ status: 'paused' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('继续'));
      expect(mockCallbacks.onResume).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理取消按钮点击', () => {
      const file = createMockFile({ status: 'uploading' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('取消'));
      expect(mockCallbacks.onCancel).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理重试按钮点击', () => {
      const file = createMockFile({ status: 'error' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('重试'));
      expect(mockCallbacks.onRetry).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理移除按钮点击', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      fireEvent.click(screen.getByText('移除'));
      expect(mockCallbacks.onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('样式类名测试', () => {
    it('应该应用基础类名', () => {
      const file = createMockFile();
      const { container } = render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(container.firstChild).toHaveClass('QinComponents-file-item');
    });

    it('应该根据状态应用相应类名', () => {
      const file = createMockFile({ status: 'uploading' });
      const { container } = render(<FileItem file={file} {...mockCallbacks} />);
      
      expect(container.firstChild).toHaveClass('QinComponents-file-item--uploading');
    });
  });

  describe('可访问性测试', () => {
    it('应该为文件名提供title属性', () => {
      const file = createMockFile({ name: 'very-long-filename.txt' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      const fileName = screen.getByText('very-long-filename.txt');
      expect(fileName).toHaveAttribute('title', 'very-long-filename.txt');
    });

    it('应该为错误信息提供title属性', () => {
      const errorMessage = '这是一个很长的错误信息，可能会被截断显示';
      const file = createMockFile({
        status: 'error',
        error: errorMessage,
      });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveAttribute('title', errorMessage);
    });

    it('按钮应该具有正确的type属性', () => {
      const file = createMockFile({ status: 'idle' });
      render(<FileItem file={file} {...mockCallbacks} />);
      
      const startButton = screen.getByText('开始');
      const removeButton = screen.getByText('移除');
      
      expect(startButton).toHaveAttribute('type', 'button');
      expect(removeButton).toHaveAttribute('type', 'button');
    });
  });
});
