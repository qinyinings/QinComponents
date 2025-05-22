import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../src';
import { Button } from '../../Button/src';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    bordered: { control: 'boolean' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础卡片
export const Default: Story = {
  args: {
    title: '卡片标题',
    children: (
      <div>
        <p>这是一个简单的卡片内容示例。</p>
        <p>卡片可用于容纳文字、图像、列表等各种内容。</p>
      </div>
    ),
  },
};

// 无边框卡片
export const NoBorder: Story = {
  args: {
    title: '无边框卡片',
    bordered: false,
    children: '这是一个没有边框的卡片示例。',
  },
};

// 带额外操作的卡片
export const WithExtra: Story = {
  args: {
    title: '带额外操作的卡片',
    extra: <Button label="更多" size="small" variant="outline" />,
    children: '这个卡片的右上角有一个额外的按钮组件。',
  },
};

// 带页脚的卡片
export const WithFooter: Story = {
  args: {
    title: '带页脚的卡片',
    children: '这是卡片的主要内容区域。',
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Button label="取消" variant="outline" size="small" />
        <Button label="确认" size="small" />
      </div>
    ),
  },
}; 