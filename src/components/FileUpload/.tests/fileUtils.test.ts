import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createFileChunks,
  calculateFileHash,
  formatFileSize,
  formatUploadSpeed,
  formatRemainingTime,
  getFileExtension,
  getFileTypeIcon,
  validateFileType,
  validateFileSize,
  generateId,
} from '../src/utils/fileUtils';

// Mock crypto.subtle
const mockDigest = vi.fn();
const mockCrypto = {
  subtle: {
    digest: mockDigest,
  },
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

describe('fileUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createFileChunks', () => {
    it('应该正确创建文件分片', () => {
      const mockFile = new File(['a'.repeat(5000)], 'test.txt');
      const chunkSize = 1024;
      
      const chunks = createFileChunks(mockFile, chunkSize);
      
      expect(chunks).toHaveLength(5); // 5000 / 1024 = 4.88 -> 5 chunks
      
      // 检查第一个分片
      expect(chunks[0]).toEqual({
        index: 0,
        start: 0,
        end: 1024,
        size: 1024,
        status: 'pending',
        retryCount: 0,
        blob: expect.any(Blob),
      });
      
      // 检查最后一个分片
      const lastChunk = chunks[chunks.length - 1];
      expect(lastChunk).toEqual({
        index: 4,
        start: 4096,
        end: 5000,
        size: 904, // 剩余大小
        status: 'pending',
        retryCount: 0,
        blob: expect.any(Blob),
      });
    });

    it('应该处理小于分片大小的文件', () => {
      const mockFile = new File(['small content'], 'small.txt');
      const chunkSize = 1024;
      
      const chunks = createFileChunks(mockFile, chunkSize);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].size).toBe(mockFile.size);
      expect(chunks[0].start).toBe(0);
      expect(chunks[0].end).toBe(mockFile.size);
    });

    it('应该处理空文件', () => {
      const mockFile = new File([''], 'empty.txt');
      const chunkSize = 1024;
      
      const chunks = createFileChunks(mockFile, chunkSize);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0].size).toBe(0);
    });
  });

  describe('calculateFileHash', () => {
    beforeEach(() => {
      // Mock ArrayBuffer and Uint8Array for hash calculation
      const mockArrayBuffer = new ArrayBuffer(32);
      const mockUint8Array = new Uint8Array([
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
        0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0,
      ]);
      
      mockDigest.mockResolvedValue(mockArrayBuffer);
      
      // Mock Uint8Array constructor
      global.Uint8Array = vi.fn().mockImplementation(() => mockUint8Array);
    });

    it('应该计算文件哈希值', async () => {
      const mockFile = new File(['test content'], 'test.txt');
      
      // Mock file.slice to return a blob with arrayBuffer method
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(13))
      };
      vi.spyOn(mockFile, 'slice').mockReturnValue(mockBlob as any);
      
      const hash = await calculateFileHash(mockFile);
      
      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(ArrayBuffer));
      expect(hash).toBe('123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0');
    });

    it('应该只计算大文件的前1MB', async () => {
      const largeContent = 'a'.repeat(2 * 1024 * 1024); // 2MB
      const mockFile = new File([largeContent], 'large.txt');
      
      // Mock file.slice to return a blob with arrayBuffer method
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024 * 1024))
      };
      const mockSlice = vi.fn().mockReturnValue(mockBlob as any);
      vi.spyOn(mockFile, 'slice').mockImplementation(mockSlice);
      
      await calculateFileHash(mockFile);
      
      expect(mockSlice).toHaveBeenCalledWith(0, 1024 * 1024);
    });

    it('应该处理小文件', async () => {
      const smallContent = 'small';
      const mockFile = new File([smallContent], 'small.txt');
      
      // Mock file.slice to return a blob with arrayBuffer method
      const mockBlob = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(smallContent.length))
      };
      const mockSlice = vi.fn().mockReturnValue(mockBlob as any);
      vi.spyOn(mockFile, 'slice').mockImplementation(mockSlice);
      
      await calculateFileHash(mockFile);
      
      expect(mockSlice).toHaveBeenCalledWith(0, smallContent.length);
    });
  });

  describe('formatFileSize', () => {
    it('应该格式化字节数', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('应该处理小数', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });

    it('应该处理非常大的数字', () => {
      const veryLarge = 5.5 * 1024 * 1024 * 1024 * 1024;
      expect(formatFileSize(veryLarge)).toBe('5.5 TB');
    });
  });

  describe('formatUploadSpeed', () => {
    it('应该格式化上传速度', () => {
      expect(formatUploadSpeed(1024)).toBe('1 KB/s');
      expect(formatUploadSpeed(1024 * 1024)).toBe('1 MB/s');
      expect(formatUploadSpeed(512)).toBe('512 B/s');
    });

    it('应该处理零速度', () => {
      expect(formatUploadSpeed(0)).toBe('0 B/s');
    });
  });

  describe('formatRemainingTime', () => {
    it('应该格式化剩余时间', () => {
      expect(formatRemainingTime(30)).toBe('0:30');
      expect(formatRemainingTime(90)).toBe('1:30');
      expect(formatRemainingTime(3661)).toBe('1:01:01');
      expect(formatRemainingTime(7200)).toBe('2:00:00');
    });

    it('应该处理无效时间', () => {
      expect(formatRemainingTime(Infinity)).toBe('--:--');
      expect(formatRemainingTime(-1)).toBe('--:--');
      expect(formatRemainingTime(NaN)).toBe('--:--');
    });

    it('应该正确填充零', () => {
      expect(formatRemainingTime(5)).toBe('0:05');
      expect(formatRemainingTime(65)).toBe('1:05');
      expect(formatRemainingTime(3605)).toBe('1:00:05');
    });
  });

  describe('getFileExtension', () => {
    it('应该获取文件扩展名', () => {
      expect(getFileExtension('test.txt')).toBe('txt');
      expect(getFileExtension('image.jpeg')).toBe('jpeg');
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('应该处理大写扩展名', () => {
      expect(getFileExtension('IMAGE.JPEG')).toBe('jpeg');
      expect(getFileExtension('Document.PDF')).toBe('pdf');
    });

    it('应该处理没有扩展名的文件', () => {
      expect(getFileExtension('filename')).toBe('');
      expect(getFileExtension('')).toBe('');
    });

    it('应该处理以点开头的文件', () => {
      expect(getFileExtension('.gitignore')).toBe('');
      expect(getFileExtension('.env.example')).toBe('example');
    });
  });

  describe('getFileTypeIcon', () => {
    it('应该返回图片文件图标', () => {
      expect(getFileTypeIcon('image.jpg', 'image/jpeg')).toBe('🖼️');
      expect(getFileTypeIcon('photo.png', 'image/png')).toBe('🖼️');
    });

    it('应该返回视频文件图标', () => {
      expect(getFileTypeIcon('video.mp4', 'video/mp4')).toBe('🎬');
      expect(getFileTypeIcon('movie.avi', 'video/avi')).toBe('🎬');
    });

    it('应该返回音频文件图标', () => {
      expect(getFileTypeIcon('song.mp3', 'audio/mp3')).toBe('🎵');
      expect(getFileTypeIcon('music.wav', 'audio/wav')).toBe('🎵');
    });

    it('应该返回文档文件图标', () => {
      expect(getFileTypeIcon('document.pdf', 'application/pdf')).toBe('📄');
      expect(getFileTypeIcon('text.txt', 'text/plain')).toBe('📄');
      expect(getFileTypeIcon('word.doc', 'application/msword')).toBe('📄');
    });

    it('应该返回表格文件图标', () => {
      expect(getFileTypeIcon('spreadsheet.xls', 'application/excel')).toBe('📊');
      expect(getFileTypeIcon('data.csv', 'text/csv')).toBe('📊');
    });

    it('应该返回演示文稿图标', () => {
      expect(getFileTypeIcon('presentation.ppt', 'application/powerpoint')).toBe('📽️');
      expect(getFileTypeIcon('slides.pptx', 'application/powerpoint')).toBe('📽️');
    });

    it('应该返回压缩文件图标', () => {
      expect(getFileTypeIcon('archive.zip', 'application/zip')).toBe('🗜️');
      expect(getFileTypeIcon('backup.rar', 'application/rar')).toBe('🗜️');
    });

    it('应该返回代码文件图标', () => {
      expect(getFileTypeIcon('script.js', 'text/javascript')).toBe('💻');
      expect(getFileTypeIcon('style.css', 'text/css')).toBe('💻');
      expect(getFileTypeIcon('component.tsx', 'text/typescript')).toBe('💻');
    });

    it('应该返回默认文件图标', () => {
      expect(getFileTypeIcon('unknown.xyz', 'application/unknown')).toBe('📁');
      expect(getFileTypeIcon('file', 'application/octet-stream')).toBe('📁');
    });
  });

  describe('validateFileType', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    it('应该在没有限制时返回true', () => {
      expect(validateFileType(file, [])).toBe(true);
    });

    it('应该验证扩展名', () => {
      expect(validateFileType(file, ['.txt'])).toBe(true);
      expect(validateFileType(file, ['.pdf'])).toBe(false);
      expect(validateFileType(file, ['.TXT'])).toBe(true); // 大小写不敏感
    });

    it('应该验证MIME类型', () => {
      expect(validateFileType(file, ['text/plain'])).toBe(true);
      expect(validateFileType(file, ['text/*'])).toBe(true);
      expect(validateFileType(file, ['image/*'])).toBe(false);
    });

    it('应该支持多个类型', () => {
      expect(validateFileType(file, ['.pdf', '.txt', 'image/*'])).toBe(true);
      expect(validateFileType(file, ['.pdf', '.doc', 'image/*'])).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('应该验证文件大小', () => {
      const smallFile = new File(['small'], 'small.txt');
      const largeFile = new File(['a'.repeat(2000)], 'large.txt');

      expect(validateFileSize(smallFile, 1024)).toBe(true);
      expect(validateFileSize(largeFile, 1024)).toBe(false);
      expect(validateFileSize(largeFile, 3000)).toBe(true);
    });

    it('应该处理边界情况', () => {
      const file = new File(['a'.repeat(1024)], 'exact.txt');

      expect(validateFileSize(file, 1024)).toBe(true);
      expect(validateFileSize(file, 1023)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('应该生成包含时间戳的ID', () => {
      const id = generateId();
      const timestamp = id.split('_')[0];

      expect(Number(timestamp)).toBeGreaterThan(0);
      expect(Number(timestamp)).toBeLessThanOrEqual(Date.now());
    });

    it('应该生成包含随机字符串的ID', () => {
      const id = generateId();
      const parts = id.split('_');

      expect(parts).toHaveLength(2);
      expect(parts[1]).toMatch(/^[a-z0-9]+$/);
      expect(parts[1].length).toBeGreaterThan(0);
    });
  });
});
