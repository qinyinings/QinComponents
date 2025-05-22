import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 扩展 Vitest 的 expect 方法
expect.extend(matchers);

// 设置 JSDOM 环境或创建必要的浏览器 API mock
// 不要尝试修改 global.navigator，它是只读的
if (!global.window) {
  global.window = {} as Window & typeof globalThis;
}
if (!global.document) {
  global.document = { body: {} } as Document;
}

// 模拟 window.matchMedia
if (global.window && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// 每个测试后自动清理
afterEach(() => {
  cleanup();
}); 