import type { ChunkInfo, UploadFileInfo } from '../../../../types/common';

/**
 * 上传分片参数接口
 */
interface UploadChunkParams {
  url: string;
  chunk: ChunkInfo;
  fileInfo: UploadFileInfo;
  headers?: Record<string, string>;
  data?: Record<string, any>;
  abortSignal?: AbortSignal;
}

/**
 * 上传单个分片
 */
export const uploadChunk = async ({
  url,
  chunk,
  fileInfo,
  headers = {},
  data = {},
  abortSignal,
}: UploadChunkParams): Promise<void> => {
  const formData = new FormData();
  
  // 添加分片数据
  formData.append('chunk', chunk.blob);
  formData.append('chunkIndex', chunk.index.toString());
  formData.append('chunkSize', chunk.size.toString());
  formData.append('chunkStart', chunk.start.toString());
  formData.append('chunkEnd', chunk.end.toString());
  
  // 添加文件信息
  formData.append('fileName', fileInfo.name);
  formData.append('fileSize', fileInfo.size.toString());
  formData.append('fileType', fileInfo.type);
  formData.append('totalChunks', fileInfo.chunks.length.toString());
  
  // 添加文件哈希（用于断点续传）
  if (fileInfo.hash) {
    formData.append('fileHash', fileInfo.hash);
  }
  
  // 添加分片哈希
  if (chunk.hash) {
    formData.append('chunkHash', chunk.hash);
  }
  
  // 添加额外数据
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      // 不要设置 Content-Type，让浏览器自动设置 multipart/form-data
    },
    body: formData,
    signal: abortSignal,
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '未知错误');
    throw new Error(`分片上传失败: ${response.status} ${errorText}`);
  }
  
  // 检查响应
  const result = await response.json().catch(() => ({}));
  
  if (result.error) {
    throw new Error(result.error);
  }
};

/**
 * 检查分片是否已存在（用于断点续传）
 */
export const checkChunkExists = async (
  url: string,
  fileHash: string,
  chunkIndex: number,
  headers?: Record<string, string>
): Promise<boolean> => {
  try {
    const checkUrl = `${url}/check`;
    const response = await fetch(checkUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        fileHash,
        chunkIndex,
      }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.exists === true;
  } catch (error) {
    // 如果检查失败，假设分片不存在
    console.warn('检查分片存在性失败:', error);
    return false;
  }
};

/**
 * 合并文件分片（通知服务器合并）
 */
export const mergeChunks = async (
  url: string,
  fileInfo: UploadFileInfo,
  headers?: Record<string, string>
): Promise<{ success: boolean; fileUrl?: string; error?: string }> => {
  try {
    const mergeUrl = `${url}/merge`;
    const response = await fetch(mergeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        fileName: fileInfo.name,
        fileSize: fileInfo.size,
        fileType: fileInfo.type,
        fileHash: fileInfo.hash,
        totalChunks: fileInfo.chunks.length,
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `合并失败: ${response.status}`,
      };
    }
    
    return {
      success: true,
      fileUrl: result.fileUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '合并请求失败',
    };
  }
};

/**
 * 取消上传（通知服务器清理）
 */
export const cancelUpload = async (
  url: string,
  fileHash: string,
  headers?: Record<string, string>
): Promise<void> => {
  try {
    const cancelUrl = `${url}/cancel`;
    await fetch(cancelUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        fileHash,
      }),
    });
  } catch (error) {
    console.warn('取消上传通知失败:', error);
  }
};

/**
 * 获取上传进度（从服务器获取）
 */
export const getUploadProgress = async (
  url: string,
  fileHash: string,
  headers?: Record<string, string>
): Promise<{
  uploadedChunks: number[];
  totalChunks: number;
  uploadedSize: number;
  totalSize: number;
} | null> => {
  try {
    const progressUrl = `${url}/progress`;
    const response = await fetch(progressUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        fileHash,
      }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.warn('获取上传进度失败:', error);
    return null;
  }
};

/**
 * 计算上传速度
 */
export const calculateUploadSpeed = (
  uploadedBytes: number,
  startTime: number,
  currentTime: number = Date.now()
): number => {
  const elapsedSeconds = (currentTime - startTime) / 1000;
  if (elapsedSeconds <= 0) return 0;
  
  return uploadedBytes / elapsedSeconds;
};

/**
 * 计算剩余时间
 */
export const calculateRemainingTime = (
  totalBytes: number,
  uploadedBytes: number,
  uploadSpeed: number
): number => {
  if (uploadSpeed <= 0 || uploadedBytes >= totalBytes) {
    return 0;
  }
  
  const remainingBytes = totalBytes - uploadedBytes;
  return remainingBytes / uploadSpeed;
};

/**
 * 创建重试延迟（指数退避）
 */
export const createRetryDelay = (
  baseDelay: number,
  attempt: number,
  maxDelay: number = 10000
): number => {
  if (baseDelay < 0) return 0;
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
};
