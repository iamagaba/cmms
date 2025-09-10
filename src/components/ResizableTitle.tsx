import React from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

interface ResizableTitleProps extends Omit<React.HTMLAttributes<HTMLTableCellElement>, 'onResize'> {
  onResize: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
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