"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const sidebarVariants = cva(
  "group/sidebar flex h-full flex-col overflow-hidden p-2 data-[collapsed=true]:p-2",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  trigger?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      variant,
      collapsed = false,
      collapsible = false,
      onCollapse,
      children,
      trigger,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    const sidebar = (
      <div
        ref={ref}
        data-collapsed={collapsed && collapsible}
        data-collapsible={collapsible}
        className={cn(sidebarVariants({ variant }), className)}
        {...props}
      >
        {children}
      </div>
    );

    return isMobile ? (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              data-sidebar="trigger"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          data-sidebar="sidebar"
          side="left"
          className={cn(
            "w-3/4 !important transition-transform duration-300 ease-in-out data-[state=closed]:-translate-x-full",
            className,
          )}
          style={{
            // Fix for SheetContent not respecting width
            maxWidth: "var(--radix-sheet-content-width)",
            width: "var(--radix-sheet-content-width)",
          }}
        >
          {sidebar}
        </SheetContent>
      </Sheet>
    ) : (
      sidebar
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { collapsed, collapsible, onCollapse } =
    React.useContext(SidebarContext);

  if (!collapsible) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9",
        "absolute right-0 top-0 translate-x-1/2 translate-y-1/2 opacity-0 transition-all duration-300 group-data-[collapsed=true]/sidebar:translate-x-1/2 group-data-[collapsed=true]/sidebar:group-hover/sidebar:opacity-100 group-data-[collapsed=false]/sidebar:-translate-x-1/2 group-data-[collapsed=false]/sidebar:group-hover/sidebar:opacity-100",
        className,
      )}
      onClick={() => onCollapse?.(!collapsed)}
      {...props}
    >
      {children ? (
        children
      ) : collapsed ? (
        <PanelLeft className="h-4 w-4" />
      ) : (
        <PanelLeft className="h-4 w-4" />
      )}
    </Button>
  );
});
SidebarToggle.displayName = "SidebarToggle";

interface SidebarContextProps {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const SidebarContext = React.createContext<SidebarContextProps>({
  collapsed: false,
  collapsible: false,
});

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-4",
      "group-data-[collapsed=true]/sidebar:justify-center",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold",
      "group-data-[collapsed=true]/sidebar:hidden",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarHeaderTitle.displayName = "SidebarHeaderTitle";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-2 px-2 py-4",
      "group-data-[collapsed=true]/sidebar:items-center",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto flex items-center justify-between p-4",
      "group-data-[collapsed=true]/sidebar:justify-center",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarFooter.displayName = "SidebarFooter";

export {
  Sidebar,
  SidebarToggle,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarContent,
  SidebarFooter,
  sidebarVariants,
};