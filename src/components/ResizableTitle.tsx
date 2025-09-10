import React from 'react';
import { Resizable, ResizeCallback } from 'react-resizable';

interface ResizableTitleProps extends Omit<React.HTMLAttributes<HTMLTableCellElement>, 'onResize'> {
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
      axis="x"
      handle={<span className="react-resizable-handle" />}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      {({ ref, style }) => (
        <th ref={ref} style={{ ...style, ...restProps.style }} {...restProps} />
      )}
    </Resizable>
  );
};