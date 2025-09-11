"use client";

import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { Icon } from '@iconify/react'; // Import Icon from Iconify

import { cn } from "@/lib/utils";

const sidebarVariants = cva(
  "flex h-full flex-col overflow-hidden transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        ghost: "bg-transparent text-foreground",
      },
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
    defaultVariants: {
      variant: "default",
      collapsed: false,
    },
  }
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, variant, isCollapsed, onCollapse, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ variant, collapsed: isCollapsed }), className)}
        {...props}
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        <div className="flex items-center justify-end p-2 border-t">
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            <Icon icon={isCollapsed ? "si:menu-unfold" : "si:menu-fold"} className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

export { Sidebar, sidebarVariants };