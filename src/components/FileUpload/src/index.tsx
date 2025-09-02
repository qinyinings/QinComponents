import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { 
  BaseComponentProps, 
  UploadConfig,
  UploadFileInfo
} from '../../../types/common';
import { useUploadManager } from './hooks/useUploadManager';
import { FileList } from './components/FileList';
import { UploadArea } from './components/UploadArea';
import './index.scss';

/**
 * FileUpload 组件属性接口
 */
export interface FileUploadProps extends BaseComponentProps {
  /**
   * 上传配置
   */
  config: UploadConfig;
  
  /**
   * 是否支持多文件上传
   * @default true
   */
  multiple?: boolean;
  
  /**
   * 是否支持拖拽上传
   * @default true
   */
  draggable?: boolean;
  
  /**
   * 是否显示文件列表
   * @default true
   */
  showFileList?: boolean;
  
  /**
   * 是否自动开始上传
   * 当为 true 时，文件选择后立即开始上传
   * 当 showFileList 为 false 时，默认为 true
   * @default undefined (根据 showFileList 自动决定)
   */
  autoUpload?: boolean;
  
  /**
   * 自动上传策略
   * - 'immediate': 立即上传所有文件（可能并发）
   * - 'queue': 排队上传，一个文件完成后再上传下一个
   * - 'smart': 智能模式，根据当前上传状态决定
   * @default 'smart'
   */
  autoUploadStrategy?: 'immediate' | 'queue' | 'smart';
  
  /**
   * 自定义上传区域内容
   */
  children?: React.ReactNode;
  
  /**
   * 文件选择回调
   */
  onFileSelect?: (files: File[]) => void;
  
  /**
   * 上传开始回调
   */
  onUploadStart?: (fileInfo: UploadFileInfo) => void;
  
  /**
   * 上传进度回调
   */
  onUploadProgress?: (fileInfo: UploadFileInfo) => void;
  
  /**
   * 上传完成回调
   */
  onUploadComplete?: (fileInfo: UploadFileInfo) => void;
  
  /**
   * 上传错误回调
   */
  onUploadError?: (fileInfo: UploadFileInfo, error: string) => void;
  
  /**
   * 所有文件上传完成回调
   */
  onAllComplete?: (files: UploadFileInfo[]) => void;
}

/**
 * 大文件上传组件
 * 支持断点续传、分片失败重试、多文件上传等功能
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  config,
  multiple = true,
  draggable = true,
  showFileList = true,
  autoUpload,
  autoUploadStrategy = 'smart',
  children,
  className = '',
  style,
  onFileSelect,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onAllComplete,
  'data-testid': testId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const filesRef = useRef<UploadFileInfo[]>([]);
  
  // 计算是否应该自动上传
  // 如果明确设置了 autoUpload，使用该值；否则当不显示文件列表时默认自动上传
  const shouldAutoUpload = autoUpload !== undefined ? autoUpload : !showFileList;
  
  const {
    files,
    isUploading,
    addFiles,
    removeFile,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearCompleted
  } = useUploadManager({
    config,
    onUploadStart,
    onUploadProgress,
    onUploadComplete: (fileInfo) => {
      onUploadComplete?.(fileInfo);
      // 如果是队列模式且启用了自动上传，尝试上传下一个文件
      if (shouldAutoUpload && autoUploadStrategy === 'queue') {
        setTimeout(() => {
          const nextFile = filesRef.current.find(file => file.status === 'idle' || file.status === 'error');
          if (nextFile) {
            startUpload(nextFile.id);
          }
        }, 100); // 短暂延迟确保状态更新
      }
    },
    onUploadError,
    onAllComplete,
  });

  // 同步 files 状态到 ref
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // 自动上传处理
  const handleAutoUpload = useCallback(() => {
    switch (autoUploadStrategy) {
      case 'immediate':
        // 立即上传所有待上传的文件
        startUpload();
        break;
        
      case 'queue':
        // 排队上传：只有当前没有文件在上传时才开始上传
        if (!isUploading) {
          // 找到第一个待上传的文件
          const nextFile = files.find(file => file.status === 'idle' || file.status === 'error');
          if (nextFile) {
            startUpload(nextFile.id);
          }
        }
        break;
        
      case 'smart':
      default:
        // 智能模式：如果当前有文件在上传，则不启动新的上传；否则上传所有待上传文件
        if (!isUploading) {
          startUpload();
        } else {
          // 如果有文件在上传，可以在这里添加到队列或者等待
          console.log('已有文件在上传中，新文件将等待...');
        }
        break;
    }
  }, [autoUploadStrategy, isUploading, files, startUpload]);

  // 智能模式下，监听上传状态变化，自动开始等待的上传
  useEffect(() => {
    if (shouldAutoUpload && autoUploadStrategy === 'smart' && !isUploading) {
      // 检查是否有待上传的文件
      const pendingFiles = files.filter(file => file.status === 'idle' || file.status === 'error');
      if (pendingFiles.length > 0) {
        // 短暂延迟后开始上传，避免状态更新冲突
        const timer = setTimeout(() => {
          startUpload();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [shouldAutoUpload, autoUploadStrategy, isUploading, files, startUpload]);

  // 文件选择处理
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;
    
    // 验证文件
    const validFiles = selectedFiles.filter(file => {
      // 检查文件类型
      if (config.accept && config.accept.length > 0) {
        const isValidType = config.accept.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(type.replace('*', '.*'));
        });
        if (!isValidType) return false;
      }
      
      // 检查文件大小
      if (config.maxFileSize && file.size > config.maxFileSize) {
        return false;
      }
      
      return true;
    });
    
    // 检查文件数量限制
    let filesToAdd = validFiles;
    if (config.maxFiles) {
      const remainingSlots = config.maxFiles - files.length;
      filesToAdd = validFiles.slice(0, remainingSlots);
    }
    
    if (filesToAdd.length > 0) {
      addFiles(filesToAdd);
      onFileSelect?.(filesToAdd);
      
      // 如果需要自动上传，根据策略决定如何上传
      if (shouldAutoUpload) {
        // 使用 setTimeout 确保文件已经添加到状态中
        setTimeout(() => {
          handleAutoUpload();
        }, 0);
      }
    }
  }, [config, files.length, addFiles, onFileSelect, shouldAutoUpload, handleAutoUpload]);

  // 文件输入变化处理
  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFileSelect(selectedFiles);
    
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  // 拖拽处理
  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // 点击选择文件
  const handleSelectFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 构建className
  const uploadClassName = [
    'QinComponents-file-upload',
    isDragOver && 'QinComponents-file-upload--drag-over',
    isUploading && 'QinComponents-file-upload--uploading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={uploadClassName}
      style={style}
      data-testid={testId}
    >
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={config.accept?.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      
      {/* 上传区域 */}
      <UploadArea
        draggable={draggable}
        isDragOver={isDragOver}
        isUploading={isUploading}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onSelectFiles={handleSelectFiles}
      >
        {children}
      </UploadArea>
      
      {/* 文件列表 */}
      {showFileList && files.length > 0 && (
        <FileList
          files={files}
          onRemove={removeFile}
          onStart={startUpload}
          onPause={pauseUpload}
          onResume={resumeUpload}
          onCancel={cancelUpload}
          onRetry={retryUpload}
          onClearCompleted={clearCompleted}
        />
      )}
    </div>
  );
};

export default FileUpload;
