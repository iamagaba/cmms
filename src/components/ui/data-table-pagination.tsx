import React from "react";
import { Button } from "@/components/ui/button"; // Assuming Button is imported from shadcn/ui

const DataTablePaginationButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> // Corrected type for props
>(({ className, variant, size, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={className}
      variant={variant}
      size={size}
      {...props}
    />
  );
});
DataTablePaginationButton.displayName = "DataTablePaginationButton";

export { DataTablePaginationButton };