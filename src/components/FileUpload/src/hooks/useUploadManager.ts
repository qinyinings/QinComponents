import { useState, useCallback, useRef } from 'react';
import type { 
  UploadConfig,
  UploadFileInfo,
  ChunkInfo,
  ChunkStatus,
} from '../../../../types/common';
import { createFileChunks, calculateFileHash } from '../utils/fileUtils';
import { uploadChunk, checkChunkExists } from '../utils/uploadUtils';

interface UseUploadManagerProps {
  config: UploadConfig;
  onUploadStart?: (fileInfo: UploadFileInfo) => void;
  onUploadProgress?: (fileInfo: UploadFileInfo) => void;
  onUploadComplete?: (fileInfo: UploadFileInfo) => void;
  onUploadError?: (fileInfo: UploadFileInfo, error: string) => void;
  onAllComplete?: (files: UploadFileInfo[]) => void;
}

interface UseUploadManagerReturn {
  files: UploadFileInfo[];
  isUploading: boolean;
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  startUpload: (fileId?: string) => void;
  pauseUpload: (fileId: string) => void;
  resumeUpload: (fileId: string) => void;
  cancelUpload: (fileId: string) => void;
  retryUpload: (fileId: string) => void;
  clearCompleted: () => void;
}

export const useUploadManager = ({
  config,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onAllComplete,
}: UseUploadManagerProps): UseUploadManagerReturn => {
  const [files, setFiles] = useState<UploadFileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadingFiles = useRef<Set<string>>(new Set());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());
  const filesRef = useRef<UploadFileInfo[]>([]);

  // 同步 files 状态到 ref
  filesRef.current = files;

  // 生成文件ID
  const generateFileId = useCallback(() => {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 创建文件信息
  const createFileInfo = useCallback(async (file: File): Promise<UploadFileInfo> => {
    const fileId = generateFileId();
    const chunks = createFileChunks(file, config.chunkSize || 1024 * 1024 * 2);
    
    let hash: string | undefined;
    if (config.enableHash !== false) {
      try {
        hash = await calculateFileHash(file);
      } catch (error) {
        console.warn('计算文件哈希失败:', error);
      }
    }

    return {
      id: fileId,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'idle',
      progress: 0,
      uploadedSize: 0,
      chunks,
      hash,
    };
  }, [generateFileId, config.chunkSize, config.enableHash]);

  // 添加文件
  const addFiles = useCallback(async (newFiles: File[]) => {
    const fileInfos = await Promise.all(
      newFiles.map(file => createFileInfo(file))
    );
    
    setFiles(prevFiles => [...prevFiles, ...fileInfos]);
  }, [createFileInfo]);

  // 移除文件
  const removeFile = useCallback((fileId: string) => {
    if (uploadingFiles.current.has(fileId)) {
      const controller = abortControllers.current.get(fileId);
      controller?.abort();
      uploadingFiles.current.delete(fileId);
      abortControllers.current.delete(fileId);
    }
    
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  }, []);

  // 更新文件状态
  const updateFileStatus = useCallback((fileId: string, updates: Partial<UploadFileInfo>) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      )
    );
  }, []);

  // 更新分片状态
  const updateChunkStatus = useCallback((fileId: string, chunkIndex: number, updates: Partial<ChunkInfo>) => {
    setFiles(prevFiles => 
      prevFiles.map(file => {
        if (file.id !== fileId) return file;
        
        const updatedChunks = file.chunks.map(chunk =>
          chunk.index === chunkIndex ? { ...chunk, ...updates } : chunk
        );
        
        const completedSize = updatedChunks
          .filter(chunk => chunk.status === 'completed')
          .reduce((total, chunk) => total + chunk.size, 0);
        
        const progress = Math.round((completedSize / file.size) * 100);
        const allCompleted = updatedChunks.every(chunk => chunk.status === 'completed');
        
        return {
          ...file,
          chunks: updatedChunks,
          progress,
          uploadedSize: completedSize,
          status: allCompleted && file.status === 'uploading' ? 'completed' : file.status,
        };
      })
    );
  }, []);

  // 上传单个分片
  const uploadSingleChunk = useCallback(async (
    fileInfo: UploadFileInfo,
    chunk: ChunkInfo,
    abortSignal: AbortSignal
  ): Promise<void> => {
    const maxRetries = config.maxRetries || 3;
    const retryDelay = config.retryDelay || 1000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (abortSignal.aborted) {
        throw new Error('上传已取消');
      }
      
      try {
        updateChunkStatus(fileInfo.id, chunk.index, {
          status: 'uploading',
          retryCount: attempt,
        });
        
        // 检查分片是否已存在（断点续传）
        if (config.enableResume !== false && fileInfo.hash && chunk.hash) {
          const exists = await checkChunkExists(
            config.url,
            fileInfo.hash,
            chunk.index,
            config.headers
          );
          
          if (exists) {
            updateChunkStatus(fileInfo.id, chunk.index, { status: 'completed' });
            return;
          }
        }
        
        await uploadChunk({
          url: config.url,
          chunk,
          fileInfo,
          headers: config.headers,
          data: config.data,
          abortSignal,
        });
        
        updateChunkStatus(fileInfo.id, chunk.index, { status: 'completed' });
        return;
      } catch (error) {
        if (abortSignal.aborted) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        } else {
          updateChunkStatus(fileInfo.id, chunk.index, {
            status: 'error',
            retryCount: maxRetries,
          });
          throw error;
        }
      }
    }
  }, [config, updateChunkStatus]);

  // 上传单个文件
  const uploadSingleFile = useCallback(async (fileInfo: UploadFileInfo): Promise<void> => {
    if (uploadingFiles.current.has(fileInfo.id)) {
      return;
    }
    
    const controller = new AbortController();
    abortControllers.current.set(fileInfo.id, controller);
    uploadingFiles.current.add(fileInfo.id);
    
    try {
      updateFileStatus(fileInfo.id, {
        status: 'uploading',
        startTime: Date.now(),
      });
      
      onUploadStart?.(fileInfo);
      
      const pendingChunks = fileInfo.chunks.filter(
        chunk => chunk.status === 'pending' || chunk.status === 'error'
      );
      
      if (pendingChunks.length === 0) {
        updateFileStatus(fileInfo.id, {
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
        });
        onUploadComplete?.(fileInfo);
        return;
      }
      
      const concurrent = config.concurrent || 3;
      
      for (let i = 0; i < pendingChunks.length; i += concurrent) {
        const batch = pendingChunks.slice(i, i + concurrent);
        const batchPromises = batch.map(chunk => 
          uploadSingleChunk(fileInfo, chunk, controller.signal)
        );
        
        try {
          await Promise.all(batchPromises);
        } catch (error) {
          console.warn('分片批次上传失败:', error);
        }
        
        if (controller.signal.aborted) {
          const currentFile = filesRef.current.find(f => f.id === fileInfo.id);
          if (currentFile?.status === 'paused') {
            return;
          }
          throw new Error('上传已取消');
        }
        
        const currentFile = filesRef.current.find(f => f.id === fileInfo.id);
        if (currentFile) {
          onUploadProgress?.(currentFile);
        }
      }
      
      const currentFile = filesRef.current.find(f => f.id === fileInfo.id);
      if (!currentFile) {
        throw new Error('文件信息丢失');
      }
      
      if (currentFile.status === 'paused') {
        return;
      }
      
      const failedChunks = currentFile.chunks.filter(chunk => chunk.status === 'error');
      if (failedChunks.length > 0) {
        throw new Error(`${failedChunks.length} 个分片上传失败`);
      }
      
      updateFileStatus(fileInfo.id, {
        status: 'completed',
        progress: 100,
        endTime: Date.now(),
      });
      
      onUploadComplete?.(currentFile);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';
      const finalStatus = controller.signal.aborted ? 'cancelled' : 'error';
      
      updateFileStatus(fileInfo.id, {
        status: finalStatus,
        error: finalStatus === 'error' ? errorMessage : undefined,
      });
      
      if (finalStatus === 'error') {
        const currentFile = filesRef.current.find(f => f.id === fileInfo.id);
        if (currentFile) {
          onUploadError?.(currentFile, errorMessage);
        }
      }
    } finally {
      const currentFile = filesRef.current.find(f => f.id === fileInfo.id);
      if (!currentFile || currentFile.status !== 'paused') {
        uploadingFiles.current.delete(fileInfo.id);
        abortControllers.current.delete(fileInfo.id);
        
        const remainingUploading = Array.from(uploadingFiles.current);
        if (remainingUploading.length === 0) {
          setIsUploading(false);
          onAllComplete?.(filesRef.current);
        }
      }
    }
  }, [config, updateFileStatus, updateChunkStatus, uploadSingleChunk, onUploadStart, onUploadProgress, onUploadComplete, onUploadError, onAllComplete]);

  // 开始上传
  const startUpload = useCallback((fileId?: string) => {
    const filesToUpload = fileId 
      ? files.filter(file => file.id === fileId && (file.status === 'idle' || file.status === 'error'))
      : files.filter(file => file.status === 'idle' || file.status === 'error');
    
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    filesToUpload.forEach(file => uploadSingleFile(file));
  }, [files, uploadSingleFile]);

  // 暂停上传
  const pauseUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    if (controller) {
      setFiles(prevFiles => 
        prevFiles.map(file => {
          if (file.id !== fileId) return file;
          
          const updatedChunks = file.chunks.map(chunk => 
            chunk.status === 'uploading' ? { ...chunk, status: 'pending' as ChunkStatus } : chunk
          );
          
          return {
            ...file,
            status: 'paused' as const,
            chunks: updatedChunks,
          };
        })
      );
      
      requestAnimationFrame(() => {
        controller.abort();
        uploadingFiles.current.delete(fileId);
        abortControllers.current.delete(fileId);
      });
    }
  }, []);

  // 恢复上传
  const resumeUpload = useCallback((fileId: string) => {
    const file = filesRef.current.find(f => f.id === fileId);
    if (file && file.status === 'paused') {
      const pendingChunks = file.chunks.filter(
        chunk => chunk.status === 'pending' || chunk.status === 'error'
      );
      
      if (pendingChunks.length > 0) {
        uploadSingleFile(file);
      } else {
        updateFileStatus(fileId, {
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
        });
        onUploadComplete?.(file);
      }
    }
  }, [uploadSingleFile, updateFileStatus, onUploadComplete]);

  // 取消上传
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllers.current.get(fileId);
    
    if (controller) {
      controller.abort();
      updateFileStatus(fileId, { status: 'cancelled' });
    } else {
      const currentFile = filesRef.current.find(f => f.id === fileId);
      if (currentFile?.status === 'paused') {
        updateFileStatus(fileId, { status: 'cancelled' });
      }
    }
  }, [updateFileStatus]);

  // 重试上传
  const retryUpload = useCallback((fileId: string) => {
    const file = filesRef.current.find(f => f.id === fileId);
    if (file && file.status === 'error') {
      const updatedChunks = file.chunks.map(chunk => 
        chunk.status === 'error' ? { ...chunk, status: 'pending' as ChunkStatus, retryCount: 0 } : chunk
      );
      
      updateFileStatus(fileId, {
        status: 'idle',
        error: undefined,
        chunks: updatedChunks,
      });
      
      uploadSingleFile({ ...file, chunks: updatedChunks, status: 'idle' });
    }
  }, [updateFileStatus, uploadSingleFile]);

  // 清除已完成的文件
  const clearCompleted = useCallback(() => {
    setFiles(prevFiles => 
      prevFiles.filter(file => 
        file.status !== 'completed' && file.status !== 'cancelled'
      )
    );
  }, []);

  return {
    files,
    isUploading,
    addFiles,
    removeFile,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearCompleted,
  };
};