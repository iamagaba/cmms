import React from 'react';
import { Resizable, ResizableProps } from 'react-resizable'; // Import ResizableProps to get ResizeCallback

interface ResizableTitleProps extends React.HTMLAttributes<HTMLTableCellElement> {
  onResize: ResizableProps['onResize']; // Correctly reference the type from ResizableProps
  width: number;
}

export const ResizableTitle: React.FC<ResizableTitleProps> = ({ onResize, width, ...restProps }) => {
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0} // Height is 0 for column resizing
      onResize={onResize}
      axis="x" // Only allow horizontal resizing
      handle={<span className="react-resizable-handle" />} // Custom handle for better styling
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};