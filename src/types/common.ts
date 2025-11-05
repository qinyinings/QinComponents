// ===========================================
// QinComponents 通用类型定义
// ===========================================

import type { ReactNode, CSSProperties } from 'react';

/**
 * 组件尺寸枚举
 */
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * 按钮变体枚举
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline';

/**
 * 输入框类型枚举
 */
export type InputType = 
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'color';

/**
 * 基础组件属性接口
 */
export interface BaseComponentProps {
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: CSSProperties;
  
  /**
   * 测试标识符
   */
  'data-testid'?: string;
}

/**
 * 可禁用组件属性接口
 */
export interface DisableableProps {
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 尺寸属性接口
 */
export interface SizeProps {
  /**
   * 组件尺寸
   */
  size?: ComponentSize;
}

/**
 * 加载状态属性接口
 */
export interface LoadingProps {
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
}

/**
 * 子元素属性接口
 */
export interface ChildrenProps {
  /**
   * 子元素内容
   */
  children?: ReactNode;
}

/**
 * 必须子元素属性接口
 */
export interface RequiredChildrenProps {
  /**
   * 子元素内容
   */
  children: ReactNode;
}

/**
 * 表单字段通用属性
 */
export interface FormFieldProps {
  /**
   * 字段名称
   */
  name?: string;
  
  /**
   * 字段ID
   */
  id?: string;
  
  /**
   * 字段标签
   */
  label?: string;
  
  /**
   * 错误信息
   */
  error?: string;
  
  /**
   * 帮助文本
   */
  helperText?: string;
  
  /**
   * 是否必填
   */
  required?: boolean;
}

/**
 * 键盘事件处理器类型
 */
export type KeyboardEventHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;

/**
 * 鼠标事件处理器类型
 */
export type MouseEventHandler<T = HTMLElement> = (event: React.MouseEvent<T>) => void;

/**
 * 焦点事件处理器类型
 */
export type FocusEventHandler<T = HTMLElement> = (event: React.FocusEvent<T>) => void;

/**
 * 输入变化事件处理器类型
 */
export type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;

/**
 * 工具类型：排除某些属性
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * 工具类型：可选属性
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 工具类型：合并两个类型
 */
export type Merge<T, U> = Omit<T, Extract<keyof T, keyof U>> & U;

/**
 * 动画缓动函数类型
 */
export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | 'back'
  | string; // 支持自定义贝塞尔曲线

/**
 * 路径类型
 */
export type PathType = 'svg' | 'bezier' | 'linear';

/**
 * 点的位置坐标
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 贝塞尔曲线路径定义
 */
export interface BezierPath {
  start: Point;
  control1: Point;
  control2?: Point; // 三次贝塞尔曲线的第二个控制点（可选）
  end: Point;
}

/**
 * 动画回调函数类型
 */
export type AnimationCallback = () => void;

/**
 * 动画进度回调函数类型
 */
export type AnimationProgressCallback = (progress: number) => void;

/**
 * 动画更新回调函数类型
 */
export type AnimationUpdateCallback = (position: Point, progress: number) => void;

/**
 * 文件上传状态枚举
 */
export type UploadStatus = 'idle' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled';

/**
 * 文件分片状态枚举
 */
export type ChunkStatus = 'pending' | 'uploading' | 'completed' | 'error';

/**
 * 文件分片信息接口
 */
export interface ChunkInfo {
  /**
   * 分片索引
   */
  index: number;
  
  /**
   * 分片开始位置
   */
  start: number;
  
  /**
   * 分片结束位置
   */
  end: number;
  
  /**
   * 分片大小
   */
  size: number;
  
  /**
   * 分片状态
   */
  status: ChunkStatus;
  
  /**
   * 重试次数
   */
  retryCount: number;
  
  /**
   * 分片数据
   */
  blob: Blob;
  
  /**
   * 分片哈希值（用于断点续传）
   */
  hash?: string;
}

/**
 * 上传文件信息接口
 */
export interface UploadFileInfo {
  /**
   * 文件ID
   */
  id: string;
  
  /**
   * 文件对象
   */
  file: File;
  
  /**
   * 文件名
   */
  name: string;
  
  /**
   * 文件大小
   */
  size: number;
  
  /**
   * 文件类型
   */
  type: string;
  
  /**
   * 上传状态
   */
  status: UploadStatus;
  
  /**
   * 上传进度 (0-100)
   */
  progress: number;
  
  /**
   * 已上传大小
   */
  uploadedSize: number;
  
  /**
   * 分片列表
   */
  chunks: ChunkInfo[];
  
  /**
   * 错误信息
   */
  error?: string;
  
  /**
   * 上传速度 (bytes/s)
   */
  speed?: number;
  
  /**
   * 预计剩余时间 (秒)
   */
  estimatedTime?: number;
  
  /**
   * 文件哈希值
   */
  hash?: string;
  
  /**
   * 上传开始时间
   */
  startTime?: number;
  
  /**
   * 上传完成时间
   */
  endTime?: number;
}

/**
 * 上传配置接口
 */
export interface UploadConfig {
  /**
   * 上传URL
   */
  url: string;
  
  /**
   * 分片大小 (字节)
   * @default 1024 * 1024 * 2 (2MB)
   */
  chunkSize?: number;
  
  /**
   * 并发上传数
   * @default 3
   */
  concurrent?: number;
  
  /**
   * 最大重试次数
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * 重试延迟 (毫秒)
   * @default 1000
   */
  retryDelay?: number;
  
  /**
   * 请求头
   */
  headers?: Record<string, string>;
  
  /**
   * 额外的表单数据
   */
  data?: Record<string, any>;
  
  /**
   * 是否启用断点续传
   * @default true
   */
  enableResume?: boolean;
  
  /**
   * 是否计算文件哈希
   * @default true
   */
  enableHash?: boolean;
  
  /**
   * 支持的文件类型
   */
  accept?: string[];
  
  /**
   * 最大文件大小 (字节)
   */
  maxFileSize?: number;
  
  /**
   * 最大文件数量
   */
  maxFiles?: number;
  
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;
}

/**
 * 虚拟滚动项目数据接口
 */
export interface VirtualListItem<T = any> {
  /**
   * 项目唯一标识
   */
  id: string | number;
  
  /**
   * 项目数据
   */
  data: T;
  
  /**
   * 项目高度（可选，用于固定高度优化）
   */
  height?: number;
  
  /**
   * 项目索引
   */
  index?: number;
}

/**
 * 虚拟滚动配置接口
 */
export interface VirtualListConfig {
  /**
   * 项目高度
   * - 数字：固定高度
   * - 函数：动态计算高度
   * @default 50
   */
  itemHeight?: number | ((index: number, data: any) => number);
  
  /**
   * 缓冲区大小（渲染可视区域外的项目数量）
   * @default 5
   */
  overscan?: number;
  
  /**
   * 是否启用虚拟化
   * @default true
   */
  enabled?: boolean;
  
  /**
   * 滚动容器高度
   * @default 400
   */
  height?: number | string;
  
  /**
   * 滚动容器宽度
   * @default '100%'
   */
  width?: number | string;
  
  /**
   * 是否启用水平滚动
   * @default false
   */
  horizontal?: boolean;
  
  /**
   * 滚动阈值（触发滚动事件的最小距离）
   * @default 1
   */
  scrollThreshold?: number;
  
  /**
   * 是否启用平滑滚动
   * @default true
   */
  smoothScroll?: boolean;
  
  /**
   * 预估项目高度（用于动态高度计算的初始值）
   * @default 50
   */
  estimatedItemHeight?: number;
}

/**
 * 虚拟滚动范围接口
 */
export interface VirtualRange {
  /**
   * 开始索引
   */
  startIndex: number;
  
  /**
   * 结束索引
   */
  endIndex: number;
  
  /**
   * 可视区域开始索引
   */
  visibleStartIndex: number;
  
  /**
   * 可视区域结束索引
   */
  visibleEndIndex: number;
}

/**
 * 虚拟滚动项目位置信息
 */
export interface VirtualItemPosition {
  /**
   * 项目索引
   */
  index: number;
  
  /**
   * 项目高度
   */
  height: number;
  
  /**
   * 项目顶部偏移量
   */
  top: number;
  
  /**
   * 项目底部偏移量
   */
  bottom: number;
}

/**
 * 虚拟滚动状态接口
 */
export interface VirtualScrollState {
  /**
   * 滚动位置
   */
  scrollTop: number;
  
  /**
   * 滚动方向
   */
  scrollDirection: 'up' | 'down' | null;
  
  /**
   * 是否正在滚动
   */
  isScrolling: boolean;
  
  /**
   * 容器高度
   */
  containerHeight: number;
  
  /**
   * 总内容高度
   */
  totalHeight: number;
  
  /**
   * 当前渲染范围
   */
  range: VirtualRange;
  
  /**
   * 项目位置信息列表
   */
  itemPositions: VirtualItemPosition[];
}

/**
 * 虚拟滚动回调函数类型
 */
export type VirtualScrollCallback = (state: VirtualScrollState) => void;

/**
 * 虚拟滚动项目渲染函数类型
 */
export type VirtualItemRenderer<T = any> = (props: {
  index: number;
  data: T;
  style: React.CSSProperties;
  isVisible: boolean;
}) => React.ReactNode;