import React from 'react';
import { Resizable, ResizeCallback } from 'react-resizable';

interface ResizableTitleProps {
  onResize: ResizeCallback;
  width: number;
  [key: string]: any;
}

export const ResizableTitle: React.FC<ResizableTitleProps> = ({ onResize, width, ...restProps }) => {
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};