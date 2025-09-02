import type { ChunkInfo, ChunkStatus } from '../../../../types/common';

/**
 * 创建文件分片
 */
export const createFileChunks = (file: File, chunkSize: number): ChunkInfo[] => {
  const chunks: ChunkInfo[] = [];
  const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize)); // 至少创建一个分片，即使是空文件
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    
    chunks.push({
      index: i,
      start,
      end,
      size: end - start,
      status: 'pending' as ChunkStatus,
      retryCount: 0,
      blob,
    });
  }
  
  return chunks;
};

/**
 * 计算文件哈希值（使用Web Crypto API）
 */
export const calculateFileHash = async (file: File): Promise<string> => {
  // 对于大文件，只计算前1MB的哈希以提高性能
  const sampleSize = Math.min(file.size, 1024 * 1024);
  const sampleBlob = file.slice(0, sampleSize);
  
  const buffer = await sampleBlob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * 计算分片哈希值
 */
export const calculateChunkHash = async (chunk: Blob): Promise<string> => {
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * 格式化上传速度
 */
export const formatUploadSpeed = (bytesPerSecond: number): string => {
  return `${formatFileSize(bytesPerSecond)}/s`;
};

/**
 * 格式化剩余时间
 */
export const formatRemainingTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) {
    return '--:--';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 获取文件扩展名
 */
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex > 0 ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';
};

/**
 * 获取文件类型图标
 */
export const getFileTypeIcon = (fileName: string, mimeType: string): string => {
  const extension = getFileExtension(fileName);
  
  // 图片文件
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  }
  
  // 视频文件
  if (mimeType.startsWith('video/')) {
    return '🎬';
  }
  
  // 音频文件
  if (mimeType.startsWith('audio/')) {
    return '🎵';
  }
  
  // 文档文件
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  if (docExtensions.includes(extension)) {
    return '📄';
  }
  
  // 表格文件
  const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];
  if (spreadsheetExtensions.includes(extension)) {
    return '📊';
  }
  
  // 演示文稿
  const presentationExtensions = ['ppt', 'pptx'];
  if (presentationExtensions.includes(extension)) {
    return '📽️';
  }
  
  // 压缩文件
  const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
  if (archiveExtensions.includes(extension)) {
    return '🗜️';
  }
  
  // 代码文件
  const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'];
  if (codeExtensions.includes(extension)) {
    return '💻';
  }
  
  // 默认文件图标
  return '📁';
};

/**
 * 验证文件类型
 */
export const validateFileType = (file: File, acceptTypes: string[]): boolean => {
  if (!acceptTypes || acceptTypes.length === 0) {
    return true;
  }
  
  return acceptTypes.some(type => {
    if (type.startsWith('.')) {
      // 扩展名匹配
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else {
      // MIME类型匹配（支持通配符）
      return file.type.match(type.replace('*', '.*'));
    }
  });
};

/**
 * 验证文件大小
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
