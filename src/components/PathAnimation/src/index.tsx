import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { HTMLAttributes } from 'react';
import type {
  BaseComponentProps,
  Point,
  BezierPath,
  PathType,
  EasingFunction,
  AnimationCallback,
  AnimationProgressCallback,
  AnimationUpdateCallback
} from '../../../types/common';
import './index.scss';

/**
 * PathAnimation 组件属性接口
 */
export interface PathAnimationProps extends 
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onProgress'>,
  BaseComponentProps {
  
  /**
   * 动画容器的宽度
   * @default 400
   */
  width?: number;
  
  /**
   * 动画容器的高度  
   * @default 300
   */
  height?: number;
  
  /**
   * 路径类型
   * @default 'bezier'
   */
  pathType?: PathType;
  
  /**
   * SVG路径字符串（当pathType为'svg'时使用）
   */
  svgPath?: string;
  
  /**
   * 贝塞尔曲线路径（当pathType为'bezier'时使用）
   */
  bezierPath?: BezierPath;
  
  /**
   * 线性路径点数组（当pathType为'linear'时使用）
   */
  linearPath?: Point[];
  
  /**
   * 动画持续时间（毫秒）
   * @default 2000
   */
  duration?: number;
  
  /**
   * 缓动函数
   * @default 'ease-out'
   */
  easing?: EasingFunction;
  
  /**
   * 是否自动开始播放
   * @default true
   */
  autoPlay?: boolean;
  
  /**
   * 是否循环播放
   * @default false
   */
  loop?: boolean;
  
  /**
   * 动画延迟（毫秒）
   * @default 0
   */
  delay?: number;
  
  /**
   * 拖尾长度（0-1之间）
   * @default 0.3
   */
  trailLength?: number;
  
  /**
   * 拖尾点数量
   * @default 20
   */
  trailPointCount?: number;
  
  /**
   * 动画点的大小（像素）
   * @default 8
   */
  pointSize?: number;
  
  /**
   * 动画点的颜色
   * @default '#3498db'
   */
  pointColor?: string;
  
  /**
   * 拖尾的颜色
   * @default '#3498db'
   */
  trailColor?: string;
  
  /**
   * 是否显示路径
   * @default false
   */
  showPath?: boolean;
  
  /**
   * 路径颜色
   * @default '#e0e0e0'
   */
  pathColor?: string;
  
  /**
   * 路径宽度
   * @default 2
   */
  pathWidth?: number;
  
  /**
   * 动画开始回调
   */
  onStart?: AnimationCallback;
  
  /**
   * 动画结束回调
   */
  onComplete?: AnimationCallback;
  
  /**
   * 动画进度回调
   */
  onProgress?: AnimationProgressCallback;
  
  /**
   * 动画更新回调
   */
  onUpdate?: AnimationUpdateCallback;
  
  /**
   * 是否暂停动画
   * @default false
   */
  paused?: boolean;
}

/**
 * PathAnimation 路径动画组件
 * 支持沿SVG路径、贝塞尔曲线或线性路径的动画效果
 */
export const PathAnimation: React.FC<PathAnimationProps> = ({
  width = 400,
  height = 300,
  pathType = 'bezier',
  svgPath,
  bezierPath,
  linearPath,
  duration = 2000,
  easing = 'ease-out',
  autoPlay = true,
  loop = false,
  delay = 0,
  trailLength = 0.3,
  trailPointCount = 20,
  pointSize = 8,
  pointColor = '#3498db',
  trailColor = '#3498db',
  showPath = false,
  pathColor = '#e0e0e0',
  pathWidth = 2,
  onStart,
  onComplete,
  onProgress,
  onUpdate,
  paused = false,
  className = '',
  style,
  'data-testid': testId,
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [trailPoints, setTrailPoints] = useState<Point[]>([]);
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });

  // 缓动函数映射
  const easingFunctions: Record<string, (t: number) => number> = {
    linear: (t: number) => t,
    ease: (t: number) => 0.25 * (1 - Math.cos(t * Math.PI)),
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => 1 - (1 - t) * (1 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    elastic: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : 
        -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    },
    back: (t: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return c3 * t * t * t - c1 * t * t;
    }
  };

  // 获取路径上的点
  const getPointOnPath = useCallback((progress: number): Point => {
    if (pathType === 'svg' && svgPath) {
      // SVG路径处理（简化版本，实际应该使用GSAP的MotionPathPlugin）
      // 这里提供基本实现
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', svgPath);
      const pathLength = pathElement.getTotalLength();
      const point = pathElement.getPointAtLength(pathLength * progress);
      return { x: point.x, y: point.y };
    } 
    
    if (pathType === 'bezier' && bezierPath) {
      // 贝塞尔曲线计算
      const { start, control1, control2, end } = bezierPath;
      const t = progress;
      
      if (control2) {
        // 三次贝塞尔曲线
        const x = Math.pow(1 - t, 3) * start.x + 
                  3 * Math.pow(1 - t, 2) * t * control1.x + 
                  3 * (1 - t) * Math.pow(t, 2) * control2.x + 
                  Math.pow(t, 3) * end.x;
        const y = Math.pow(1 - t, 3) * start.y + 
                  3 * Math.pow(1 - t, 2) * t * control1.y + 
                  3 * (1 - t) * Math.pow(t, 2) * control2.y + 
                  Math.pow(t, 3) * end.y;
        return { x, y };
      } else {
        // 二次贝塞尔曲线
        const x = Math.pow(1 - t, 2) * start.x + 
                  2 * (1 - t) * t * control1.x + 
                  Math.pow(t, 2) * end.x;
        const y = Math.pow(1 - t, 2) * start.y + 
                  2 * (1 - t) * t * control1.y + 
                  Math.pow(t, 2) * end.y;
        return { x, y };
      }
    }
    
    if (pathType === 'linear' && linearPath && linearPath.length > 1) {
      // 线性路径插值
      const segmentLength = 1 / (linearPath.length - 1);
      const segmentIndex = Math.floor(progress / segmentLength);
      const segmentProgress = (progress % segmentLength) / segmentLength;
      
      if (segmentIndex >= linearPath.length - 1) {
        return linearPath[linearPath.length - 1];
      }
      
      const start = linearPath[segmentIndex];
      const end = linearPath[segmentIndex + 1];
      
      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress
      };
    }
    
    // 默认直线路径
    return {
      x: width * progress,
      y: height / 2
    };
  }, [pathType, svgPath, bezierPath, linearPath, width, height]);

  // 动画循环
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }
    
    const elapsed = timestamp - startTimeRef.current - delay;
    
    if (elapsed < 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    let progress = Math.min(elapsed / duration, 1);
    
    // 应用缓动函数
    const easingFn = easingFunctions[easing] || easingFunctions.linear;
    const easedProgress = easingFn(progress);
    
    // 获取当前点位置
    const currentPos = getPointOnPath(easedProgress);
    setCurrentPoint(currentPos);
    
    // 更新拖尾点
    const newTrailPoints: Point[] = [];
    const trailStep = trailLength / trailPointCount;
    
    for (let i = 0; i < trailPointCount; i++) {
      const trailProgress = Math.max(0, easedProgress - (i + 1) * trailStep);
      if (trailProgress > 0) {
        newTrailPoints.push(getPointOnPath(trailProgress));
      }
    }
    setTrailPoints(newTrailPoints);
    
    // 回调
    onProgress?.(progress);
    onUpdate?.(currentPos, progress);
    
    if (progress >= 1) {
      // 动画完成
      setIsPlaying(false);
      onComplete?.();
      
      if (loop) {
        // 重新开始
        startTimeRef.current = null;
        setTimeout(() => {
          setIsPlaying(true);
          animationRef.current = requestAnimationFrame(animate);
        }, 100);
      }
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [delay, duration, easing, getPointOnPath, trailLength, trailPointCount, loop, onProgress, onUpdate, onComplete]);

  // 开始动画
  const startAnimation = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    startTimeRef.current = null;
    onStart?.();
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, animate, onStart]);

  // 停止动画
  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
    startTimeRef.current = null;
  }, []);

  // 暂停/恢复动画
  useEffect(() => {
    if (paused && isPlaying) {
      stopAnimation();
    } else if (!paused && !isPlaying && autoPlay) {
      startAnimation();
    }
  }, [paused, isPlaying, autoPlay, startAnimation, stopAnimation]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && !paused) {
      startAnimation();
    }
    
    return () => {
      stopAnimation();
    };
  }, [autoPlay, paused, startAnimation, stopAnimation]);

  // 渲染路径
  const renderPath = () => {
    if (!showPath) return null;
    
    if (pathType === 'svg' && svgPath) {
      return <path d={svgPath} fill="none" stroke={pathColor} strokeWidth={pathWidth} />;
    }
    
    if (pathType === 'bezier' && bezierPath) {
      const { start, control1, control2, end } = bezierPath;
      const d = control2 
        ? `M ${start.x} ${start.y} C ${control1.x} ${control1.y} ${control2.x} ${control2.y} ${end.x} ${end.y}`
        : `M ${start.x} ${start.y} Q ${control1.x} ${control1.y} ${end.x} ${end.y}`;
      return <path d={d} fill="none" stroke={pathColor} strokeWidth={pathWidth} />;
    }
    
    if (pathType === 'linear' && linearPath && linearPath.length > 1) {
      const pathData = linearPath.reduce((acc, point, index) => {
        return acc + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
      }, '');
      return <path d={pathData} fill="none" stroke={pathColor} strokeWidth={pathWidth} />;
    }
    
    // 默认直线
    return <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke={pathColor} strokeWidth={pathWidth} />;
  };

  const componentClassName = [
    'QinComponents-pathanimation',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div 
      {...restProps}
      ref={containerRef}
      className={componentClassName}
      style={{ width, height, ...style }}
      data-testid={testId}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="QinComponents-pathanimation-svg"
      >
        {/* 渲染路径 */}
        {renderPath()}
        
        {/* 渲染拖尾点 */}
        {trailPoints.map((point, index) => {
          const opacity = 1 - (index / trailPointCount);
          const size = pointSize * (1 - index / trailPointCount * 0.5);
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={size / 2}
              fill={trailColor}
              opacity={opacity * 0.6}
              className="QinComponents-pathanimation-trail-point"
            />
          );
        })}
        
        {/* 渲染主要动画点 */}
        <circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={pointSize / 2}
          fill={pointColor}
          className="QinComponents-pathanimation-point"
        />
      </svg>
      
      {/* 提供控制方法给父组件 */}
      <div className="QinComponents-pathanimation-controls" style={{ display: 'none' }}>
        <button onClick={startAnimation} data-testid="start-button">Start</button>
        <button onClick={stopAnimation} data-testid="stop-button">Stop</button>
      </div>
    </div>
  );
};

// 导出控制方法的Hook
export const usePathAnimation = () => {
  const animationRef = useRef<{
    start: () => void;
    stop: () => void;
    isPlaying: boolean;
    progress: number;
  } | null>(null);
  
  return animationRef.current;
};

export default PathAnimation;