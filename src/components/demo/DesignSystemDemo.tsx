/**
 * Enterprise Design System Demo
 * 
 * Comprehensive showcase of the enterprise design system components.
 * All sections are visible for easy browsing and reference.
 */

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Search01Icon,
  Mail01Icon,
  Tag01Icon as TagIcon,
  InformationCircleIcon,
  UserIcon,
  Car01Icon,
  Calendar01Icon,
  InboxIcon,
  ClipboardIcon,
  TimelineIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon,
  Alert01Icon,
  StarIcon,
  NoteIcon,
  Add01Icon,
  Loading01Icon,
  RefreshIcon,
  Wrench01Icon,
  Delete01Icon,
  GridIcon,
  Edit01Icon,
  MoreVerticalIcon,
  Cancel01Icon,
  Notification01Icon,
  Message01Icon as MessageIcon,
  Home01Icon as HomeIcon,
  PackageIcon,
  Settings01Icon,
  Tick01Icon,
  Idea01Icon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

// Enterprise Design System Components
import { Panel, PanelHeader, PanelContent, PanelFooter } from '@/components/ui/enterprise';
import { Input } from '@/components/ui/enterprise';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/enterprise';

const DesignSystemDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Design System</h1>
        <p className="text-sm text-gray-600 mt-2">
          A comprehensive design system for professional CMMS applications
        </p>
      </div>

      {/* Color Palette Section */}
      <section id="colors" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Settings01Icon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Color Palette
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Purple - Primary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Purple (Primary)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {[50, 100, 500, 600, 700, 900].map((shade) => (
                    <div key={shade} className="space-y-1">
                      <div className={`h-16 rounded-md bg-purple-${shade} border border-gray-200`} />
                      <p className="text-xs text-gray-600 text-center">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emerald - Success */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Emerald (Success)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 500, 600, 700].map((shade) => (
                    <div key={shade} className="space-y-1">
                      <div className={`h-16 rounded-md bg-emerald-${shade} border border-gray-200`} />
                      <p className="text-xs text-gray-600 text-center">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orange - Warning */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Orange (Warning)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 500, 600, 700].map((shade) => (
                    <div key={shade} className="space-y-1">
                      <div className={`h-16 rounded-md bg-orange-${shade} border border-gray-200`} />
                      <p className="text-xs text-gray-600 text-center">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red - Error */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Red (Error)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 500, 600, 700].map((shade) => (
                    <div key={shade} className="space-y-1">
                      <div className={`h-16 rounded-md bg-red-${shade} border border-gray-200`} />
                      <p className="text-xs text-gray-600 text-center">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gray - Neutral */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Gray (Neutral)</h3>
                <div className="grid grid-cols-6 gap-2">
                  {[50, 100, 200, 400, 600, 900].map((shade) => (
                    <div key={shade} className="space-y-1">
                      <div className={`h-16 rounded-md bg-gray-${shade} border border-gray-200`} />
                      <p className="text-xs text-gray-600 text-center">{shade}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Components Section */}
      <section id="components" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={GridIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Panel Component
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <p className="text-sm text-gray-600 mb-4">
              The Panel component is the foundation for all card-like containers.
              It enforces border-based design with no shadows.
            </p>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
              <pre className="text-xs text-gray-700 overflow-x-auto">
                {`<Panel>
  <PanelHeader>Header Content</PanelHeader>
  <PanelContent>Main Content</PanelContent>
  <PanelFooter>Footer Content</PanelFooter>
</Panel>`}
              </pre>
            </div>

            {/* Example Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel>
                <PanelHeader>
                  <h4 className="text-sm font-semibold text-gray-900">Basic Panel</h4>
                </PanelHeader>
                <PanelContent>
                  <p className="text-sm text-gray-600">
                    This is a basic panel with header and content.
                  </p>
                </PanelContent>
              </Panel>

              <Panel>
                <PanelHeader>
                  <div className="flex items-center justify-between w-full">
                    <h4 className="text-sm font-semibold text-gray-900">Panel with Actions</h4>
                    <button className="text-xs text-purple-600 hover:text-purple-700">
                      Action
                    </button>
                  </div>
                </PanelHeader>
                <PanelContent>
                  <p className="text-sm text-gray-600">
                    Panel with action button in header.
                  </p>
                </PanelContent>
              </Panel>
            </div>
          </PanelContent>
          <PanelFooter>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Border-based • No shadows</span>
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                View Docs →
              </button>
            </div>
          </PanelFooter>
        </Panel>
      </section>

      {/* Form Inputs Section */}
      <section id="inputs" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={NoteIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Form Elements
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Text Input</h3>
                <Input
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Standard height: h-9 (36px) • Corners: rounded-md
                </p>
              </div>

              {/* Input with Icons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Input with Icons</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Search..."
                    leftIcon={<HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-400" />}
                  />
                  <Input
                    placeholder="Enter email..."
                    type="email"
                    rightIcon={<HugeiconsIcon icon={Mail01Icon} size={14} className="text-gray-400" />}
                  />
                </div>
              </div>

              {/* Select Dropdown */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Dropdown</h3>
                <select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600">
                  <option>Select an option...</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              {/* Textarea */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Textarea</h3>
                <textarea
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-600 resize-none"
                  rows={4}
                  placeholder="Enter description..."
                />
              </div>

              {/* Checkbox */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Checkbox</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-900">Checked option</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-900">Unchecked option</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-purple-600"
                      disabled
                    />
                    <span className="text-sm text-gray-900">Disabled option</span>
                  </label>
                </div>
              </div>

              {/* Radio Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Radio Buttons</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="radio-example"
                      className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-900">Option 1</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="radio-example"
                      className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-900">Option 2</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="radio-example"
                      className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-600 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-900">Option 3</span>
                  </label>
                </div>
              </div>

              {/* Form Layout Example */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Form Layout Example</h3>
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Role
                    </label>
                    <select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm">
                      <option>Select role...</option>
                      <option>Admin</option>
                      <option>Technician</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-sm text-gray-900">Send welcome email</span>
                  </label>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`// Text Input
<Input placeholder="Search..." />

// Select
<select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm">
  <option>Select...</option>
</select>

// Checkbox
<input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600" />

// Radio
<input type="radio" className="w-4 h-4 border-gray-300 text-purple-600" />`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Badges Section */}
      <section id="badges" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={TagIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Badge Components
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Basic Badges */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Badge Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="purple">Purple</Badge>
                  <Badge variant="green">Green</Badge>
                  <Badge variant="blue">Blue</Badge>
                  <Badge variant="orange">Orange</Badge>
                  <Badge variant="red">Red</Badge>
                  <Badge variant="yellow">Yellow</Badge>
                  <Badge variant="gray">Gray</Badge>
                </div>
              </div>

              {/* Status Badges */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status="Open" />
                  <StatusBadge status="Confirmation" />
                  <StatusBadge status="Ready" />
                  <StatusBadge status="In Progress" />
                  <StatusBadge status="Completed" />
                  <StatusBadge status="On Hold" />
                  <StatusBadge status="Cancelled" />
                </div>
              </div>

              {/* Priority Badges */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <PriorityBadge priority="Critical" />
                  <PriorityBadge priority="High" />
                  <PriorityBadge priority="Medium" />
                  <PriorityBadge priority="Low" />
                </div>
              </div>

              {/* Design Notes */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">Design Standards</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Rectangular shape with rounded corners (4px)</li>
                      <li>• Border-based design for definition</li>
                      <li>• Consistent padding: px-2 py-0.5</li>
                      <li>• Text size: text-xs (12px)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`<Badge variant="purple">Active</Badge>
<StatusBadge status="In Progress" />
<PriorityBadge priority="High" />`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Layouts Section */}
      <section id="layouts" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={GridIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Layout Components
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* MasterDetailLayout */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">MasterDetailLayout</h3>
                <p className="text-sm text-gray-600 mb-3">
                  3-column layout for list-based pages (Work Orders, Assets, Inventory)
                </p>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex gap-2 h-32">
                    <div className="w-20 bg-purple-100 border border-purple-200 rounded flex items-center justify-center">
                      <span className="text-xs text-purple-700 font-medium">Sidebar</span>
                    </div>
                    <div className="w-32 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                      <span className="text-xs text-blue-700 font-medium">List</span>
                    </div>
                    <div className="flex-1 bg-emerald-100 border border-emerald-200 rounded flex items-center justify-center">
                      <span className="text-xs text-emerald-700 font-medium">Detail</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {`<MasterDetailLayout
  sidebar={<ProfessionalSidebar />}
  list={<ItemList />}
  detail={<ItemDetail />}
/>`}
                  </pre>
                </div>
              </div>

              {/* TwoColumnLayout */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">TwoColumnLayout</h3>
                <p className="text-sm text-gray-600 mb-3">
                  2-column layout for content pages (Dashboard, Reports, Settings)
                </p>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <div className="flex gap-2 h-32">
                    <div className="w-20 bg-purple-100 border border-purple-200 rounded flex items-center justify-center">
                      <span className="text-xs text-purple-700 font-medium">Sidebar</span>
                    </div>
                    <div className="flex-1 bg-emerald-100 border border-emerald-200 rounded flex items-center justify-center">
                      <span className="text-xs text-emerald-700 font-medium">Content</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {`<TwoColumnLayout
  sidebar={<ProfessionalSidebar />}
  content={<PageContent />}
/>`}
                  </pre>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Utilities Section */}
      <section id="utilities" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Wrench01Icon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                CSS Utility Classes
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* List Row */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">List Row Pattern</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="list-row">
                    <h4 className="text-sm font-semibold text-gray-900">Normal List Item</h4>
                    <p className="text-xs text-gray-500">Hover to see effect</p>
                  </div>
                  <div className="list-row list-row-active">
                    <h4 className="text-sm font-semibold">Active List Item</h4>
                    <p className="text-xs text-gray-500">Selected state</p>
                  </div>
                  <div className="list-row">
                    <h4 className="text-sm font-semibold text-gray-900">Another Item</h4>
                    <p className="text-xs text-gray-500">Click to select</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700">
                    {`<div className="list-row">Normal</div>
<div className="list-row list-row-active">Active</div>`}
                  </pre>
                </div>
              </div>

              {/* Info Bar */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Info Bar Pattern</h3>
                <div className="info-bar">
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={UserIcon} size={14} className="text-blue-600" />
                    <span className="text-gray-500">Customer:</span>
                    <span className="font-medium text-gray-900">John Doe</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={Car01Icon} size={14} className="text-purple-600" />
                    <span className="text-gray-500">Asset:</span>
                    <span className="font-medium text-gray-900">ABC-123</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={Calendar01Icon} size={14} className="text-emerald-600" />
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-900">Dec 21, 2024</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {`<div className="info-bar">
  <div className="info-bar-item">...</div>
  <div className="info-bar-divider" />
  <div className="info-bar-item">...</div>
</div>`}
                  </pre>
                </div>
              </div>

              {/* Empty State */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Empty State Pattern</h3>
                <div className="border border-gray-200 rounded-md">
                  <div className="empty-state">
                    <HugeiconsIcon icon={InboxIcon} size={24} className="empty-state-icon" />
                    <p className="text-sm font-medium text-gray-900 mb-1">No Items Found</p>
                    <p className="empty-state-text">Try adjusting your filters</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700">
                    {`<div className="empty-state">
  <Icon className="empty-state-icon" />
  <p className="empty-state-text">Message</p>
</div>`}
                  </pre>
                </div>
              </div>

              {/* Stat Card */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Stat Card Pattern</h3>
                <div className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl mt-1 font-bold text-gray-900">1,234</p>
                      <p className="text-xs mt-1 text-gray-500">+12% vs last week</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <HugeiconsIcon icon={ClipboardIcon} size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-3">
                  <pre className="text-xs text-gray-700">
                    {`<div className="stat-card">
  {/* Metric content */}
</div>`}
                  </pre>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Stat Ribbon Section */}
      <section id="stat-ribbon" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={TimelineIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Stat Ribbon Pattern
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Stat Ribbon Example */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Stat Ribbon (Merged Bar)</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use this pattern instead of floating stat cards for a more integrated, enterprise look.
                  Perfect for page headers and overview sections.
                </p>

                {/* Example Stat Ribbon */}
                <div className="info-bar">
                  <div className="info-bar-item">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-semibold text-gray-900">8</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <span className="text-gray-500">Operational:</span>
                    <span className="font-semibold text-emerald-700">6</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <span className="text-gray-500">Maintenance:</span>
                    <span className="font-semibold text-orange-700">2</span>
                  </div>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">With Status Icons</h3>
                <div className="info-bar">
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={ClipboardIcon} size={14} className="text-blue-600" />
                    <span className="text-gray-500">Work Orders:</span>
                    <span className="font-semibold text-gray-900">24</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600" />
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-semibold text-emerald-700">18</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={Clock01Icon} size={14} className="text-orange-600" />
                    <span className="text-gray-500">In Progress:</span>
                    <span className="font-semibold text-orange-700">4</span>
                  </div>
                  <div className="info-bar-divider" />
                  <div className="info-bar-item">
                    <HugeiconsIcon icon={Alert01Icon} size={14} className="text-red-600" />
                    <span className="text-gray-500">Overdue:</span>
                    <span className="font-semibold text-red-700">2</span>
                  </div>
                </div>
              </div>

              {/* Component Pattern */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recommended Component Pattern</h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {`// Recommended: Create reusable components
<StatGroup>
  <StatItem label="Total" value="8" />
  <StatItem label="Operational" value="6" color="emerald" />
  <StatItem label="Maintenance" value="2" color="orange" />
</StatGroup>

// Or using the CSS utility classes directly:
<div className="info-bar">
  <div className="info-bar-item">
    <span className="text-gray-500">Total:</span>
    <span className="font-semibold text-gray-900">8</span>
  </div>
  <div className="info-bar-divider" />
  <div className="info-bar-item">
    <span className="text-gray-500">Operational:</span>
    <span className="font-semibold text-emerald-700">6</span>
  </div>
</div>`}
                  </pre>
                </div>
              </div>

              {/* Design Guidelines */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-2">Stat Ribbon Guidelines</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• <strong>Use instead of floating cards</strong> for a more integrated look</li>
                      <li>• Perfect for page headers and overview sections</li>
                      <li>• Maintains horizontal flow and visual connection</li>
                      <li>• Use color-coded values for status (emerald=good, orange=warning, red=critical)</li>
                      <li>• Keep labels short and values prominent</li>
                      <li>• Add icons for better visual hierarchy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* When to Use */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={StarIcon} size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-2">When to Use Stat Ribbon vs Stat Cards</p>
                    <div className="text-xs text-blue-700 space-y-2">
                      <div>
                        <p className="font-medium">✅ Use Stat Ribbon for:</p>
                        <ul className="ml-3 space-y-0.5">
                          <li>• Page headers (Work Orders, Assets, etc.)</li>
                          <li>• Quick overview stats</li>
                          <li>• Related metrics that should be grouped</li>
                          <li>• When space is limited</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">📊 Use Stat Cards for:</p>
                        <ul className="ml-3 space-y-0.5">
                          <li>• Dashboard main metrics</li>
                          <li>• When each metric needs more detail/context</li>
                          <li>• Clickable metrics that navigate to details</li>
                          <li>• When you have ample space</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Typography Section */}
      <section id="typography" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={NoteIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Typography Scale
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Headings */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Headings</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-600 pl-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Heading 1 - 3xl (30px)</h1>
                    <code className="text-xs text-gray-500">text-3xl font-bold • Page titles</code>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">Heading 2 - 2xl (24px)</h2>
                    <code className="text-xs text-gray-500">text-2xl font-semibold • Section titles</code>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Heading 3 - xl (20px)</h3>
                    <code className="text-xs text-gray-500">text-xl font-semibold • Subsection titles</code>
                  </div>
                  <div className="border-l-4 border-purple-300 pl-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Heading 4 - lg (18px)</h4>
                    <code className="text-xs text-gray-500">text-lg font-semibold • Card titles</code>
                  </div>
                  <div className="border-l-4 border-purple-200 pl-4">
                    <h5 className="text-base font-semibold text-gray-900 mb-1">Heading 5 - base (16px)</h5>
                    <code className="text-xs text-gray-500">text-base font-semibold • Small card titles</code>
                  </div>
                </div>
              </div>

              {/* Body Text */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Body Text</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-base text-gray-900 mb-1">
                      Base text (16px) - Used for primary content and longer paragraphs.
                      This is the default readable size for body content.
                    </p>
                    <code className="text-xs text-gray-500">text-base • Primary content</code>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 mb-1">
                      Small text (14px) - Most common size for UI elements, table cells, and compact content.
                    </p>
                    <code className="text-xs text-gray-500">text-sm • UI elements, tables</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Extra small text (12px) - Used for labels, captions, and secondary information.
                    </p>
                    <code className="text-xs text-gray-500">text-xs • Labels, captions</code>
                  </div>
                </div>
              </div>

              {/* Text Colors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Text Colors</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">Primary text - text-gray-900</p>
                  <p className="text-sm text-gray-700">Secondary text - text-gray-700</p>
                  <p className="text-sm text-gray-600">Tertiary text - text-gray-600</p>
                  <p className="text-sm text-gray-500">Muted text - text-gray-500</p>
                  <p className="text-sm text-gray-400">Disabled text - text-gray-400</p>
                  <div className="flex gap-4 mt-3">
                    <p className="text-sm text-purple-600">Purple accent - text-purple-600</p>
                    <p className="text-sm text-emerald-600">Success - text-emerald-600</p>
                    <p className="text-sm text-orange-600">Warning - text-orange-600</p>
                    <p className="text-sm text-red-600">Error - text-red-600</p>
                  </div>
                </div>
              </div>

              {/* Labels & Overlines */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Labels & Overlines</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
                      Section Header
                    </p>
                    <code className="text-xs text-gray-500">text-xs font-semibold uppercase tracking-wide</code>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Form Label</p>
                    <code className="text-xs text-gray-500">text-xs font-medium</code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Helper Text</p>
                    <code className="text-xs text-gray-500">text-xs text-gray-500</code>
                  </div>
                </div>
              </div>

              {/* Font Weights */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Font Weights</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-normal text-gray-900">Normal (400)</p>
                    <code className="text-xs text-gray-500">font-normal</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Medium (500)</p>
                    <code className="text-xs text-gray-500">font-medium</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Semibold (600)</p>
                    <code className="text-xs text-gray-500">font-semibold</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">Bold (700)</p>
                    <code className="text-xs text-gray-500">font-bold</code>
                  </div>
                </div>
              </div>

              {/* Line Heights */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Line Heights</h3>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-md p-3">
                    <p className="text-sm leading-tight text-gray-900 mb-1">
                      Tight line height (1.25) - Used for headings and compact text.
                    </p>
                    <code className="text-xs text-gray-500">leading-tight</code>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3">
                    <p className="text-sm leading-normal text-gray-900 mb-1">
                      Normal line height (1.5) - Default for most body text and UI elements.
                    </p>
                    <code className="text-xs text-gray-500">leading-normal</code>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3">
                    <p className="text-sm leading-relaxed text-gray-900 mb-1">
                      Relaxed line height (1.625) - Used for longer paragraphs and improved readability.
                    </p>
                    <code className="text-xs text-gray-500">leading-relaxed</code>
                  </div>
                </div>
              </div>

              {/* Usage Examples */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-2">Typography Guidelines</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Page titles: text-2xl or text-3xl font-semibold/bold</li>
                      <li>• Section headers: text-xs font-semibold uppercase tracking-wide</li>
                      <li>• Body content: text-sm text-gray-900</li>
                      <li>• Labels: text-xs font-medium text-gray-700</li>
                      <li>• Helper text: text-xs text-gray-500</li>
                      <li>• Table headers: text-xs font-semibold uppercase</li>
                      <li>• Buttons: text-sm font-medium</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Buttons Section */}
      <section id="buttons" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Search01Icon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Button Components
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Primary Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    <HugeiconsIcon icon={Add01Icon} size={16} />
                    Create New
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    Save Changes
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors" disabled>
                    <HugeiconsIcon icon={Loading01Icon} size={16} className="animate-spin" />
                    Loading...
                  </button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Secondary Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                    <HugeiconsIcon icon={RefreshIcon} size={16} />
                    Refresh
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                    Cancel
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-md cursor-not-allowed" disabled>
                    Disabled
                  </button>
                </div>
              </div>

              {/* Danger Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Danger Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                    Delete
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md transition-colors">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                    Remove
                  </button>
                </div>
              </div>

              {/* Icon Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Icon Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex items-center justify-center w-9 h-9 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                    <HugeiconsIcon icon={Edit01Icon} size={16} />
                  </button>
                  <button className="inline-flex items-center justify-center w-9 h-9 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                  </button>
                  <button className="inline-flex items-center justify-center w-9 h-9 text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                  </button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    Small
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    Medium
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                    Large
                  </button>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`// Primary Button
<button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
  <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
  Create New
</button>

// Secondary Button
<button className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
  Cancel
</button>`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Data Table Section */}
      <section id="data-table" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={GridIcon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Data Table
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Table Example */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Standard Data Table</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Work Order
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Asset
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Priority
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">WO-2024-001</td>
                        <td className="px-4 py-3 text-sm text-gray-600">ABC-123</td>
                        <td className="px-4 py-3">
                          <StatusBadge status="In Progress" />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority="High" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Dec 25, 2024</td>
                        <td className="px-4 py-3 text-right">
                          <button className="inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">WO-2024-002</td>
                        <td className="px-4 py-3 text-sm text-gray-600">XYZ-789</td>
                        <td className="px-4 py-3">
                          <StatusBadge status="Open" />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority="Medium" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Dec 28, 2024</td>
                        <td className="px-4 py-3 text-right">
                          <button className="inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">WO-2024-003</td>
                        <td className="px-4 py-3 text-sm text-gray-600">DEF-456</td>
                        <td className="px-4 py-3">
                          <StatusBadge status="Completed" />
                        </td>
                        <td className="px-4 py-3">
                          <PriorityBadge priority="Low" />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">Dec 20, 2024</td>
                        <td className="px-4 py-3 text-right">
                          <button className="inline-flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Design Notes */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-1">Table Design Standards</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Header: bg-gray-50 with uppercase text-xs font-semibold</li>
                      <li>• Rows: hover:bg-gray-50 for interactivity</li>
                      <li>• Borders: border-gray-200 for table, divide-gray-100 for rows</li>
                      <li>• Padding: px-4 py-3 for cells</li>
                      <li>• Text: text-sm for content, font-medium for primary column</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`<table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wide">
        Column Name
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-100">
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-600">Cell Content</td>
    </tr>
  </tbody>
</table>`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Notification Badges Section */}
      <section id="notification-badges" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Notification01Icon} size={14} className="text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Notification Badges
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Badge Counters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Counter Badges</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="relative inline-flex">
                    <button className="inline-flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                      <HugeiconsIcon icon={Notification01Icon} size={20} />
                    </button>
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-600 rounded-full border-2 border-white">
                      3
                    </span>
                  </div>

                  <div className="relative inline-flex">
                    <button className="inline-flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                      <HugeiconsIcon icon={MessageIcon} size={20} />
                    </button>
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-purple-600 rounded-full border-2 border-white">
                      12
                    </span>
                  </div>

                  <div className="relative inline-flex">
                    <button className="inline-flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                      <HugeiconsIcon icon={ClipboardIcon} size={20} />
                    </button>
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-orange-600 rounded-full border-2 border-white">
                      99+
                    </span>
                  </div>
                </div>
              </div>

              {/* Dot Indicators */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Dot Indicators</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="relative inline-flex">
                    <button className="inline-flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                      <HugeiconsIcon icon={Notification01Icon} size={20} />
                    </button>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
                  </div>

                  <div className="relative inline-flex">
                    <button className="inline-flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors">
                      <HugeiconsIcon icon={MessageIcon} size={20} />
                    </button>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-600 rounded-full border-2 border-white"></span>
                  </div>
                </div>
              </div>

              {/* Inline Badges */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Inline Notification Badges</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={InboxIcon} className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Inbox</span>
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                      5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Starred</span>
                    <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full border border-purple-200">
                      23
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={InboxIcon} className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-900">Archive</span>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`// Counter Badge
<div className="relative inline-flex">
  <button>Icon</button>
  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-600 rounded-full border-2 border-white">
    3
  </span>
</div>

// Dot Indicator
<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Icons Section */}
      <section id="icons" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={StarIcon} className="w-3.5 h-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Icon Sizing Standards
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Icon Sizes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Standard Sizes</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon icon={HomeIcon} className="w-3 h-3 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">w-3 h-3 (12px)</p>
                      <p className="text-xs text-gray-500">Tiny indicators, inline icons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon icon={HomeIcon} className="w-3.5 h-3.5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">w-3.5 h-3.5 (14px)</p>
                      <p className="text-xs text-gray-500">Content icons, badges, section headers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon icon={HomeIcon} className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">w-4 h-4 (16px)</p>
                      <p className="text-xs text-gray-500">Navigation icons, buttons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon icon={HomeIcon} className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">w-5 h-5 (20px)</p>
                      <p className="text-xs text-gray-500">Collapsed sidebar icons</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <HugeiconsIcon icon={HomeIcon} className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">w-6 h-6 (24px)</p>
                      <p className="text-xs text-gray-500">Large buttons, metric cards</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Icons */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Common Icons</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { icon: HomeIcon, label: 'Home' },
                    { icon: ClipboardIcon, label: 'Work Orders' },
                    { icon: PackageIcon, label: 'Assets' },
                    { icon: UserIcon, label: 'Technicians' },
                    { icon: Search01Icon, label: 'Search' },
                    { icon: Settings01Icon, label: 'Settings' },
                    { icon: Calendar01Icon, label: 'Calendar' },
                    { icon: TimelineIcon, label: 'Reports' },
                    { icon: Notification01Icon, label: 'Notifications' },
                    { icon: UserIcon, label: 'User' },
                    { icon: Tick01Icon, label: 'Check' },
                    { icon: Cancel01Icon, label: 'Close' },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-md hover:border-purple-300 hover:bg-purple-50 transition-colors">
                      <HugeiconsIcon icon={item.icon} className="w-6 h-6 text-gray-600" />
                      <span className="text-xs text-gray-600 text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Icon Library</p>
                    <p className="text-xs text-blue-700">
                      We use Hugeicons via @hugeicons/react. Browse all icons at{' '}
                      <a href="https://hugeicons.com" target="_blank" rel="noopener noreferrer" className="underline">
                        hugeicons.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Loading States Section */}
      <section id="loading" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Loading01Icon} className="w-3.5 h-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Loading States
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Spinners */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Spinners</h3>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Small (24px)</p>
                  </div>
                  <div className="text-center">
                    <HugeiconsIcon icon={Loading01Icon} className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Medium (32px)</p>
                  </div>
                  <div className="text-center">
                    <HugeiconsIcon icon={Loading01Icon} className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Large (48px)</p>
                  </div>
                </div>
              </div>

              {/* Skeleton Loaders */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Skeleton Loaders</h3>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
              </div>

              {/* Loading Card */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Loading Card Example</h3>
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  </div>
                </div>
              </div>

              {/* Full Page Loading */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Full Page Loading</h3>
                <div className="border border-gray-200 rounded-lg p-8 bg-gray-50">
                  <div className="flex flex-col items-center justify-center">
                    <HugeiconsIcon icon={Loading01Icon} className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-sm text-gray-600">Loading dashboard...</p>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`// Spinner
<HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 text-purple-600 animate-spin" />

// Skeleton
<div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>

// Loading State
{isLoading ? (
  <HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 animate-spin" />
) : (
  <Content />
)}`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Alerts & Messages Section */}
      <section id="alerts" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-3.5 h-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Alerts & Messages
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-4">
              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Information</p>
                    <p className="text-xs text-blue-700">
                      This is an informational message to provide context or helpful tips.
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Alert */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900 mb-1">Success</p>
                    <p className="text-xs text-emerald-700">
                      Your changes have been saved successfully.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">Warning</p>
                    <p className="text-xs text-orange-700">
                      Please review this information before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-900 mb-1">Error</p>
                    <p className="text-xs text-red-700">
                      An error occurred while processing your request.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alert with Action */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-3">
                  <HugeiconsIcon icon={Idea01Icon} className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-900 mb-1">New Feature Available</p>
                    <p className="text-xs text-purple-700 mb-3">
                      Check out our new reporting dashboard with advanced analytics.
                    </p>
                    <button className="text-xs font-medium text-purple-700 hover:text-purple-800 underline">
                      Learn More →
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {`// Info Alert
<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
  <div className="flex gap-3">
    <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-blue-600" />
    <div>
      <p className="text-sm font-medium text-blue-900">Title</p>
      <p className="text-xs text-blue-700">Message</p>
    </div>
  </div>
</div>`}
                </pre>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>

      {/* Spacing System Section */}
      <section id="spacing" className="scroll-mt-6">
        <Panel>
          <PanelHeader>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={NoteIcon} className="w-3.5 h-3.5 text-gray-500" />
              <h2 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                Spacing System
              </h2>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-6">
              {/* Spacing Scale */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Spacing Scale (4px base)</h3>
                <div className="space-y-3">
                  {[
                    { class: 'p-1', size: '4px', name: '1' },
                    { class: 'p-2', size: '8px', name: '2' },
                    { class: 'p-3', size: '12px', name: '3' },
                    { class: 'p-4', size: '16px', name: '4' },
                    { class: 'p-6', size: '24px', name: '6' },
                    { class: 'p-8', size: '32px', name: '8' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className="w-20 text-xs font-mono text-gray-600">{item.class}</div>
                      <div className="flex-1 bg-gray-100 rounded">
                        <div className={cn('bg-purple-200 rounded', item.class)}>
                          <div className="bg-purple-500 h-6 rounded"></div>
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-500 text-right">{item.size}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gap Spacing */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Gap Spacing</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">gap-2 (8px)</p>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-purple-200 rounded"></div>
                      <div className="w-12 h-12 bg-purple-200 rounded"></div>
                      <div className="w-12 h-12 bg-purple-200 rounded"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">gap-4 (16px)</p>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-200 rounded"></div>
                      <div className="w-12 h-12 bg-emerald-200 rounded"></div>
                      <div className="w-12 h-12 bg-emerald-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Border Radius</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-200 rounded mx-auto mb-2"></div>
                    <p className="text-xs font-medium text-gray-900">rounded (4px)</p>
                    <p className="text-xs text-gray-500">Badges</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-200 rounded-md mx-auto mb-2"></div>
                    <p className="text-xs font-medium text-gray-900">rounded-md (6px)</p>
                    <p className="text-xs text-gray-500">Inputs, Buttons</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-200 rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs font-medium text-gray-900">rounded-lg (8px)</p>
                    <p className="text-xs text-gray-500">Panels, Cards</p>
                  </div>
                </div>
              </div>

              {/* Usage Guidelines */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900 mb-2">Spacing Guidelines</p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>• Component padding: p-3 or p-4</li>
                      <li>• Section spacing: space-y-4 or space-y-6</li>
                      <li>• Element gaps: gap-2 for tight, gap-4 for comfortable</li>
                      <li>• Page margins: p-4 on mobile, p-6 on desktop</li>
                      <li>• Card padding: p-4 for content, p-6 for emphasis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </PanelContent>
        </Panel>
      </section>
    </div>
  );
};

export default DesignSystemDemo;
