/**
 * Icon Compatibility Wrapper
 * 
 * This component provides backward compatibility for the old Iconify-style icon usage
 * while the codebase is being migrated to Hugeicons.
 * 
 * It maps common tabler icon names to their Hugeicons equivalents.
 * 
 * Usage (old style - for backward compatibility):
 * <Icon icon="tabler:search" className="w-4 h-4" />
 * 
 * Preferred usage (new style):
 * import { Search01Icon } from '@hugeicons/core-free-icons';
 * <HugeiconsIcon icon={Search01Icon} size={16} />
 */

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Add01Icon,
  Cancel01Icon,
  Tick01Icon,
  PencilEdit02Icon,
  Delete01Icon,
  RefreshIcon,
  Loading01Icon,
  Settings01Icon,
  Settings02Icon,
  Home01Icon,
  UserIcon,
  AlertCircleIcon,
  Alert01Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  ClipboardIcon,
  PackageIcon,
  Clock01Icon,
  Notification01Icon,
  MessageIcon,
  StarIcon,
  InboxIcon,
  FilterIcon,
  MoreVerticalIcon,
  MoreHorizontalIcon,
  Download01Icon,
  Upload01Icon,
  LinkSquare02Icon,
  Location01Icon,
  Call02Icon,
  Mail01Icon,
  Wrench01Icon,
  Car01Icon,
  Motorbike01Icon,
  Building01Icon,
  Store01Icon,
  NoteIcon,
  FileIcon,
  FolderIcon,
  LockIcon,
  EyeIcon,
  Copy01Icon,
  Layers01Icon,
  GridIcon,
  ListViewIcon,
  Menu01Icon,
  SunIcon,
  MoonIcon,
  CloudIcon,
  FavouriteIcon,
  ShareIcon,
  BookmarkIcon,
  TagIcon,
  LinkIcon,
  FlagIcon,
  MapsIcon,
  CodeIcon,
  DatabaseIcon,
  ComputerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  VolumeHighIcon,
  ImageIcon,
  CameraIcon,
  PrinterIcon,
  Calendar01Icon,
  Calendar02Icon,
  Calendar03Icon,
  TimelineIcon,
  Login01Icon,
} from '@hugeicons/core-free-icons';

// Map of tabler icon names to Hugeicons components
const iconMap: Record<string, any> = {
  // Auth & Login
  'tabler:login': Login01Icon,
  'tabler:logout': Login01Icon,
  'flat-color-icons:google': UserIcon, // Fallback for Google icon

  // Navigation & Arrows
  'tabler:chevron-up': ArrowUp01Icon,
  'tabler:chevron-down': ArrowDown01Icon,
  'tabler:chevron-right': ArrowRight01Icon,
  'tabler:chevron-left': ArrowLeft01Icon,
  'tabler:arrow-up': ArrowUp01Icon,
  'tabler:arrow-down': ArrowDown01Icon,
  'tabler:arrow-right': ArrowRight01Icon,
  'tabler:arrow-left': ArrowLeft01Icon,

  // Actions
  'tabler:search': Search01Icon,
  'tabler:plus': Add01Icon,
  'tabler:x': Cancel01Icon,
  'tabler:check': Tick01Icon,
  'tabler:edit': PencilEdit02Icon,
  'tabler:pencil': PencilEdit02Icon,
  'tabler:trash': Delete01Icon,
  'tabler:refresh': RefreshIcon,
  'tabler:loader': Loading01Icon,
  'tabler:settings': Settings01Icon,
  'tabler:settings-2': Settings02Icon,
  'tabler:filter': FilterIcon,
  'tabler:dots-vertical': MoreVerticalIcon,
  'tabler:dots': MoreHorizontalIcon,
  'tabler:download': Download01Icon,
  'tabler:upload': Upload01Icon,
  'tabler:link': LinkSquare02Icon,
  'tabler:external-link': LinkIcon,
  'tabler:copy': Copy01Icon,

  // Navigation
  'tabler:home': Home01Icon,
  'tabler:menu': Menu01Icon,
  'tabler:menu-2': Menu01Icon,

  // Users
  'tabler:user': UserIcon,
  'tabler:users': UserIcon,

  // Alerts & Status
  'tabler:alert-circle': AlertCircleIcon,
  'tabler:alert-triangle': Alert01Icon,
  'tabler:info-circle': InformationCircleIcon,
  'tabler:circle-check': CheckmarkCircle01Icon,
  'tabler:check-circle': CheckmarkCircle01Icon,

  // Content
  'tabler:clipboard': ClipboardIcon,
  'tabler:clipboard-list': ClipboardIcon,
  'tabler:package': PackageIcon,
  'tabler:calendar': Calendar01Icon,
  'tabler:calendar-event': Calendar02Icon,
  'tabler:calendar-time': Calendar03Icon,
  'tabler:clock': Clock01Icon,
  'tabler:chart-line': TimelineIcon,
  'tabler:chart-bar': TimelineIcon,
  'tabler:chart-pie': TimelineIcon,

  // Communication
  'tabler:bell': Notification01Icon,
  'tabler:message': MessageIcon,
  'tabler:mail': Mail01Icon,
  'tabler:phone': Call02Icon,

  // Objects
  'tabler:star': StarIcon,
  'tabler:archive': InboxIcon,
  'tabler:inbox': InboxIcon,
  'tabler:file': FileIcon,
  'tabler:folder': FolderIcon,
  'tabler:note': NoteIcon,
  'tabler:book': NoteIcon,
  'tabler:image': ImageIcon,
  'tabler:photo': ImageIcon,
  'tabler:camera': CameraIcon,
  'tabler:printer': PrinterIcon,

  // Security
  'tabler:lock': LockIcon,
  'tabler:lock-open': LockIcon,
  'tabler:eye': EyeIcon,
  'tabler:eye-off': EyeIcon,
  'tabler:shield': LockIcon,

  // Location
  'tabler:location': Location01Icon,
  'tabler:map-pin': Location01Icon,
  'tabler:map': MapsIcon,
  'tabler:compass': MapsIcon,
  'tabler:globe': MapsIcon,

  // Business
  'tabler:building': Building01Icon,
  'tabler:building-store': Store01Icon,
  'tabler:briefcase': ClipboardIcon,
  'tabler:wallet': ClipboardIcon,
  'tabler:credit-card': ClipboardIcon,
  'tabler:shopping-cart': PackageIcon,
  'tabler:receipt': NoteIcon,

  // Tools & Work
  'tabler:tool': Wrench01Icon,
  'tabler:wrench': Wrench01Icon,
  'tabler:hammer': Wrench01Icon,
  'tabler:screwdriver': Wrench01Icon,

  // Vehicles
  'tabler:car': Car01Icon,
  'tabler:motorbike': Motorbike01Icon,
  'tabler:truck': Car01Icon,
  'tabler:plane': Car01Icon,

  // Layout
  'tabler:layout-grid': GridIcon,
  'tabler:list': ListViewIcon,
  'tabler:layers': Layers01Icon,

  // Theme
  'tabler:sun': SunIcon,
  'tabler:moon': MoonIcon,
  'tabler:palette': SunIcon,

  // Tech
  'tabler:code': CodeIcon,
  'tabler:terminal': CodeIcon,
  'tabler:database': DatabaseIcon,
  'tabler:server': DatabaseIcon,
  'tabler:cpu': DatabaseIcon,
  'tabler:device-desktop': ComputerIcon,
  'tabler:device-mobile': ComputerIcon,

  // Media
  'tabler:player-play': PlayIcon,
  'tabler:player-pause': PauseIcon,
  'tabler:player-stop': StopIcon,
  'tabler:volume': VolumeHighIcon,

  // Social
  'tabler:heart': FavouriteIcon,
  'tabler:thumb-up': FavouriteIcon,
  'tabler:thumb-down': FavouriteIcon,
  'tabler:share': ShareIcon,
  'tabler:bookmark': BookmarkIcon,

  // Tags & Labels
  'tabler:tag': TagIcon,
  'tabler:hash': TagIcon,
  'tabler:at': TagIcon,

  // Misc
  'tabler:sparkles': StarIcon,
  'tabler:bulb': StarIcon,
  'tabler:flag': FlagIcon,
  'tabler:trophy': StarIcon,
  'tabler:award': StarIcon,
  'tabler:gift': PackageIcon,
  'tabler:ruler': NoteIcon,
  'tabler:icons': GridIcon,

  // Power & Connectivity
  'tabler:power': Settings01Icon,
  'tabler:plug': Settings01Icon,
  'tabler:wifi': CloudIcon,
  'tabler:bluetooth': CloudIcon,
  'tabler:battery': Settings01Icon,
  'tabler:battery-charging': Settings01Icon,
  'tabler:cloud': CloudIcon,
  'tabler:bolt': StarIcon,
};

// Convert Tailwind size classes to pixel values
const sizeClassToPixels = (className: string): number => {
  const match = className.match(/w-(\d+(?:\.\d+)?)/);
  if (match) {
    const size = parseFloat(match[1]);
    return size * 4; // Tailwind uses 4px base
  }
  return 16; // default
};

interface IconProps {
  icon: string | any;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  icon,
  className = '',
  size,
  strokeWidth,
  ...props
}) => {
  // If icon is already a Hugeicons component (object), use it directly
  if (typeof icon === 'object') {
    const pixelSize = size || sizeClassToPixels(className);
    return (
      <HugeiconsIcon
        icon={icon}
        size={pixelSize}
        className={className.replace(/w-\d+(?:\.\d+)?\s*h-\d+(?:\.\d+)?/g, '').trim()}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  // If icon is a string (tabler:xxx format), map it to Hugeicons
  const mappedIcon = iconMap[icon];

  if (!mappedIcon) {
    console.warn(`Icon "${icon}" not found in icon map. Using fallback.`);
    // Return a fallback icon
    const pixelSize = size || sizeClassToPixels(className);
    return (
      <HugeiconsIcon
        icon={AlertCircleIcon}
        size={pixelSize}
        className={className.replace(/w-\d+(?:\.\d+)?\s*h-\d+(?:\.\d+)?/g, '').trim()}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  const pixelSize = size || sizeClassToPixels(className);

  return (
    <HugeiconsIcon
      icon={mappedIcon}
      size={pixelSize}
      className={className.replace(/w-\d+(?:\.\d+)?\s*h-\d+(?:\.\d+)?/g, '').trim()}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export default Icon;
