import React from 'react';
import { Resizable, ResizeCallback, ResizeCallbackData } from 'react-resizable';

interface ResizableTitleProps extends React.HTMLAttributes<HTMLTableCellElement> {
  onResize: ResizeCallback;
  width: number;
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