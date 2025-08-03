import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../src';
import { Button } from '../../Button/src';

describe('Card 组件', () => {
  it('应该正确渲染默认卡片', () => {
    render(<Card>卡片内容</Card>);
    
    const cardElement = screen.getByText('卡片内容').closest('.QinComponents-card');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass('QinComponents-card--bordered');
  });

  it('标题应该正确渲染', () => {
    render(<Card title="卡片标题">卡片内容</Card>);
    
    expect(screen.getByText('卡片标题')).toBeInTheDocument();
    expect(screen.getByText('卡片标题')).toHaveClass('QinComponents-card-title');
  });

  it('无边框卡片应该没有边框类名', () => {
    render(<Card bordered={false}>无边框卡片</Card>);
    
    const cardElement = screen.getByText('无边框卡片').closest('.QinComponents-card');
    expect(cardElement).not.toHaveClass('QinComponents-card--bordered');
  });

  it('额外内容应该正确渲染', () => {
    render(
      <Card 
        title="带额外操作的卡片" 
        extra={<Button label="更多" />}
      >
        卡片内容
      </Card>
    );
    
    expect(screen.getByText('更多')).toBeInTheDocument();
    expect(screen.getByText('更多').closest('.QinComponents-card-extra')).toBeInTheDocument();
  });

  it('底部内容应该正确渲染', () => {
    render(
      <Card 
        title="带页脚的卡片" 
        footer={<Button label="确认" />}
      >
        卡片内容
      </Card>
    );
    
    expect(screen.getByText('确认')).toBeInTheDocument();
    expect(screen.getByText('确认').closest('.QinComponents-card-footer')).toBeInTheDocument();
  });

  it('应该应用自定义类名和样式', () => {
    const customStyle = { backgroundColor: 'lightblue' };
    render(
      <Card 
        className="custom-class" 
        style={customStyle}
      >
        卡片内容
      </Card>
    );
    
    const cardElement = screen.getByText('卡片内容').closest('.QinComponents-card');
    expect(cardElement).toHaveClass('custom-class');
    
    if (cardElement) {
      expect((cardElement as HTMLElement).style.backgroundColor).toBe('lightblue');
    }
  });
}); 