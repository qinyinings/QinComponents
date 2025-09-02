import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PathAnimation } from '../src';

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(() => 1);
global.cancelAnimationFrame = vi.fn();

describe('PathAnimation 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('应该正确渲染默认组件', () => {
    render(<PathAnimation data-testid="path-animation" />);
    
    const container = screen.getByTestId('path-animation');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('QinComponents-pathanimation');
  });

  it('应该应用自定义类名和样式', () => {
    const customClass = 'custom-class';
    const customStyle = { backgroundColor: 'red' };
    
    render(
      <PathAnimation 
        className={customClass} 
        style={customStyle}
        data-testid="path-animation"
      />
    );
    
    const container = screen.getByTestId('path-animation');
    expect(container).toHaveClass('QinComponents-pathanimation');
    expect(container).toHaveClass(customClass);
    expect(container.style.backgroundColor).toBe('red');
  });

  it('应该正确设置宽度和高度', () => {
    render(
      <PathAnimation 
        width={500} 
        height={400}
        data-testid="path-animation"
      />
    );
    
    const container = screen.getByTestId('path-animation');
    expect(container.style.width).toBe('500px');
    expect(container.style.height).toBe('400px');
  });

  it('应该渲染 SVG 元素', () => {
    const { container } = render(<PathAnimation data-testid="path-animation" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('QinComponents-pathanimation-svg');
  });

  it('应该在显示路径时渲染路径元素', () => {
    const { container } = render(
      <PathAnimation 
        showPath={true}
        pathType="bezier"
        bezierPath={{
          start: { x: 0, y: 100 },
          control1: { x: 100, y: 0 },
          end: { x: 200, y: 100 }
        }}
        data-testid="path-animation"
      />
    );
    
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
  });

  it('应该渲染动画点', () => {
    const { container } = render(<PathAnimation data-testid="path-animation" />);
    
    const svg = container.querySelector('svg');
    const point = svg?.querySelector('.QinComponents-pathanimation-point');
    expect(point).toBeInTheDocument();
  });

  it('应该支持贝塞尔路径', () => {
    const bezierPath = {
      start: { x: 0, y: 100 },
      control1: { x: 100, y: 0 },
      end: { x: 200, y: 100 }
    };

    const { container } = render(
      <PathAnimation 
        pathType="bezier"
        bezierPath={bezierPath}
        showPath={true}
        data-testid="path-animation"
      />
    );
    
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toContain('M 0 100 Q 100 0 200 100');
  });

  it('应该支持线性路径', () => {
    const linearPath = [
      { x: 0, y: 100 },
      { x: 100, y: 50 },
      { x: 200, y: 100 }
    ];

    const { container } = render(
      <PathAnimation 
        pathType="linear"
        linearPath={linearPath}
        showPath={true}
        data-testid="path-animation"
      />
    );
    
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toContain('M 0 100 L 100 50 L 200 100');
  });

  it('应该支持 SVG 路径', () => {
    const svgPath = 'M 0 100 Q 100 0 200 100';

    const { container } = render(
      <PathAnimation 
        pathType="svg"
        svgPath={svgPath}
        showPath={true}
        data-testid="path-animation"
      />
    );
    
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path?.getAttribute('d')).toBe(svgPath);
  });

  it('应该触发动画回调', () => {
    const onStart = vi.fn();
    const onProgress = vi.fn();
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    render(
      <PathAnimation 
        autoPlay={true}
        duration={100}
        onStart={onStart}
        onProgress={onProgress}
        onUpdate={onUpdate}
        onComplete={onComplete}
        data-testid="path-animation"
      />
    );

    expect(onStart).toHaveBeenCalled();
  });

  it('应该支持控制按钮', () => {
    render(<PathAnimation autoPlay={false} data-testid="path-animation" />);
    
    const startButton = screen.getByTestId('start-button');
    const stopButton = screen.getByTestId('stop-button');
    
    expect(startButton).toBeInTheDocument();
    expect(stopButton).toBeInTheDocument();
    
    fireEvent.click(startButton);
    fireEvent.click(stopButton);
  });

  it('应该正确处理暂停状态', () => {
    const { rerender } = render(
      <PathAnimation autoPlay={false} paused={false} data-testid="path-animation" />
    );
    
    rerender(
      <PathAnimation autoPlay={false} paused={true} data-testid="path-animation" />
    );
    
    // 基本渲染测试
    const container = screen.getByTestId('path-animation');
    expect(container).toBeInTheDocument();
  });

  it('应该支持自定义颜色和大小', () => {
    const { container } = render(
      <PathAnimation 
        pointColor="#ff0000"
        trailColor="#00ff00"
        pointSize={12}
        data-testid="path-animation"
      />
    );
    
    const svg = container.querySelector('svg');
    const point = svg?.querySelector('.QinComponents-pathanimation-point');
    
    expect(point).toBeInTheDocument();
    expect(point?.getAttribute('fill')).toBe('#ff0000');
    expect(point?.getAttribute('r')).toBe('6'); // pointSize / 2
  });

  it('应该支持循环播放', () => {
    render(
      <PathAnimation 
        autoPlay={false}
        loop={true}
        duration={50}
        data-testid="path-animation"
      />
    );
    
    // 基本渲染测试
    const container = screen.getByTestId('path-animation');
    expect(container).toBeInTheDocument();
  });
});