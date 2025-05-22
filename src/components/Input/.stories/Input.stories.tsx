import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../src';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: '请输入内容',
    size: 'medium',
  },
};

export const WithLabel: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
    size: 'medium',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    label: '密码',
    placeholder: '请输入密码',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    placeholder: '小尺寸输入框',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    placeholder: '大尺寸输入框',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: '禁用状态',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: '用户名',
    placeholder: '请输入用户名',
    error: '用户名不能为空',
    size: 'medium',
  },
}; 