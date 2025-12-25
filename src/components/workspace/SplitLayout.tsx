import React, { useState, useCallback } from 'react';
import { ResizableBox } from 'react-resizable';
import { theme } from 'antd';

const { useToken } = theme;

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({
  left,
  right,
  defaultLeftWidth = 600,
  minLeftWidth = 400,
  maxLeftWidth = 800,
  className = '',
}) => {
  const { token } = useToken();
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);

  const handleResize = useCallback((e: any, { size }: { size: { width: number } }) => {
    setLeftWidth(size.width);
  }, []);

  return (
    <div className={`split-layout ${className}`} style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <ResizableBox
        width={leftWidth}
        height={Infinity}
        minConstraints={[minLeftWidth, Infinity]}
        maxConstraints={[maxLeftWidth, Infinity]}
        onResize={handleResize}
        resizeHandles={['e']}
        handle={(h, ref) => (
          <div
            ref={ref}
            className={`react-resizable-handle react-resizable-handle-${h}`}
            style={{
              position: 'absolute',
              right: -5,
              top: 0,
              bottom: 0,
              width: 10,
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              zIndex: 1,
            }}
          />
        )}
        style={{ 
          borderRight: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ height: '100%', overflow: 'hidden' }}>
          {left}
        </div>
      </ResizableBox>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: token.colorBgContainer,
        overflow: 'hidden',
        minWidth: 400
      }}>
        {right}
      </div>
    </div>
  );
};

export default SplitLayout;