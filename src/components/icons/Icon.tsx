import {
  AlertCircle, ArrowLeft, Bike, Building2, Calendar, Check, CheckCircle,
  ClipboardList, Clock, Eye, Home, Info, Loader2, Lock, Mail, Map,
  MessageSquare, Pause, Plus, RefreshCw, Search, Settings, Tag, User,
  Wrench, X, ChevronRight, ChevronDown, ChevronUp, Edit, Trash2,
  Filter, MoreVertical, MoreHorizontal, Download, Upload, Link,
  Copy, Menu, Users, AlertTriangle, Package, Phone, Star, Archive,
  FileText, Image, Camera, Printer, EyeOff, MapPin, Store,
  Grid3X3, List, Sun, Moon, Code, Database, Play, Square,
  VolumeX, Heart, ThumbsUp, Share, Bookmark, Flag, Trophy,
  Award, Gift, Zap, Wifi, Battery, Cloud, Folder, Bell
} from 'lucide-react';
/**
 * Icon Compatibility Wrapper
 * 
 * This component provides backward compatibility for the old Iconify-style icon usage
 * while using Lucide React icons.
 * 
 * It maps common tabler icon names to their Lucide React equivalents.
 * 
 * Usage (old style - for backward compatibility):
 * <Icon icon="tabler:search" className="w-4 h-4" />
 * 
 * Preferred usage (new style):
 * import { Search } from 'lucide-react';
 * <Search className="w-5 h-5" />
 */

import React from 'react';



// Map of tabler icon names to Lucide components
const iconMap: Record<string, any> = {
  // Auth & Login
  'tabler:login': User,
  'tabler:logout': User,
  'flat-color-icons:google': User, // Fallback for Google icon

  // Navigation & Arrows
  'tabler:chevron-up': ChevronUp,
  'tabler:chevron-down': ChevronDown,
  'tabler:chevron-right': ChevronRight,
  'tabler:chevron-left': ArrowLeft,
  'tabler:arrow-up': ChevronUp,
  'tabler:arrow-down': ChevronDown,
  'tabler:arrow-right': ChevronRight,
  'tabler:arrow-left': ArrowLeft,

  // Actions
  'tabler:search': Search,
  'tabler:plus': Plus,
  'tabler:x': X,
  'tabler:check': Check,
  'tabler:edit': Edit,
  'tabler:pencil': Edit,
  'tabler:trash': Trash2,
  'tabler:refresh': RefreshCw,
  'tabler:loader': Loader2,
  'tabler:settings': Settings,
  'tabler:settings-2': Settings,
  'tabler:filter': Filter,
  'tabler:dots-vertical': MoreVertical,
  'tabler:dots': MoreHorizontal,
  'tabler:download': Download,
  'tabler:upload': Upload,
  'tabler:link': Link,
  'tabler:external-link': Link,
  'tabler:copy': Copy,

  // Navigation
  'tabler:home': Home,
  'tabler:menu': Menu,
  'tabler:menu-2': Menu,

  // Users
  'tabler:user': User,
  'tabler:users': Users,

  // Alerts & Status
  'tabler:alert-circle': AlertCircle,
  'tabler:alert-triangle': AlertTriangle,
  'tabler:info-circle': Info,
  'tabler:circle-check': CheckCircle,
  'tabler:check-circle': CheckCircle,

  // Content
  'tabler:clipboard': ClipboardList,
  'tabler:clipboard-list': ClipboardList,
  'tabler:package': Package,
  'tabler:calendar': Calendar,
  'tabler:calendar-event': Calendar,
  'tabler:calendar-time': Calendar,
  'tabler:clock': Clock,
  'tabler:chart-line': Clock,
  'tabler:chart-bar': Clock,
  'tabler:chart-pie': Clock,

  // Communication
  'tabler:bell': Bell,
  'tabler:message': MessageSquare,
  'tabler:mail': Mail,
  'tabler:phone': Phone,

  // Objects
  'tabler:star': Star,
  'tabler:archive': Archive,
  'tabler:inbox': Archive,
  'tabler:file': FileText,
  'tabler:folder': Folder,
  'tabler:note': FileText,
  'tabler:book': FileText,
  'tabler:image': Image,
  'tabler:photo': Image,
  'tabler:camera': Camera,
  'tabler:printer': Printer,

  // Security
  'tabler:lock': Lock,
  'tabler:lock-open': Lock,
  'tabler:eye': Eye,
  'tabler:eye-off': EyeOff,
  'tabler:shield': Lock,

  // Location
  'tabler:location': MapPin,
  'tabler:map-pin': MapPin,
  'tabler:map': Map,
  'tabler:compass': Map,
  'tabler:globe': Map,

  // Business
  'tabler:building': Building2,
  'tabler:building-store': Store,
  'tabler:briefcase': ClipboardList,
  'tabler:wallet': ClipboardList,
  'tabler:credit-card': ClipboardList,
  'tabler:shopping-cart': Package,
  'tabler:receipt': FileText,

  // Tools & Work
  'tabler:tool': Wrench,
  'tabler:wrench': Wrench,
  'tabler:hammer': Wrench,
  'tabler:screwdriver': Wrench,

  // Vehicles
  'tabler:car': Bike, // Using Bike as Car equivalent
  'tabler:motorbike': Bike,
  'tabler:truck': Bike,
  'tabler:plane': Bike,

  // Layout
  'tabler:layout-grid': Grid3X3,
  'tabler:list': List,
  'tabler:layers': Grid3X3,

  // Theme
  'tabler:sun': Sun,
  'tabler:moon': Moon,
  'tabler:palette': Sun,

  // Tech
  'tabler:code': Code,
  'tabler:terminal': Code,
  'tabler:database': Database,
  'tabler:server': Database,
  'tabler:cpu': Database,
  'tabler:device-desktop': Database,
  'tabler:device-mobile': Database,

  // Media
  'tabler:player-play': Play,
  'tabler:player-pause': Pause,
  'tabler:player-stop': Square,
  'tabler:volume': VolumeX,

  // Social
  'tabler:heart': Heart,
  'tabler:thumb-up': ThumbsUp,
  'tabler:thumb-down': ThumbsUp,
  'tabler:share': Share,
  'tabler:bookmark': Bookmark,

  // Tags & Labels
  'tabler:tag': Tag,
  'tabler:hash': Tag,
  'tabler:at': Tag,

  // Misc
  'tabler:sparkles': Star,
  'tabler:bulb': Star,
  'tabler:flag': Flag,
  'tabler:trophy': Trophy,
  'tabler:award': Award,
  'tabler:gift': Gift,
  'tabler:ruler': FileText,
  'tabler:icons': Grid3X3,

  // Power & Connectivity
  'tabler:power': Settings,
  'tabler:plug': Settings,
  'tabler:wifi': Wifi,
  'tabler:bluetooth': Cloud,
  'tabler:battery': Battery,
  'tabler:battery-charging': Battery,
  'tabler:cloud': Cloud,
  'tabler:bolt': Zap,
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
  // If icon is already a Lucide component (object), use it directly
  if (typeof icon === 'object') {
    const IconComponent = icon;
    return (
      <IconComponent
        className={className}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  // If icon is a string (tabler:xxx format), map it to Lucide
  const mappedIcon = iconMap[icon];

  if (!mappedIcon) {
    console.warn(`Icon "${icon}" not found in icon map. Using fallback.`);
    // Return a fallback icon
    return (
      <AlertCircle
        className={className}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  const IconComponent = mappedIcon;

  return (
    <IconComponent
      className={className}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export default Icon;

