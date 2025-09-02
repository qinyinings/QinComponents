import type { Meta, StoryObj } from '@storybook/react';
import { PathAnimation } from '../src';

const meta = {
  title: 'Components/PathAnimation',
  component: PathAnimation,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: { type: 'range', min: 200, max: 800, step: 50 } },
    height: { control: { type: 'range', min: 150, max: 600, step: 50 } },
    pathType: {
      control: { type: 'select' },
      options: ['svg', 'bezier', 'linear'],
    },
    duration: { control: { type: 'range', min: 1000, max: 10000, step: 100 } },
    easing: {
      control: { type: 'select' },
      options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'bounce', 'elastic', 'back'],
    },
    autoPlay: { control: 'boolean' },
    loop: { control: 'boolean' },
    delay: { control: { type: 'range', min: 0, max: 3000, step: 100 } },
    trailLength: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    trailPointCount: { control: { type: 'range', min: 5, max: 50, step: 5 } },
    pointSize: { control: { type: 'range', min: 4, max: 20, step: 2 } },
    pointColor: { control: 'color' },
    trailColor: { control: 'color' },
    showPath: { control: 'boolean' },
    pathColor: { control: 'color' },
    pathWidth: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    paused: { control: 'boolean' },
  },
} satisfies Meta<typeof PathAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础贝塞尔曲线动画
export const Default: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'bezier',
    bezierPath: {
      start: { x: 50, y: 150 },
      control1: { x: 150, y: 50 },
      control2: { x: 250, y: 250 },
      end: { x: 350, y: 150 },
    },
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 3000,
    easing: 'ease-out',
  },
};

// SVG 路径动画
export const SVGPath: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'svg',
    svgPath: 'M 50 150 Q 150 50 250 150 T 350 150',
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 4000,
    easing: 'ease-in-out',
    pointColor: '#e74c3c',
    trailColor: '#e74c3c',
    pathColor: '#3498db',
  },
};

// 线性路径动画
export const LinearPath: Story = {
  args: {
    width: 500,
    height: 300,
    pathType: 'linear',
    linearPath: [
      { x: 50, y: 150 },
      { x: 150, y: 100 },
      { x: 250, y: 200 },
      { x: 350, y: 80 },
      { x: 450, y: 150 },
    ],
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 2500,
    easing: 'linear',
    pointColor: '#2ecc71',
    trailColor: '#2ecc71',
  },
};

// 弹跳效果
export const BounceAnimation: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'bezier',
    bezierPath: {
      start: { x: 50, y: 250 },
      control1: { x: 200, y: 50 },
      end: { x: 350, y: 250 },
    },
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 2000,
    easing: 'bounce',
    pointColor: '#9b59b6',
    trailColor: '#9b59b6',
    pathColor: '#ecf0f1',
    pointSize: 12,
    trailLength: 0.4,
  },
};

// 弹性效果
export const ElasticAnimation: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'bezier',
    bezierPath: {
      start: { x: 50, y: 150 },
      control1: { x: 100, y: 100 },
      control2: { x: 300, y: 200 },
      end: { x: 350, y: 150 },
    },
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 3000,
    easing: 'elastic',
    pointColor: '#f39c12',
    trailColor: '#f39c12',
    trailPointCount: 30,
    trailLength: 0.5,
  },
};

// 自定义样式和长拖尾
export const LongTrail: Story = {
  args: {
    width: 600,
    height: 400,
    pathType: 'bezier',
    bezierPath: {
      start: { x: 50, y: 200 },
      control1: { x: 200, y: 50 },
      control2: { x: 400, y: 350 },
      end: { x: 550, y: 200 },
    },
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 4000,
    easing: 'ease-in-out',
    pointColor: '#1abc9c',
    trailColor: '#1abc9c',
    pathColor: '#bdc3c7',
    pointSize: 10,
    trailLength: 0.8,
    trailPointCount: 40,
    pathWidth: 3,
  },
};

// 心形路径
export const HeartPath: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'svg',
    svgPath: 'M 200,100 C 200,80 180,60 150,60 C 120,60 100,80 100,100 C 100,120 120,140 200,200 C 280,140 300,120 300,100 C 300,80 280,60 250,60 C 220,60 200,80 200,100 Z',
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 5000,
    easing: 'ease-out',
    pointColor: '#e91e63',
    trailColor: '#e91e63',
    pathColor: '#fce4ec',
    pointSize: 8,
    trailLength: 0.3,
    pathWidth: 2,
  },
};

// 螺旋路径
export const SpiralPath: Story = {
  args: {
    width: 400,
    height: 400,
    pathType: 'svg',
    svgPath: 'M 200,200 m -150,0 a 150,150 0 0,1 300,0 a 130,130 0 0,1 -260,0 a 110,110 0 0,1 220,0 a 90,90 0 0,1 -180,0 a 70,70 0 0,1 140,0 a 50,50 0 0,1 -100,0 a 30,30 0 0,1 60,0 a 10,10 0 0,1 -20,0',
    showPath: true,
    autoPlay: true,
    loop: true,
    duration: 6000,
    easing: 'linear',
    pointColor: '#673ab7',
    trailColor: '#673ab7',
    pathColor: '#ede7f6',
    pointSize: 6,
    trailLength: 0.2,
    trailPointCount: 25,
  },
};

// 可控制的动画
export const Controllable: Story = {
  args: {
    width: 400,
    height: 300,
    pathType: 'bezier',
    bezierPath: {
      start: { x: 50, y: 150 },
      control1: { x: 150, y: 50 },
      control2: { x: 250, y: 250 },
      end: { x: 350, y: 150 },
    },
    showPath: true,
    autoPlay: false,
    loop: false,
    duration: 3000,
    easing: 'ease-in-out',
    pointColor: '#34495e',
    trailColor: '#34495e',
  },
  render: (args) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <PathAnimation {...args} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              const startBtn = document.querySelector('[data-testid="start-button"]') as HTMLButtonElement;
              startBtn?.click();
            }}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #bdc3c7', 
              borderRadius: '4px', 
              background: '#3498db', 
              color: 'white',
              cursor: 'pointer'
            }}
          >
            开始动画
          </button>
          <button 
            onClick={() => {
              const stopBtn = document.querySelector('[data-testid="stop-button"]') as HTMLButtonElement;
              stopBtn?.click();
            }}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #bdc3c7', 
              borderRadius: '4px', 
              background: '#e74c3c', 
              color: 'white',
              cursor: 'pointer'
            }}
          >
            停止动画
          </button>
        </div>
      </div>
    );
  },
};