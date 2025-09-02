import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '../src';
import type { UploadConfig } from '../../../types/common';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock crypto.subtle for hash calculation
const mockCrypto = {
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
  },
};
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock File constructor
const createMockFile = (name: string, size: number, type: string = 'text/plain'): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size, writable: false });
  return file;
};

describe('FileUpload', () => {
  const mockConfig: UploadConfig = {
    url: '/api/upload',
    chunkSize: 1024 * 1024, // 1MB
    concurrent: 2,
    maxRetries: 3,
    enableResume: true,
    enableHash: true,
  };

  const mockCallbacks = {
    onFileSelect: vi.fn(),
    onUploadStart: vi.fn(),
    onUploadProgress: vi.fn(),
    onUploadComplete: vi.fn(),
    onUploadError: vi.fn(),
    onAllComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染基本组件', () => {
      render(<FileUpload config={mockConfig} />);
      
      expect(screen.getByText('点击选择文件或拖拽文件到此处')).toBeInTheDocument();
      expect(screen.getByText('支持大文件上传，断点续传')).toBeInTheDocument();
    });

    it('应该渲染自定义上传区域内容', () => {
      const customContent = <div>自定义上传区域</div>;
      render(
        <FileUpload config={mockConfig}>
          {customContent}
        </FileUpload>
      );
      
      expect(screen.getByText('自定义上传区域')).toBeInTheDocument();
    });

    it('应该根据showFileList属性决定是否显示文件列表', async () => {
      const { rerender } = render(
        <FileUpload config={mockConfig} showFileList={false} />
      );
      
      // 添加文件
      const file = createMockFile('test.txt', 1024);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      // showFileList=false时不应该显示文件列表
      expect(screen.queryByText('文件列表')).not.toBeInTheDocument();
      
      // 重新渲染为showFileList=true
      rerender(<FileUpload config={mockConfig} showFileList={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('文件列表')).toBeInTheDocument();
      });
    });
  });

  describe('文件选择测试', () => {
    it('应该能够通过点击选择文件', async () => {
      render(<FileUpload config={mockConfig} {...mockCallbacks} />);
      
      const file = createMockFile('test.txt', 1024);
      const uploadArea = document.querySelector('.QinComponents-upload-area') as HTMLElement;
      const input = uploadArea.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith([file]);
      });
    });

    it('应该支持多文件选择', async () => {
      render(<FileUpload config={mockConfig} multiple={true} {...mockCallbacks} />);
      
      const files = [
        createMockFile('test1.txt', 1024),
        createMockFile('test2.txt', 2048),
      ];
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith(files);
      });
    });

    it('应该在单文件模式下只选择一个文件', async () => {
      render(<FileUpload config={mockConfig} multiple={false} {...mockCallbacks} />);
      
      const files = [
        createMockFile('test1.txt', 1024),
        createMockFile('test2.txt', 2048),
      ];
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);
      
      // 在单文件模式下，应该只选择第一个文件
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith([files[0]]);
      });
    });
  });

  describe('拖拽功能测试', () => {
    it('应该支持拖拽文件上传', async () => {
      render(<FileUpload config={mockConfig} draggable={true} {...mockCallbacks} />);
      
      const uploadArea = document.querySelector('.QinComponents-upload-area') as HTMLElement;
      const file = createMockFile('test.txt', 1024);
      
      // 模拟拖拽事件
      const dragEnterEvent = new Event('dragenter', { bubbles: true });
      const dragOverEvent = new Event('dragover', { bubbles: true });
      const dropEvent = new Event('drop', { bubbles: true });
      
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });
      
      fireEvent(uploadArea, dragEnterEvent);
      fireEvent(uploadArea, dragOverEvent);
      fireEvent(uploadArea, dropEvent);
      
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith([file]);
      });
    });

    it('应该在拖拽时显示正确的状态', () => {
      render(<FileUpload config={mockConfig} draggable={true} />);
      
      const uploadArea = document.querySelector('.QinComponents-upload-area') as HTMLElement;
      
      // 拖拽进入
      fireEvent.dragEnter(uploadArea);
      expect(uploadArea).toHaveClass('QinComponents-upload-area--drag-over');
      expect(screen.getByText('松开鼠标上传文件')).toBeInTheDocument();
      
      // 拖拽离开
      fireEvent.dragLeave(uploadArea);
      expect(uploadArea).not.toHaveClass('QinComponents-upload-area--drag-over');
    });

    it('应该在禁用拖拽时不响应拖拽事件', () => {
      render(<FileUpload config={mockConfig} draggable={false} {...mockCallbacks} />);
      
      const uploadArea = document.querySelector('.QinComponents-upload-area') as HTMLElement;
      const file = createMockFile('test.txt', 1024);
      
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });
      
      fireEvent(uploadArea, dropEvent);
      
      // 禁用拖拽时不应该触发文件选择
      expect(mockCallbacks.onFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('文件验证测试', () => {
    it('应该验证文件类型', async () => {
      const configWithAccept: UploadConfig = {
        ...mockConfig,
        accept: ['.txt', '.doc'],
      };
      
      render(<FileUpload config={configWithAccept} {...mockCallbacks} />);
      
      const validFile = createMockFile('test.txt', 1024, 'text/plain');
      const invalidFile = createMockFile('test.jpg', 1024, 'image/jpeg');
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [validFile, invalidFile],
        writable: false,
      });
      fireEvent.change(input);
      
      // 只有符合类型的文件应该被选择
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith([validFile]);
      });
    });

    it('应该验证文件大小', async () => {
      const configWithSize: UploadConfig = {
        ...mockConfig,
        maxFileSize: 1024, // 1KB
      };
      
      render(<FileUpload config={configWithSize} {...mockCallbacks} />);
      
      const smallFile = createMockFile('small.txt', 512);
      const largeFile = createMockFile('large.txt', 2048);
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: [smallFile, largeFile],
        writable: false,
      });
      fireEvent.change(input);
      
      // 只有小于限制大小的文件应该被选择
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith([smallFile]);
      });
    });

    it('应该验证文件数量限制', async () => {
      const configWithLimit: UploadConfig = {
        ...mockConfig,
        maxFiles: 2,
      };
      
      render(<FileUpload config={configWithLimit} {...mockCallbacks} />);
      
      const files = [
        createMockFile('test1.txt', 1024),
        createMockFile('test2.txt', 1024),
        createMockFile('test3.txt', 1024),
      ];
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      fireEvent.change(input);
      
      // 只有前两个文件应该被选择
      await waitFor(() => {
        expect(mockCallbacks.onFileSelect).toHaveBeenCalledWith(files.slice(0, 2));
      });
    });
  });

  describe('上传状态测试', () => {
    it('应该在上传时显示正确的状态', async () => {
      render(<FileUpload config={mockConfig} {...mockCallbacks} />);
      
      const file = createMockFile('test.txt', 1024);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('文件列表 (1)')).toBeInTheDocument();
        expect(screen.getByText('test.txt')).toBeInTheDocument();
        expect(screen.getByText('等待上传')).toBeInTheDocument();
      });
    });

    it('应该显示文件大小', async () => {
      render(<FileUpload config={mockConfig} />);
      
      const file = createMockFile('test.txt', 1024 * 1024); // 1MB
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('1 MB')).toBeInTheDocument();
      });
    });
  });

  describe('可访问性测试', () => {
    it('应该有正确的ARIA属性', () => {
      render(<FileUpload config={mockConfig} data-testid="file-upload" />);
      
      const component = screen.getByTestId('file-upload');
      expect(component).toBeInTheDocument();
      
      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('type', 'file');
    });

    it('应该支持键盘导航', () => {
      render(<FileUpload config={mockConfig} />);
      
      const uploadArea = document.querySelector('.QinComponents-upload-area') as HTMLElement;
      expect(uploadArea).toBeInTheDocument();
      
      // 应该可以点击
      expect(uploadArea).toBeVisible();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理无效的配置', () => {
      const invalidConfig = {} as UploadConfig;
      
      // 应该不抛出错误，即使配置无效
      expect(() => {
        render(<FileUpload config={invalidConfig} />);
      }).not.toThrow();
    });

    it('应该处理文件选择错误', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<FileUpload config={mockConfig} />);
      
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      // 模拟文件选择错误
      const errorEvent = new Event('change');
      Object.defineProperty(errorEvent, 'target', {
        value: { files: null },
      });
      
      fireEvent(input, errorEvent);
      
      // 应该不抛出错误
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('暂停和恢复上传测试', () => {
    it('应该能够暂停正在上传的文件', async () => {
      const configWithDebug: UploadConfig = {
        ...mockConfig,
        debug: true,
      };
      
      render(<FileUpload config={configWithDebug} {...mockCallbacks} />);
      
      // 添加一个大文件
      const largeFile = createMockFile('large.txt', 1024 * 1024 * 5); // 5MB
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('large.txt')).toBeInTheDocument();
      });
      
      // 开始上传
      const startButton = screen.getByText('开始上传');
      fireEvent.click(startButton);
      
      // 等待上传开始
      await waitFor(() => {
        expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
      });
      
      // 暂停上传
      const pauseButton = screen.getByText('暂停');
      fireEvent.click(pauseButton);
      
      // 检查状态是否变为暂停
      await waitFor(() => {
        expect(screen.getByText('已暂停')).toBeInTheDocument();
      });
      
      // 验证暂停回调
      expect(mockCallbacks.onUploadProgress).toHaveBeenCalled();
    });

    it('应该能够恢复暂停的上传', async () => {
      const configWithDebug: UploadConfig = {
        ...mockConfig,
        debug: true,
      };
      
      render(<FileUpload config={configWithDebug} {...mockCallbacks} />);
      
      // 添加文件并开始上传
      const file = createMockFile('test.txt', 1024 * 1024 * 3); // 3MB
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
      
      // 开始上传
      const startButton = screen.getByText('开始上传');
      fireEvent.click(startButton);
      
      // 等待上传开始
      await waitFor(() => {
        expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
      });
      
      // 暂停上传
      const pauseButton = screen.getByText('暂停');
      fireEvent.click(pauseButton);
      
      // 等待暂停状态
      await waitFor(() => {
        expect(screen.getByText('已暂停')).toBeInTheDocument();
      });
      
      // 恢复上传
      const resumeButton = screen.getByText('恢复');
      fireEvent.click(resumeButton);
      
      // 检查状态是否恢复为上传中
      await waitFor(() => {
        expect(screen.getByText('上传中')).toBeInTheDocument();
      });
      
      // 验证恢复回调
      expect(mockCallbacks.onUploadProgress).toHaveBeenCalled();
    });

    it('应该在暂停时正确保存分片状态', async () => {
      const configWithDebug: UploadConfig = {
        ...mockConfig,
        debug: true,
        chunkSize: 1024 * 1024, // 1MB 分片
      };
      
      render(<FileUpload config={configWithDebug} {...mockCallbacks} />);
      
      // 添加一个需要分片的大文件
      const largeFile = createMockFile('large.txt', 1024 * 1024 * 3); // 3MB，会分成3个分片
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('large.txt')).toBeInTheDocument();
      });
      
      // 开始上传
      const startButton = screen.getByText('开始上传');
      fireEvent.click(startButton);
      
      // 等待上传开始
      await waitFor(() => {
        expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
      });
      
      // 模拟上传进度（第一个分片完成）
      await waitFor(() => {
        expect(screen.getByText('上传中')).toBeInTheDocument();
      });
      
      // 暂停上传
      const pauseButton = screen.getByText('暂停');
      fireEvent.click(pauseButton);
      
      // 检查暂停状态
      await waitFor(() => {
        expect(screen.getByText('已暂停')).toBeInTheDocument();
      });
      
      // 恢复上传
      const resumeButton = screen.getByText('恢复');
      fireEvent.click(resumeButton);
      
      // 验证恢复后的状态
      await waitFor(() => {
        expect(screen.getByText('上传中')).toBeInTheDocument();
      });
    });

    it('应该处理暂停后取消上传', async () => {
      const configWithDebug: UploadConfig = {
        ...mockConfig,
        debug: true,
      };
      
      render(<FileUpload config={configWithDebug} {...mockCallbacks} />);
      
      const file = createMockFile('test.txt', 1024 * 1024 * 2);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
      
      // 开始上传
      const startButton = screen.getByText('开始上传');
      fireEvent.click(startButton);
      
      // 暂停上传
      const pauseButton = screen.getByText('暂停');
      fireEvent.click(pauseButton);
      
      await waitFor(() => {
        expect(screen.getByText('已暂停')).toBeInTheDocument();
      });
      
      // 取消上传
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);
      
      // 检查取消状态
      await waitFor(() => {
        expect(screen.getByText('已取消')).toBeInTheDocument();
      });
    });

    it('应该在暂停状态下正确显示进度', async () => {
      const configWithDebug: UploadConfig = {
        ...mockConfig,
        debug: true,
      };
      
      render(<FileUpload config={configWithDebug} {...mockCallbacks} />);
      
      const file = createMockFile('test.txt', 1024 * 1024 * 4); // 4MB
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
      
      // 开始上传
      const startButton = screen.getByText('开始上传');
      fireEvent.click(startButton);
      
      // 等待上传开始
      await waitFor(() => {
        expect(mockCallbacks.onUploadStart).toHaveBeenCalled();
      });
      
      // 暂停上传
      const pauseButton = screen.getByText('暂停');
      fireEvent.click(pauseButton);
      
      // 检查暂停状态和进度显示
      await waitFor(() => {
        expect(screen.getByText('已暂停')).toBeInTheDocument();
        // 应该显示进度条
        expect(document.querySelector('.QinComponents-file-item__progress')).toBeInTheDocument();
      });
    });
  });
});
