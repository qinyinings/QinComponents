import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../src';

describe('Input 组件', () => {
  it('应该正确渲染默认输入框', () => {
    render(<Input placeholder="请输入内容" />);
    
    const inputElement = screen.getByPlaceholderText('请输入内容') as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveClass('QinComponents-input');
    expect(inputElement).toHaveClass('QinComponents-input--medium');
    expect(inputElement.type).toBe('text');
  });

  it('应该使用正确的类型属性', () => {
    const { rerender } = render(<Input type="password" placeholder="请输入密码" />);
    let inputElement = screen.getByPlaceholderText('请输入密码') as HTMLInputElement;
    expect(inputElement.type).toBe('password');
    
    rerender(<Input type="email" placeholder="请输入邮箱" />);
    inputElement = screen.getByPlaceholderText('请输入邮箱') as HTMLInputElement;
    expect(inputElement.type).toBe('email');
  });

  it('应该使用正确的尺寸类名', () => {
    const { rerender } = render(<Input size="small" placeholder="小尺寸输入框" />);
    expect(screen.getByPlaceholderText('小尺寸输入框')).toHaveClass('QinComponents-input--small');
    
    rerender(<Input size="large" placeholder="大尺寸输入框" />);
    expect(screen.getByPlaceholderText('大尺寸输入框')).toHaveClass('QinComponents-input--large');
  });

  it('禁用状态的输入框应该有 disabled 属性', () => {
    render(<Input disabled placeholder="禁用状态" />);
    
    const inputElement = screen.getByPlaceholderText('禁用状态');
    expect(inputElement).toBeDisabled();
  });

  it('应该正确显示标签', () => {
    render(<Input label="用户名" placeholder="请输入用户名" />);
    
    expect(screen.getByText('用户名')).toBeInTheDocument();
    expect(screen.getByText('用户名')).toHaveClass('QinComponents-input-label');
  });

  it('应该正确显示错误信息', () => {
    render(<Input error="用户名不能为空" placeholder="请输入用户名" />);
    
    expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
    expect(screen.getByText('用户名不能为空')).toHaveClass('QinComponents-input-error-message');
    expect(screen.getByPlaceholderText('请输入用户名')).toHaveClass('QinComponents-input--error');
  });

  it('应该在输入时触发 onChange 回调', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="请输入内容" onChange={handleChange} />);
    
    const inputElement = screen.getByPlaceholderText('请输入内容');
    fireEvent.change(inputElement, { target: { value: '测试内容' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('应该正确处理受控组件值', () => {
    render(<Input value="初始值" placeholder="请输入内容" readOnly />);
    
    const inputElement = screen.getByPlaceholderText('请输入内容') as HTMLInputElement;
    expect(inputElement.value).toBe('初始值');
  });
}); 