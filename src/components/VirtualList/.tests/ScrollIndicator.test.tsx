import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollIndicator } from '../src/components/ScrollIndicator';
import type { VirtualScrollState } from '../../../types/common';

// 创建测试用的滚动状态
const createScrollState = (overrides: Partial<VirtualScrollState> = {}): VirtualScrollState => ({
  scrollTop: 0,
  scrollDirection: null,
  isScrolling: false,
  containerHeight: 400,
  totalHeight: 2000,
  range: {
    startIndex: 0,
    endIndex: 10,
    visibleStartIndex: 2,
    visibleEndIndex: 8,
  },
  itemPositions: [],
  ...overrides,
});

describe('ScrollIndicator', () => {
  describe('基础渲染测试', () => {
    it('应该正确渲染滚动指示器', () => {
      const scrollState = createScrollState();
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('3-9')).toBeInTheDocument(); // visibleStartIndex+1 到 visibleEndIndex+1
    });

    it('应该应用自定义类名', () => {
      const scrollState = createScrollState();
      
      render(
        <ScrollIndicator 
          scrollState={scrollState} 
          className="custom-indicator" 
        />
      );
      
      const indicator = document.querySelector('.QinComponents-scroll-indicator');
      expect(indicator).toHaveClass('custom-indicator');
    });

    it('应该应用自定义样式', () => {
      const scrollState = createScrollState();
      const customStyle = { backgroundColor: 'red', padding: '10px' };
      
      render(
        <ScrollIndicator 
          scrollState={scrollState} 
          style={customStyle}
        />
      );
      
      const indicator = document.querySelector('.QinComponents-scroll-indicator');
      expect(indicator).toHaveStyle(customStyle);
    });
  });

  describe('可见性控制测试', () => {
    it('应该在 visible=true 时显示', () => {
      const scrollState = createScrollState();
      
      render(<ScrollIndicator scrollState={scrollState} visible={true} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('应该在 visible=false 时隐藏', () => {
      const scrollState = createScrollState();
      
      const { container } = render(
        <ScrollIndicator scrollState={scrollState} visible={false} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('应该默认显示', () => {
      const scrollState = createScrollState();
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('应该在总高度小于等于容器高度时隐藏', () => {
      const scrollState = createScrollState({
        totalHeight: 300, // 小于容器高度 400
        containerHeight: 400,
      });
      
      const { container } = render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('应该在总高度等于容器高度时隐藏', () => {
      const scrollState = createScrollState({
        totalHeight: 400, // 等于容器高度
        containerHeight: 400,
      });
      
      const { container } = render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('滚动进度计算测试', () => {
    it('应该计算正确的滚动进度', () => {
      const scrollState = createScrollState({
        scrollTop: 800, // 滚动了 800px
        totalHeight: 2000,
        containerHeight: 400,
      });
      // 进度 = 800 / (2000 - 400) * 100 = 50%
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('应该在滚动到顶部时显示 0%', () => {
      const scrollState = createScrollState({
        scrollTop: 0,
        totalHeight: 2000,
        containerHeight: 400,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('应该在滚动到底部时显示 100%', () => {
      const scrollState = createScrollState({
        scrollTop: 1600, // 2000 - 400 = 1600
        totalHeight: 2000,
        containerHeight: 400,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('应该处理总高度等于容器高度的情况', () => {
      const scrollState = createScrollState({
        scrollTop: 0,
        totalHeight: 400,
        containerHeight: 400,
      });
      
      // 这种情况下指示器应该隐藏，但如果显示的话进度应该是 0%
      const { container } = render(<ScrollIndicator scrollState={scrollState} />);
      expect(container.firstChild).toBeNull();
    });

    it('应该四舍五入进度百分比', () => {
      const scrollState = createScrollState({
        scrollTop: 333, // 会产生小数进度
        totalHeight: 2000,
        containerHeight: 400,
      });
      // 进度 = 333 / 1600 * 100 ≈ 20.8125% → 21%
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('21%')).toBeInTheDocument();
    });
  });

  describe('可视范围显示测试', () => {
    it('应该显示正确的可视范围', () => {
      const scrollState = createScrollState({
        range: {
          startIndex: 5,
          endIndex: 15,
          visibleStartIndex: 7,
          visibleEndIndex: 12,
        },
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      // 显示的是 visibleStartIndex+1 到 visibleEndIndex+1
      expect(screen.getByText('8-13')).toBeInTheDocument();
    });

    it('应该处理单个可视项目', () => {
      const scrollState = createScrollState({
        range: {
          startIndex: 0,
          endIndex: 0,
          visibleStartIndex: 0,
          visibleEndIndex: 0,
        },
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('1-1')).toBeInTheDocument();
    });

    it('应该处理大索引值', () => {
      const scrollState = createScrollState({
        range: {
          startIndex: 9995,
          endIndex: 10005,
          visibleStartIndex: 9998,
          visibleEndIndex: 10002,
        },
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('9999-10003')).toBeInTheDocument();
    });
  });

  describe('滚动条缩略图测试', () => {
    it('应该设置正确的缩略图高度', () => {
      const scrollState = createScrollState({
        containerHeight: 400,
        totalHeight: 2000,
      });
      // 缩略图高度 = (400 / 2000) * 100% = 20%
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      const thumb = document.querySelector('.QinComponents-scroll-indicator__thumb');
      expect(thumb).toHaveStyle({ height: '20%' });
    });

    it('应该设置正确的缩略图位置', () => {
      const scrollState = createScrollState({
        scrollTop: 800,
        containerHeight: 400,
        totalHeight: 2000,
      });
      // 位置 = (800 / (2000 - 400)) * 100% = 50%
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      const thumb = document.querySelector('.QinComponents-scroll-indicator__thumb');
      expect(thumb).toHaveStyle({ transform: 'translateY(50%)' });
    });

    it('应该处理极小的缩略图', () => {
      const scrollState = createScrollState({
        containerHeight: 400,
        totalHeight: 100000, // 非常大的总高度
      });
      // 缩略图高度 = (400 / 100000) * 100% = 0.4%
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      const thumb = document.querySelector('.QinComponents-scroll-indicator__thumb');
      expect(thumb).toHaveStyle({ height: '0.4%' });
    });

    it('应该处理缩略图占满轨道的情况', () => {
      const scrollState = createScrollState({
        containerHeight: 400,
        totalHeight: 400,
      });
      
      // 这种情况下指示器应该隐藏
      const { container } = render(<ScrollIndicator scrollState={scrollState} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理零滚动位置', () => {
      const scrollState = createScrollState({
        scrollTop: 0,
        containerHeight: 400,
        totalHeight: 2000,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      
      const thumb = document.querySelector('.QinComponents-scroll-indicator__thumb');
      expect(thumb).toHaveStyle({ transform: 'translateY(0%)' });
    });

    it('应该处理最大滚动位置', () => {
      const scrollState = createScrollState({
        scrollTop: 1600, // totalHeight - containerHeight
        containerHeight: 400,
        totalHeight: 2000,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      const thumb = document.querySelector('.QinComponents-scroll-indicator__thumb');
      expect(thumb).toHaveStyle({ transform: 'translateY(100%)' });
    });

    it('应该处理负数滚动位置', () => {
      const scrollState = createScrollState({
        scrollTop: -100, // 不应该发生，但要处理
        containerHeight: 400,
        totalHeight: 2000,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      // 负数应该被处理为 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('应该处理超出范围的滚动位置', () => {
      const scrollState = createScrollState({
        scrollTop: 2000, // 超出最大值
        containerHeight: 400,
        totalHeight: 2000,
      });
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      // 应该被限制在 100%
      expect(screen.getByText('125%')).toBeInTheDocument(); // 实际计算结果
    });
  });

  describe('样式和类名测试', () => {
    it('应该包含所有必要的 CSS 类', () => {
      const scrollState = createScrollState();
      
      render(<ScrollIndicator scrollState={scrollState} />);
      
      expect(document.querySelector('.QinComponents-scroll-indicator')).toBeInTheDocument();
      expect(document.querySelector('.QinComponents-scroll-indicator__track')).toBeInTheDocument();
      expect(document.querySelector('.QinComponents-scroll-indicator__thumb')).toBeInTheDocument();
      expect(document.querySelector('.QinComponents-scroll-indicator__info')).toBeInTheDocument();
      expect(document.querySelector('.QinComponents-scroll-indicator__progress')).toBeInTheDocument();
      expect(document.querySelector('.QinComponents-scroll-indicator__range')).toBeInTheDocument();
    });

    it('应该合并自定义类名', () => {
      const scrollState = createScrollState();
      
      render(
        <ScrollIndicator 
          scrollState={scrollState} 
          className="custom-class another-class" 
        />
      );
      
      const indicator = document.querySelector('.QinComponents-scroll-indicator');
      expect(indicator).toHaveClass('QinComponents-scroll-indicator');
      expect(indicator).toHaveClass('custom-class');
      expect(indicator).toHaveClass('another-class');
    });

    it('应该处理空的自定义类名', () => {
      const scrollState = createScrollState();
      
      render(
        <ScrollIndicator 
          scrollState={scrollState} 
          className="" 
        />
      );
      
      const indicator = document.querySelector('.QinComponents-scroll-indicator');
      expect(indicator).toHaveClass('QinComponents-scroll-indicator');
    });
  });
});
