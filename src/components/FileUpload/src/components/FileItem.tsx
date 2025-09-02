import React, { useMemo } from 'react';
import type { UploadFileInfo } from '../../../../types/common';
import { 
  formatFileSize, 
  formatUploadSpeed, 
  formatRemainingTime,
  getFileTypeIcon 
} from '../utils/fileUtils';
import { calculateUploadSpeed, calculateRemainingTime } from '../utils/uploadUtils';

interface FileItemProps {
  file: UploadFileInfo;
  onRemove: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onRemove,
  onStart,
  onPause,
  onResume,
  onCancel,
  onRetry,
}) => {
  // 添加调试日志
  console.log('FileItem 渲染', { fileId: file.id, status: file.status, name: file.name });
  
  // 计算上传速度和剩余时间
  const { speed, remainingTime } = useMemo(() => {
    if (!file.startTime || file.status !== 'uploading') {
      return { speed: 0, remainingTime: 0 };
    }
    
    const currentTime = Date.now();
    const uploadSpeed = calculateUploadSpeed(file.uploadedSize, file.startTime, currentTime);
    const remaining = calculateRemainingTime(file.size, file.uploadedSize, uploadSpeed);
    
    return { speed: uploadSpeed, remainingTime: remaining };
  }, [file.uploadedSize, file.startTime, file.status, file.size]);

  // 获取状态文本和样式
  const getStatusInfo = () => {
    switch (file.status) {
      case 'idle':
        return { text: '等待上传', className: 'idle' };
      case 'uploading':
        return { text: '上传中', className: 'uploading' };
      case 'paused':
        return { text: '已暂停', className: 'paused' };
      case 'completed':
        return { text: '上传完成', className: 'completed' };
      case 'error':
        return { text: '上传失败', className: 'error' };
      case 'cancelled':
        return { text: '已取消', className: 'cancelled' };
      default:
        return { text: '未知状态', className: 'unknown' };
    }
  };

  const statusInfo = getStatusInfo();
  const fileIcon = getFileTypeIcon(file.name, file.type);

  // 获取操作按钮
  const getActionButtons = () => {
    console.log('getActionButtons 被调用', { fileId: file.id, status: file.status }); // 添加调试日志
    
    switch (file.status) {
      case 'idle':
        console.log('返回 idle 状态的按钮'); // 添加调试日志
        return (
          <>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--start"
              onClick={onStart}
              type="button"
            >
              开始
            </button>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--remove"
              onClick={onRemove}
              type="button"
            >
              移除
            </button>
          </>
        );
      case 'uploading':
        console.log('返回 uploading 状态的按钮'); // 添加调试日志
        console.log('onPause 函数:', onPause); // 添加调试日志
        console.log('onCancel 函数:', onCancel); // 添加调试日志
        return (
          <>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--pause"
              onClick={() => {
                console.log('暂停按钮被点击', { fileId: file.id, status: file.status });
                console.log('调用 onPause 函数');
                if (typeof onPause === 'function') {
                  onPause();
                } else {
                  console.error('onPause 不是一个函数:', onPause);
                }
              }}
              type="button"
            >
              暂停
            </button>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--cancel"
              onClick={() => {
                console.log('取消按钮被点击', { fileId: file.id, status: file.status });
                console.log('调用 onCancel 函数');
                if (typeof onCancel === 'function') {
                  onCancel();
                } else {
                  console.error('onCancel 不是一个函数:', onCancel);
                }
              }}
              type="button"
            >
              取消
            </button>
          </>
        );
      case 'paused':
        return (
          <>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--resume"
              onClick={onResume}
              type="button"
            >
              继续
            </button>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--cancel"
              onClick={onCancel}
              type="button"
            >
              取消
            </button>
          </>
        );
      case 'error':
        return (
          <>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--retry"
              onClick={onRetry}
              type="button"
            >
              重试
            </button>
            <button
              className="QinComponents-file-item__btn QinComponents-file-item__btn--remove"
              onClick={onRemove}
              type="button"
            >
              移除
            </button>
          </>
        );
      case 'completed':
      case 'cancelled':
        return (
          <button
            className="QinComponents-file-item__btn QinComponents-file-item__btn--remove"
            onClick={onRemove}
            type="button"
          >
            移除
          </button>
        );
      default:
        return null;
    }
  };

  const itemClassName = [
    'QinComponents-file-item',
    `QinComponents-file-item--${statusInfo.className}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClassName}>
      <div className="QinComponents-file-item__icon">
        {fileIcon}
      </div>
      
      <div className="QinComponents-file-item__info">
        <div className="QinComponents-file-item__name" title={file.name}>
          {file.name}
        </div>
        
        <div className="QinComponents-file-item__details">
          <span className="QinComponents-file-item__size">
            {formatFileSize(file.size)}
          </span>
          
          <span className={`QinComponents-file-item__status QinComponents-file-item__status--${statusInfo.className}`}>
            {statusInfo.text}
          </span>
          
          {file.error && (
            <span className="QinComponents-file-item__error" title={file.error}>
              {file.error}
            </span>
          )}
        </div>
        
        {/* 进度条 */}
        {(file.status === 'uploading' || file.status === 'paused' || (file.status === 'error' && file.progress > 0)) && (
          <div className="QinComponents-file-item__progress">
            <div className="QinComponents-file-item__progress-bar">
              <div 
                className="QinComponents-file-item__progress-fill"
                style={{ width: `${file.progress}%` }}
              />
            </div>
            <span className="QinComponents-file-item__progress-text">
              {file.progress}%
            </span>
          </div>
        )}
        
        {/* 上传统计 */}
        {file.status === 'uploading' && (
          <div className="QinComponents-file-item__stats">
            <span className="QinComponents-file-item__speed">
              {formatUploadSpeed(speed)}
            </span>
            <span className="QinComponents-file-item__remaining">
              剩余 {formatRemainingTime(remainingTime)}
            </span>
            <span className="QinComponents-file-item__uploaded">
              {formatFileSize(file.uploadedSize)} / {formatFileSize(file.size)}
            </span>
          </div>
        )}
        
        {/* 分片信息（调试用） */}
        {file.chunks.length > 1 && (
          <div className="QinComponents-file-item__chunks">
            <span className="QinComponents-file-item__chunks-text">
              分片: {file.chunks.filter(c => c.status === 'completed').length} / {file.chunks.length}
            </span>
            {file.chunks.filter(c => c.status === 'error').length > 0 && (
              <span className="QinComponents-file-item__chunks-error">
                失败: {file.chunks.filter(c => c.status === 'error').length}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="QinComponents-file-item__actions">
        {(() => {
          const buttons = getActionButtons();
          console.log('渲染的按钮', { fileId: file.id, status: file.status, buttons }); // 添加调试日志
          return buttons;
        })()}
      </div>
    </div>
  );
};
