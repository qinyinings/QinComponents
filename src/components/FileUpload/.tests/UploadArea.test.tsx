import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadArea } from '../src/components/UploadArea';

describe('UploadArea', () => {
  const mockProps = {
    draggable: true,
    isDragOver: false,
    isUploading: false,
    onDragEnter: vi.fn(),
    onDragLeave: vi.fn(),
    onDragOver: vi.fn(),
    onDrop: vi.fn(),
    onSelectFiles: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该正确渲染默认内容', () => {
      render(<UploadArea {...mockProps} />);
      
      expect(screen.getByText('点击选择文件或拖拽文件到此处')).toBeInTheDocument();
      expect(screen.getByText('支持大文件上传，断点续传')).toBeInTheDocument();
      expect(screen.getByText('📁')).toBeInTheDocument();
    });

    it('应该渲染自定义子内容', () => {
      const customContent = <div>自定义上传区域内容</div>;
      render(
        <UploadArea {...mockProps}>
          {customContent}
        </UploadArea>
      );
      
      expect(screen.getByText('自定义上传区域内容')).toBeInTheDocument();
      expect(screen.queryByText('点击选择文件或拖拽文件到此处')).not.toBeInTheDocument();
    });

    it('应该在拖拽状态时显示正确的文本', () => {
      render(<UploadArea {...mockProps} isDragOver={true} />);
      
      expect(screen.getByText('松开鼠标上传文件')).toBeInTheDocument();
      expect(screen.queryByText('点击选择文件或拖拽文件到此处')).not.toBeInTheDocument();
    });
  });

  describe('样式类名测试', () => {
    it('应该应用基础类名', () => {
      const { container } = render(<UploadArea {...mockProps} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      expect(uploadArea).toHaveClass('QinComponents-upload-area');
    });

    it('应该在拖拽状态时添加相应类名', () => {
      const { container } = render(<UploadArea {...mockProps} isDragOver={true} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      expect(uploadArea).toHaveClass('QinComponents-upload-area--drag-over');
    });

    it('应该在上传状态时添加相应类名', () => {
      const { container } = render(<UploadArea {...mockProps} isUploading={true} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      expect(uploadArea).toHaveClass('QinComponents-upload-area--uploading');
    });

    it('应该同时应用多个状态类名', () => {
      const { container } = render(
        <UploadArea {...mockProps} isDragOver={true} isUploading={true} />
      );
      const uploadArea = container.firstChild as HTMLElement;
      
      expect(uploadArea).toHaveClass('QinComponents-upload-area--drag-over');
      expect(uploadArea).toHaveClass('QinComponents-upload-area--uploading');
    });
  });

  describe('点击事件测试', () => {
    it('应该在点击时调用onSelectFiles', () => {
      const { container } = render(<UploadArea {...mockProps} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      fireEvent.click(uploadArea);
      
      expect(mockProps.onSelectFiles).toHaveBeenCalledTimes(1);
    });

    it('应该在上传状态时仍然可以点击', () => {
      const { container } = render(<UploadArea {...mockProps} isUploading={true} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      fireEvent.click(uploadArea);
      
      expect(mockProps.onSelectFiles).toHaveBeenCalledTimes(1);
    });
  });

  describe('拖拽事件测试', () => {
    it('应该在启用拖拽时绑定拖拽事件', () => {
      const { container } = render(<UploadArea {...mockProps} draggable={true} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      fireEvent.dragEnter(uploadArea);
      expect(mockProps.onDragEnter).toHaveBeenCalledTimes(1);
      
      fireEvent.dragLeave(uploadArea);
      expect(mockProps.onDragLeave).toHaveBeenCalledTimes(1);
      
      fireEvent.dragOver(uploadArea);
      expect(mockProps.onDragOver).toHaveBeenCalledTimes(1);
      
      fireEvent.drop(uploadArea);
      expect(mockProps.onDrop).toHaveBeenCalledTimes(1);
    });

    it('应该在禁用拖拽时不绑定拖拽事件', () => {
      const { container } = render(<UploadArea {...mockProps} draggable={false} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      // 拖拽事件不应该被绑定，但仍然可以触发（因为是原生事件）
      fireEvent.dragEnter(uploadArea);
      fireEvent.dragLeave(uploadArea);
      fireEvent.dragOver(uploadArea);
      fireEvent.drop(uploadArea);
      
      // 但是回调函数不应该被调用（因为没有绑定事件处理器）
      expect(mockProps.onDragEnter).not.toHaveBeenCalled();
      expect(mockProps.onDragLeave).not.toHaveBeenCalled();
      expect(mockProps.onDragOver).not.toHaveBeenCalled();
      expect(mockProps.onDrop).not.toHaveBeenCalled();
    });
  });

  describe('内容结构测试', () => {
    it('应该包含正确的内容结构', () => {
      render(<UploadArea {...mockProps} />);
      
      const content = screen.getByText('点击选择文件或拖拽文件到此处').closest('.QinComponents-upload-area__content');
      expect(content).toBeInTheDocument();
      
      const icon = screen.getByText('📁').closest('.QinComponents-upload-area__icon');
      expect(icon).toBeInTheDocument();
      
      const text = screen.getByText('点击选择文件或拖拽文件到此处').closest('.QinComponents-upload-area__text');
      expect(text).toBeInTheDocument();
    });

    it('应该在拖拽状态时显示拖拽文本样式', () => {
      render(<UploadArea {...mockProps} isDragOver={true} />);
      
      const dragText = screen.getByText('松开鼠标上传文件');
      expect(dragText).toHaveClass('QinComponents-upload-area__drag-text');
    });

    it('应该在正常状态时显示主文本和副文本', () => {
      render(<UploadArea {...mockProps} isDragOver={false} />);
      
      const mainText = screen.getByText('点击选择文件或拖拽文件到此处');
      expect(mainText).toHaveClass('QinComponents-upload-area__main-text');
      
      const subText = screen.getByText('支持大文件上传，断点续传');
      expect(subText).toHaveClass('QinComponents-upload-area__sub-text');
    });
  });

  describe('可访问性测试', () => {
    it('应该是可点击的元素', () => {
      const { container } = render(<UploadArea {...mockProps} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      expect(uploadArea.tagName.toLowerCase()).toBe('div');
      expect(uploadArea).toBeVisible();
    });

    it('应该具有正确的交互行为', () => {
      const { container } = render(<UploadArea {...mockProps} />);
      const uploadArea = container.firstChild as HTMLElement;
      
      // 应该可以接收焦点（通过点击）
      fireEvent.click(uploadArea);
      expect(mockProps.onSelectFiles).toHaveBeenCalled();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理所有回调函数都未定义的情况', () => {
      const propsWithoutCallbacks = {
        draggable: true,
        isDragOver: false,
        isUploading: false,
        onDragEnter: undefined as any,
        onDragLeave: undefined as any,
        onDragOver: undefined as any,
        onDrop: undefined as any,
        onSelectFiles: undefined as any,
      };
      
      expect(() => {
        render(<UploadArea {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });

    it('应该处理极端状态组合', () => {
      expect(() => {
        render(
          <UploadArea 
            {...mockProps} 
            draggable={false} 
            isDragOver={true} 
            isUploading={true} 
          />
        );
      }).not.toThrow();
    });
  });
});
