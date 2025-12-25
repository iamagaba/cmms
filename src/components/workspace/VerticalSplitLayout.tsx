import React, { useState, useCallback } from 'react';
import { ResizableBox } from 'react-resizable';
import { theme } from 'antd';

const { useToken } = theme;

interface VerticalSplitLayoutProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  defaultTopHeight?: number;
  minTopHeight?: number;
  maxTopHeight?: number;
  className?: string;
}

const VerticalSplitLayout: React.FC<VerticalSplitLayoutProps> = ({
  top,
  bottom,
  defaultTopHeight = 400,
  minTopHeight = 200,
  maxTopHeight = 600,
  className = '',
}) => {
  const { token } = useToken();
  const [topHeight, setTopHeight] = useState(defaultTopHeight);

  const handleResize = useCallback((e: any, { size }: { size: { height: number } }) => {
    setTopHeight(size.height);
  }, []);

  return (
    <div className={`vertical-split-layout ${className}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ResizableBox
        width={Infinity}
        height={topHeight}
        minConstraints={[Infinity, minTopHeight]}
        maxConstraints={[Infinity, maxTopHeight]}
        onResize={handleResize}
        resizeHandles={['s']}
        handle={(h, ref) => (
          <div
            ref={ref}
            className={`react-resizable-handle react-resizable-handle-${h}`}
            style={{
              position: 'absolute',
              bottom: -5,
              left: 0,
              right: 0,
              height: 10,
              cursor: 'row-resize',
              backgroundColor: 'transparent',
              zIndex: 1,
            }}
          />
        )}
        style={{ 
          borderBottom: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ height: '100%', overflow: 'hidden' }}>
          {top}
        </div>
      </ResizableBox>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: token.colorBgContainer,
        overflow: 'hidden',
        minHeight: 150
      }}>
        {bottom}
      </div>
    </div>
  );
};

export default VerticalSplitLayout;