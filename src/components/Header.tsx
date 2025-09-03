import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Map,
  Package,
  PanelLeft,
  Search,
  Settings,
  Users2,
  Wrench,
  Flame
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/work-orders", label: "Work Orders", icon: Wrench },
  { to: "/map", label: "Map View", icon: Map },
  { to: "/technicians", label: "Technicians", icon: Users2 },
  { to: "/locations", label: "Locations", icon: Package },
  { to: "/analytics", label: "Analytics", icon: LineChart },
];

const AppHeader = () => {
  const location = useLocation();

  const NavLinkItem = ({ to, label, icon: Icon }: typeof navItems[0]) => (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        location.pathname === to && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <NavLink
              to="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Flame className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">GOGO Electric</span>
            </NavLink>
            {navItems.map((item) => <NavLinkItem key={item.to} {...item} />)}
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-primary" />
        <span className="font-bold text-primary">GOGO Electric</span>
      </div>

      <nav className="hidden items-center gap-5 text-sm font-medium md:flex md:flex-row md:gap-5 lg:gap-6">
        {navItems.map(item => (
          <NavLink 
            key={item.to} 
            to={item.to}
            className={cn(
              "transition-colors hover:text-foreground",
              location.pathname === item.to ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <Button variant="outline" size="icon" className="relative">
        <Bell className="h-4 w-4" />
        <Badge className="absolute -right-1 -top-1 h-4 w-4 justify-center p-0" variant="destructive">5</Badge>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AppHeader;