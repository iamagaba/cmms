# 🧩 Component Reference Guide

## Overview

This guide provides comprehensive usage examples for all components in our design system, built on **shadcn/ui** with custom layout components for consistent patterns.

---

## 🎨 shadcn/ui Components

### Card Components

#### Basic Card

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ✅ Standard Card Pattern
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Card content goes here</p>
  </CardContent>
</Card>

// ✅ Compact Card (no header)
<Card>
  <CardContent className="p-4">
    <h3 className="text-base font-medium mb-2">Title</h3>
    <p className="text-sm text-muted-foreground">Content</p>
  </CardContent>
</Card>

// ✅ Card with Actions
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Work Order #1234</CardTitle>
      <Badge variant="warning">In Progress</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p className="text-sm">Maintenance required for Asset #5678</p>
  </CardContent>
</Card>
```

#### Card Variants

```tsx
// ✅ Hover Card
<Card className="hover:shadow-md transition-shadow cursor-pointer">
  <CardContent>
    <p>Clickable card content</p>
  </CardContent>
</Card>

// ✅ Selected Card
<Card className={cn(
  "transition-colors",
  isSelected && "border-primary bg-accent"
)}>
  <CardContent>
    <p>Selectable card content</p>
  </CardContent>
</Card>
```

### Button Components

#### Button Variants

```tsx
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

// ✅ Primary Actions
<Button variant="default">Save Changes</Button>
<Button variant="default" size="sm">
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// ✅ Secondary Actions
<Button variant="outline">Cancel</Button>
<Button variant="outline" size="sm">
  <Edit className="w-4 h-4 mr-2" />
  Edit
</Button>

// ✅ Tertiary Actions
<Button variant="ghost">View Details</Button>
<Button variant="ghost" size="sm">
  <Eye className="w-4 h-4" />
</Button>

// ✅ Destructive Actions
<Button variant="destructive">Delete</Button>
<Button variant="destructive" size="sm">
  <Trash2 className="w-4 h-4 mr-2" />
  Remove
</Button>
```

#### Button Groups

```tsx
// ✅ Button Group Pattern
<div className="flex items-center gap-2">
  <Button variant="default">Save</Button>
  <Button variant="outline">Cancel</Button>
</div>

// ✅ Icon Button Group
<div className="flex items-center gap-1">
  <Button variant="ghost" size="sm">
    <Edit className="w-4 h-4" />
  </Button>
  <Button variant="ghost" size="sm">
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
```

### Badge Components

#### Status Badges

```tsx
import { Badge } from '@/components/ui/badge';

// ✅ Standard Variants
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="destructive">Error</Badge>

// ✅ Custom Status Variants (if configured)
<Badge variant="success">Completed</Badge>
<Badge variant="warning">In Progress</Badge>
<Badge variant="info">Information</Badge>

// ✅ Usage in Context
<div className="flex items-center justify-between">
  <h3 className="text-sm font-medium">Work Order #1234</h3>
  <Badge variant="warning">In Progress</Badge>
</div>
```

### Form Components

#### Input Fields

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// ✅ Basic Input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email..." 
  />
</div>

// ✅ Form Field with Validation
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email Address</FormLabel>
      <FormControl>
        <Input 
          placeholder="Enter your email..." 
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ✅ Input with Icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
  <Input 
    placeholder="Search..." 
    className="pl-10" 
  />
</div>
```

#### Select Fields

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ✅ Basic Select
<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Choose an option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// ✅ Form Select Field
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Textarea Fields

```tsx
import { Textarea } from '@/components/ui/textarea';

// ✅ Basic Textarea
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea 
    id="description"
    placeholder="Enter description..."
    rows={4}
  />
</div>

// ✅ Form Textarea
<FormField
  control={form.control}
  name="notes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Notes</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="Add notes..."
          rows={3}
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Dialog Components

#### Basic Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// ✅ Standard Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Optional description of what this dialog does.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

#### Form Dialog

```tsx
// ✅ Dialog with Form
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Asset</DialogTitle>
      <DialogDescription>
        Add a new asset to your inventory.
      </DialogDescription>
    </DialogHeader>
    <Form>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter asset name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">
            Create Asset
          </Button>
        </div>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### Table Components

#### Basic Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ✅ Standard Table
<Card>
  <CardHeader>
    <CardTitle>Work Orders</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono text-xs">
              {order.id}
            </TableCell>
            <TableCell className="font-medium">
              {order.title}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {order.assigned_to}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

## 🏗️ Custom Layout Components

### PageHeader

```tsx
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus, Download } from 'lucide-react';

// ✅ Basic Page Header
<PageHeader 
  title="Work Orders"
  subtitle="Manage and track maintenance requests"
/>

// ✅ Page Header with Actions
<PageHeader 
  title="Assets"
  subtitle="Track and manage your equipment"
  actions={
    <>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Add Asset
      </Button>
    </>
  }
/>

// ✅ Page Header with Icon
<PageHeader 
  title="Inventory"
  subtitle="Parts and supplies management"
  icon={<Package className="w-5 h-5" />}
  actions={
    <Button variant="outline">
      <Settings className="w-4 h-4 mr-2" />
      Settings
    </Button>
  }
/>
```

### MasterListShell

```tsx
import { MasterListShell } from '@/components/layout/MasterListShell';
import { MasterListRow } from '@/components/layout/MasterListRow';

// ✅ Basic Master List
<MasterListShell
  title="Work Orders"
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search work orders..."
>
  {workOrders.map(order => (
    <MasterListRow
      key={order.id}
      title={order.title}
      subtitle={order.asset_name}
      badge={{ text: order.status, variant: getStatusVariant(order.status) }}
      onClick={() => setSelectedOrder(order)}
      isSelected={selectedOrder?.id === order.id}
    />
  ))}
</MasterListShell>

// ✅ Master List with Create Action
<MasterListShell
  title="Assets"
  subtitle={`${assets.length} total assets`}
  searchValue={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search assets..."
  onCreateNew={() => setShowCreateDialog(true)}
  createButtonText="Add Asset"
  itemCount={filteredAssets.length}
>
  {filteredAssets.map(asset => (
    <MasterListRow
      key={asset.id}
      title={asset.name}
      subtitle={asset.license_plate}
      description={asset.description}
      icon={<Package className="w-4 h-4" />}
      badge={{ text: asset.status, variant: getStatusVariant(asset.status) }}
      onClick={() => setSelectedAsset(asset)}
      isSelected={selectedAsset?.id === asset.id}
      metadata={[
        { label: 'Type', value: asset.type },
        { label: 'Location', value: asset.location }
      ]}
    />
  ))}
</MasterListShell>
```

### MasterListRow

```tsx
import { MasterListRow } from '@/components/layout/MasterListRow';
import { Package, MapPin, Calendar } from 'lucide-react';

// ✅ Basic List Row
<MasterListRow
  title="Asset Name"
  subtitle="Asset Description"
  onClick={() => handleSelect(asset)}
/>

// ✅ List Row with Badge
<MasterListRow
  title="Work Order #1234"
  subtitle="Brake maintenance required"
  badge={{ text: "In Progress", variant: "warning" }}
  onClick={() => handleSelect(workOrder)}
  isSelected={isSelected}
/>

// ✅ List Row with Icon and Metadata
<MasterListRow
  title="Vehicle ABC-123"
  subtitle="2020 Ford Transit"
  description="Regular maintenance vehicle for downtown routes"
  icon={<Package className="w-4 h-4" />}
  badge={{ text: "Active", variant: "success" }}
  onClick={() => handleSelect(vehicle)}
  metadata={[
    { 
      label: 'Location', 
      value: 'Downtown Depot',
      icon: <MapPin className="w-3 h-3" />
    },
    { 
      label: 'Last Service', 
      value: '2 days ago',
      icon: <Calendar className="w-3 h-3" />
    }
  ]}
/>

// ✅ List Row with Custom Content
<MasterListRow
  title="Custom Item"
  subtitle="With additional content"
  onClick={() => handleSelect(item)}
>
  <div className="mt-2 flex items-center gap-2">
    <div className="w-full bg-muted rounded-full h-2">
      <div 
        className="bg-primary h-2 rounded-full" 
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="text-xs text-muted-foreground">{progress}%</span>
  </div>
</MasterListRow>
```

### EmptyState

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Package, Search, Plus } from 'lucide-react';

// ✅ Basic Empty State
<EmptyState
  icon={<Package className="w-6 h-6" />}
  title="No assets found"
  description="There are no assets in your inventory yet."
/>

// ✅ Empty State with Action
<EmptyState
  icon={<Package className="w-6 h-6" />}
  title="No assets found"
  description="Get started by adding your first asset to the system."
  action={
    <Button onClick={() => setShowCreateDialog(true)}>
      <Plus className="w-4 h-4 mr-2" />
      Add Asset
    </Button>
  }
/>

// ✅ Search Results Empty State
<EmptyState
  icon={<Search className="w-6 h-6" />}
  title="No results found"
  description={`No assets match "${searchQuery}". Try adjusting your search terms.`}
  action={
    <Button variant="outline" onClick={() => setSearchQuery('')}>
      Clear Search
    </Button>
  }
/>

// ✅ Selection Empty State
<EmptyState
  icon={<Package className="w-6 h-6" />}
  title="Select an asset"
  description="Choose an asset from the list to view its details and manage work orders."
/>
```

---

## 📊 Data Display Patterns

### Stats Cards

```tsx
// ✅ Stat Card Pattern
<Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Total Assets
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {totalAssets}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          +12% from last month
        </p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Package className="w-5 h-5 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>

// ✅ Status Stat Card
<Card>
  <CardContent className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Open Work Orders
        </p>
        <p className="text-2xl font-bold text-foreground mt-1">
          {openWorkOrders}
        </p>
      </div>
      <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Progress Indicators

```tsx
// ✅ Progress Bar
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Completion Progress</span>
    <span className="text-muted-foreground">{progress}%</span>
  </div>
  <div className="w-full bg-muted rounded-full h-2">
    <div 
      className="bg-primary h-2 rounded-full transition-all duration-300" 
      style={{ width: `${progress}%` }}
    />
  </div>
</div>

// ✅ Status Progress
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Inventory Level</span>
    <span className={cn(
      "text-xs font-medium",
      isLow ? "text-amber-600" : "text-emerald-600"
    )}>
      {isLow ? "Low Stock" : "In Stock"}
    </span>
  </div>
  <div className="w-full bg-muted rounded-full h-2">
    <div 
      className={cn(
        "h-2 rounded-full transition-all duration-300",
        isLow ? "bg-amber-500" : "bg-emerald-500"
      )}
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

---

## 🎯 Navigation Patterns

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ✅ Basic Tabs
<Tabs defaultValue="overview" className="space-y-4">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview" className="space-y-4">
    <Card>
      <CardContent className="p-6">
        <p>Overview content goes here</p>
      </CardContent>
    </Card>
  </TabsContent>
  
  <TabsContent value="details" className="space-y-4">
    <Card>
      <CardContent className="p-6">
        <p>Details content goes here</p>
      </CardContent>
    </Card>
  </TabsContent>
  
  <TabsContent value="history" className="space-y-4">
    <Card>
      <CardContent className="p-6">
        <p>History content goes here</p>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
```

### Dropdown Menus

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// ✅ Action Dropdown
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm">
      Actions
      <ChevronDown className="w-4 h-4 ml-2" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleEdit()}>
      <Edit className="w-4 h-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleDuplicate()}>
      <Copy className="w-4 h-4 mr-2" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuItem 
      onClick={() => handleDelete()}
      className="text-destructive focus:text-destructive"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 🎨 Layout Patterns

### Page Layout

```tsx
// ✅ Standard Page Layout
<div className="space-y-6">
  <PageHeader 
    title="Page Title"
    subtitle="Page description"
    actions={<Button>Primary Action</Button>}
  />
  
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Stats Cards */}
    <Card>
      <CardContent className="p-4">
        {/* Stat content */}
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        {/* Stat content */}
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4">
        {/* Stat content */}
      </CardContent>
    </Card>
  </div>
  
  <Card>
    <CardHeader>
      <CardTitle>Main Content</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Main content */}
    </CardContent>
  </Card>
</div>
```

### Master-Detail Layout

```tsx
// ✅ Master-Detail Pattern
<div className="flex h-screen overflow-hidden">
  <MasterListShell
    title="Items"
    searchValue={searchQuery}
    onSearchChange={setSearchQuery}
    onCreateNew={() => setShowCreateDialog(true)}
  >
    {items.map(item => (
      <MasterListRow
        key={item.id}
        title={item.name}
        subtitle={item.description}
        onClick={() => setSelectedItem(item)}
        isSelected={selectedItem?.id === item.id}
      />
    ))}
  </MasterListShell>
  
  <div className="flex-1 overflow-auto">
    {selectedItem ? (
      <div className="p-6 space-y-6">
        <PageHeader 
          title={selectedItem.name}
          subtitle={selectedItem.description}
        />
        <Card>
          <CardContent>
            {/* Detail content */}
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<Package className="w-6 h-6" />}
          title="Select an item"
          description="Choose an item from the list to view details"
        />
      </div>
    )}
  </div>
</div>
```

---

## 🔧 Utility Patterns

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// ✅ Card Loading State
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-1/2" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </CardContent>
</Card>

// ✅ List Loading State
<div className="space-y-3">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="flex items-center gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  ))}
</div>
```

### Error States

```tsx
// ✅ Error Card
<Card>
  <CardContent className="text-center p-6">
    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-destructive" />
    </div>
    <h3 className="text-base font-medium text-foreground mb-1">
      Something went wrong
    </h3>
    <p className="text-sm text-muted-foreground mb-4">
      We couldn't load the data. Please try again.
    </p>
    <Button onClick={() => refetch()}>
      Try Again
    </Button>
  </CardContent>
</Card>
```

---

## 📱 Responsive Patterns

### Mobile-First Grid

```tsx
// ✅ Responsive Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>
      <CardContent className="p-4">
        {/* Card content */}
      </CardContent>
    </Card>
  ))}
</div>

// ✅ Responsive Stats
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <Card key={stat.label}>
      <CardContent className="p-4">
        {/* Stat content */}
      </CardContent>
    </Card>
  ))}
</div>
```

---

## 📚 Resources

### Component Files
- `src/components/ui/` - shadcn/ui components
- `src/components/layout/` - Custom layout components
- `src/components/` - Application-specific components

### Documentation
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs)

---

**Last Updated**: January 28, 2026  
**Version**: 1.0.0  
**Status**: Complete Reference Guide