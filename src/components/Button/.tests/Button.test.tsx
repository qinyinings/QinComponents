import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src';

describe('Button 组件', () => {
  it('应该正确渲染默认按钮', () => {
    render(<Button label="测试按钮" />);
    
    const buttonElement = screen.getByText('测试按钮');
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).toHaveClass('QinComponents-button');
    expect(buttonElement).toHaveClass('QinComponents-button--primary');
    expect(buttonElement).toHaveClass('QinComponents-button--medium');
  });

  it('应该使用正确的自定义类名渲染不同变体的按钮', () => {
    const { rerender } = render(<Button label="测试按钮" variant="secondary" />);
    expect(screen.getByText('测试按钮')).toHaveClass('QinComponents-button--secondary');
    
    rerender(<Button label="测试按钮" variant="outline" />);
    expect(screen.getByText('测试按钮')).toHaveClass('QinComponents-button--outline');
  });

  it('应该使用正确的自定义类名渲染不同尺寸的按钮', () => {
    const { rerender } = render(<Button label="测试按钮" size="small" />);
    expect(screen.getByText('测试按钮')).toHaveClass('QinComponents-button--small');
    
    rerender(<Button label="测试按钮" size="large" />);
    expect(screen.getByText('测试按钮')).toHaveClass('QinComponents-button--large');
  });

  it('禁用状态的按钮应该有 disabled 属性', () => {
    render(<Button label="测试按钮" disabled />);
    
    const buttonElement = screen.getByText('测试按钮');
    expect(buttonElement).toBeDisabled();
  });

  it('点击按钮时应该触发 onClick 回调', () => {
    const handleClick = vi.fn();
    render(<Button label="测试按钮" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('测试按钮'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('禁用状态的按钮点击时不应该触发 onClick 回调', () => {
    const handleClick = vi.fn();
    render(<Button label="测试按钮" onClick={handleClick} disabled />);
    
    fireEvent.click(screen.getByText('测试按钮'));
    expect(handleClick).not.toHaveBeenCalled();
  });
}); 