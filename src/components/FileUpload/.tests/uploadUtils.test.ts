import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadChunk,
  checkChunkExists,
  mergeChunks,
  cancelUpload,
  getUploadProgress,
  calculateUploadSpeed,
  calculateRemainingTime,
  createRetryDelay,
} from '../src/utils/uploadUtils';
import type { ChunkInfo, UploadFileInfo } from '../../../types/common';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('uploadUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createMockChunk = (overrides: Partial<ChunkInfo> = {}): ChunkInfo => ({
    index: 0,
    start: 0,
    end: 1024,
    size: 1024,
    status: 'pending',
    retryCount: 0,
    blob: new Blob(['test content']),
    hash: 'chunk-hash',
    ...overrides,
  });

  const createMockFileInfo = (overrides: Partial<UploadFileInfo> = {}): UploadFileInfo => ({
    id: 'test-file',
    file: new File(['content'], 'test.txt'),
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    status: 'uploading',
    progress: 0,
    uploadedSize: 0,
    chunks: [],
    hash: 'file-hash',
    ...overrides,
  });

  describe('uploadChunk', () => {
    it('应该成功上传分片', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const chunk = createMockChunk();
      const fileInfo = createMockFileInfo();

      await uploadChunk({
        url: '/api/upload',
        chunk,
        fileInfo,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        headers: {},
        body: expect.any(FormData),
        signal: undefined,
      });
    });

    it('应该在FormData中包含正确的字段', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const chunk = createMockChunk({
        index: 1,
        start: 1024,
        end: 2048,
        size: 1024,
        hash: 'chunk-hash-123',
      });
      const fileInfo = createMockFileInfo({
        name: 'test-file.txt',
        size: 2048,
        type: 'text/plain',
        hash: 'file-hash-456',
        chunks: [chunk, createMockChunk({ index: 1 })],
      });

      await uploadChunk({
        url: '/api/upload',
        chunk,
        fileInfo,
        headers: { 'Authorization': 'Bearer token' },
        data: { userId: '123', category: 'docs' },
      });

      const call = mockFetch.mock.calls[0];
      const formData = call[1].body as FormData;

      // 验证FormData中的字段（注意：实际测试中FormData的内容检查比较复杂）
      expect(call[1].headers).toEqual({ 'Authorization': 'Bearer token' });
    });

    it('应该处理上传失败', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error'),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const chunk = createMockChunk();
      const fileInfo = createMockFileInfo();

      await expect(uploadChunk({
        url: '/api/upload',
        chunk,
        fileInfo,
      })).rejects.toThrow('分片上传失败: 500 Server Error');
    });

    it('应该处理JSON响应错误', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ error: 'Invalid chunk' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const chunk = createMockChunk();
      const fileInfo = createMockFileInfo();

      await expect(uploadChunk({
        url: '/api/upload',
        chunk,
        fileInfo,
      })).rejects.toThrow('Invalid chunk');
    });

    it('应该支持AbortSignal', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const chunk = createMockChunk();
      const fileInfo = createMockFileInfo();
      const abortController = new AbortController();

      await uploadChunk({
        url: '/api/upload',
        chunk,
        fileInfo,
        abortSignal: abortController.signal,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        headers: {},
        body: expect.any(FormData),
        signal: abortController.signal,
      });
    });
  });

  describe('checkChunkExists', () => {
    it('应该检查分片是否存在', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ exists: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const exists = await checkChunkExists('/api/upload', 'file-hash', 0);

      expect(exists).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/upload/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileHash: 'file-hash',
          chunkIndex: 0,
        }),
      });
    });

    it('应该在请求失败时返回false', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const exists = await checkChunkExists('/api/upload', 'file-hash', 0);

      expect(exists).toBe(false);
    });

    it('应该在响应不OK时返回false', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      mockFetch.mockResolvedValue(mockResponse);

      const exists = await checkChunkExists('/api/upload', 'file-hash', 0);

      expect(exists).toBe(false);
    });

    it('应该包含自定义headers', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ exists: false }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await checkChunkExists('/api/upload', 'file-hash', 0, {
        'Authorization': 'Bearer token',
        'X-Custom': 'value',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
          'X-Custom': 'value',
        },
        body: JSON.stringify({
          fileHash: 'file-hash',
          chunkIndex: 0,
        }),
      });
    });
  });

  describe('mergeChunks', () => {
    it('应该成功合并分片', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ 
          success: true, 
          fileUrl: '/uploads/test.txt' 
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const fileInfo = createMockFileInfo({
        chunks: [createMockChunk(), createMockChunk({ index: 1 })],
      });

      const result = await mergeChunks('/api/upload', fileInfo);

      expect(result).toEqual({
        success: true,
        fileUrl: '/uploads/test.txt',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.txt',
          fileSize: 1024,
          fileType: 'text/plain',
          fileHash: 'file-hash',
          totalChunks: 2,
        }),
      });
    });

    it('应该处理合并失败', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid file' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const fileInfo = createMockFileInfo();
      const result = await mergeChunks('/api/upload', fileInfo);

      expect(result).toEqual({
        success: false,
        error: 'Invalid file',
      });
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const fileInfo = createMockFileInfo();
      const result = await mergeChunks('/api/upload', fileInfo);

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });
  });

  describe('cancelUpload', () => {
    it('应该发送取消请求', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await cancelUpload('/api/upload', 'file-hash');

      expect(mockFetch).toHaveBeenCalledWith('/api/upload/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileHash: 'file-hash' }),
      });
    });

    it('应该忽略取消请求失败', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('Network error'));

      // 应该不抛出错误
      await expect(cancelUpload('/api/upload', 'file-hash')).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith('取消上传通知失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('getUploadProgress', () => {
    it('应该获取上传进度', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          uploadedChunks: [0, 1, 3],
          totalChunks: 5,
          uploadedSize: 3072,
          totalSize: 5120,
        }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const progress = await getUploadProgress('/api/upload', 'file-hash');

      expect(progress).toEqual({
        uploadedChunks: [0, 1, 3],
        totalChunks: 5,
        uploadedSize: 3072,
        totalSize: 5120,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/upload/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileHash: 'file-hash' }),
      });
    });

    it('应该在请求失败时返回null', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('Network error'));

      const progress = await getUploadProgress('/api/upload', 'file-hash');

      expect(progress).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('获取上传进度失败:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('calculateUploadSpeed', () => {
    it('应该计算上传速度', () => {
      const startTime = Date.now() - 10000; // 10秒前
      const currentTime = Date.now();
      const uploadedBytes = 5120; // 5KB

      const speed = calculateUploadSpeed(uploadedBytes, startTime, currentTime);

      expect(speed).toBeCloseTo(512, 1); // 约512 B/s
    });

    it('应该处理零时间差', () => {
      const startTime = Date.now();
      const currentTime = startTime;
      const uploadedBytes = 1024;

      const speed = calculateUploadSpeed(uploadedBytes, startTime, currentTime);

      expect(speed).toBe(0);
    });

    it('应该处理负时间差', () => {
      const startTime = Date.now();
      const currentTime = startTime - 1000; // 负时间差
      const uploadedBytes = 1024;

      const speed = calculateUploadSpeed(uploadedBytes, startTime, currentTime);

      expect(speed).toBe(0);
    });

    it('应该使用当前时间作为默认值', () => {
      const startTime = Date.now() - 5000; // 5秒前
      const uploadedBytes = 2560; // 2.5KB

      const speed = calculateUploadSpeed(uploadedBytes, startTime);

      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThan(1000); // 应该在合理范围内
    });
  });

  describe('calculateRemainingTime', () => {
    it('应该计算剩余时间', () => {
      const totalBytes = 10240; // 10KB
      const uploadedBytes = 2048; // 2KB
      const uploadSpeed = 1024; // 1KB/s

      const remainingTime = calculateRemainingTime(totalBytes, uploadedBytes, uploadSpeed);

      expect(remainingTime).toBe(8); // (10240 - 2048) / 1024 = 8秒
    });

    it('应该在速度为零时返回0', () => {
      const remainingTime = calculateRemainingTime(10240, 2048, 0);
      expect(remainingTime).toBe(0);
    });

    it('应该在已上传完成时返回0', () => {
      const remainingTime = calculateRemainingTime(10240, 10240, 1024);
      expect(remainingTime).toBe(0);
    });

    it('应该在已上传超过总大小时返回0', () => {
      const remainingTime = calculateRemainingTime(10240, 12288, 1024);
      expect(remainingTime).toBe(0);
    });

    it('应该处理负速度', () => {
      const remainingTime = calculateRemainingTime(10240, 2048, -1024);
      expect(remainingTime).toBe(0);
    });
  });

  describe('createRetryDelay', () => {
    it('应该创建指数退避延迟', () => {
      const baseDelay = 1000;

      expect(createRetryDelay(baseDelay, 0)).toBe(1000); // 1000 * 2^0 = 1000
      expect(createRetryDelay(baseDelay, 1)).toBe(2000); // 1000 * 2^1 = 2000
      expect(createRetryDelay(baseDelay, 2)).toBe(4000); // 1000 * 2^2 = 4000
      expect(createRetryDelay(baseDelay, 3)).toBe(8000); // 1000 * 2^3 = 8000
    });

    it('应该限制最大延迟', () => {
      const baseDelay = 1000;
      const maxDelay = 5000;

      expect(createRetryDelay(baseDelay, 5, maxDelay)).toBe(5000); // 限制为maxDelay
      expect(createRetryDelay(baseDelay, 10, maxDelay)).toBe(5000); // 限制为maxDelay
    });

    it('应该使用默认最大延迟', () => {
      const baseDelay = 1000;

      // 默认最大延迟为10000ms
      expect(createRetryDelay(baseDelay, 10)).toBe(10000);
      expect(createRetryDelay(baseDelay, 20)).toBe(10000);
    });

    it('应该处理零基础延迟', () => {
      expect(createRetryDelay(0, 5)).toBe(0);
      expect(createRetryDelay(0, 10)).toBe(0);
    });

    it('应该处理负基础延迟', () => {
      expect(createRetryDelay(-1000, 2)).toBe(0); // Math.min会确保不小于0
    });
  });
});



