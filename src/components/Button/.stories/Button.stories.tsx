import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: '主要按钮',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: '次要按钮',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    label: '轮廓按钮',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    label: '小按钮',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    label: '大按钮',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    label: '禁用按钮',
    size: 'medium',
    disabled: true,
  },
}; 