import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Slider } from '@/components/ui/slider';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Settings02Icon,
    PackageIcon,
    PencilEdit01Icon,
    Tag01Icon,
    Table01Icon,
    AlertCircleIcon,
    InformationCircleIcon,
    Clock01Icon,
    Folder01Icon,
    MoreVerticalIcon,
    Add01Icon,
    RefreshIcon,
    Cancel01Icon,
    CheckmarkCircle01Icon,
    Car01Icon,
    UserIcon,
    ClipboardIcon,
    Calendar01Icon,
    Delete01Icon
} from '@hugeicons/core-free-icons';

const CoreComponentsSection: React.FC = () => {
    const [inputValue, setInputValue] = useState('');

    return (
        <>
            {/* Color Palette */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} size={18} />
                        Color Palette
                    </CardTitle>
                    <CardDescription>Industrial color scheme (unchanged from legacy)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
            </Card>

            {/* Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={PackageIcon} size={18} />
                        Button Component
                    </CardTitle>
                    <CardDescription>shadcn/ui Button with custom variants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Button Variants</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Danger</Button>
                            <Button variant="success">Success</Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Button Sizes</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Elements */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                        Form Elements
                    </CardTitle>
                    <CardDescription>Input, Label, and form components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Badges */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Tag01Icon} size={18} />
                        Badge Component
                    </CardTitle>
                    <CardDescription>Status indicators and labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Badge Variants</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                            <Badge variant="outline">Outline</Badge>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Work Order Status</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="status-open">Open</Badge>
                            <Badge variant="status-in-progress">In Progress</Badge>
                            <Badge variant="status-completed">Completed</Badge>
                            <Badge variant="status-on-hold">On Hold</Badge>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Priority Levels</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="priority-critical">Critical</Badge>
                            <Badge variant="priority-high">High</Badge>
                            <Badge variant="priority-medium">Medium</Badge>
                            <Badge variant="priority-low">Low</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Table01Icon} size={18} />
                        Table Component
                    </CardTitle>
                    <CardDescription>Data table with shadcn/ui components</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">WO-2024-001</TableCell>
                                    <TableCell>ABC-123</TableCell>
                                    <TableCell>
                                        <Badge variant="status-in-progress">In Progress</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="priority-high">High</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">WO-2024-002</TableCell>
                                    <TableCell>XYZ-789</TableCell>
                                    <TableCell>
                                        <Badge variant="status-open">Open</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="priority-medium">Medium</Badge>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                        Alert Component
                    </CardTitle>
                    <CardDescription>Contextual feedback messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-blue-600" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            This is an informational message to provide context.
                        </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            An error occurred while processing your request.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Loading States */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Clock01Icon} size={18} />
                        Loading States
                    </CardTitle>
                    <CardDescription>Skeleton loaders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Skeleton Loaders</h3>
                        <div className="space-y-3 max-w-md">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Folder01Icon} size={18} />
                        Tabs Component
                    </CardTitle>
                    <CardDescription>Organize content into tabs</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Overview content goes here.
                            </p>
                        </TabsContent>
                        <TabsContent value="details" className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Detailed information.
                            </p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Extended Color Palette */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} size={18} />
                        Complete Color Palette
                    </CardTitle>
                    <CardDescription>All color scales used in the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
            </Card>

            {/* Typography */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                        Typography Scale
                    </CardTitle>
                    <CardDescription>Text styles and hierarchy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Body Text</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-base text-gray-900 mb-1">
                                    Base text (16px) - Used for primary content and longer paragraphs.
                                </p>
                                <code className="text-xs text-gray-500">text-base • Primary content</code>
                            </div>
                            <div>
                                <p className="text-sm text-gray-900 mb-1">
                                    Small text (14px) - Most common size for UI elements and tables.
                                </p>
                                <code className="text-xs text-gray-500">text-sm • UI elements, tables</code>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">
                                    Extra small text (12px) - Used for labels and captions.
                                </p>
                                <code className="text-xs text-gray-500">text-xs • Labels, captions</code>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Text Colors</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-900">Primary text - text-gray-900</p>
                            <p className="text-sm text-gray-700">Secondary text - text-gray-700</p>
                            <p className="text-sm text-gray-600">Tertiary text - text-gray-600</p>
                            <p className="text-sm text-gray-500">Muted text - text-gray-500</p>
                            <div className="flex gap-4 mt-3">
                                <p className="text-sm text-purple-600">Purple accent</p>
                                <p className="text-sm text-emerald-600">Success</p>
                                <p className="text-sm text-orange-600">Warning</p>
                                <p className="text-sm text-red-600">Error</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Advanced Form Elements */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                        Advanced Form Elements
                    </CardTitle>
                    <CardDescription>Select, textarea, checkbox, and radio components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-md space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="select">Select Dropdown</Label>
                            <select
                                id="select"
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option>Select an option...</option>
                                <option>Option 1</option>
                                <option>Option 2</option>
                                <option>Option 3</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="textarea">Textarea</Label>
                            <textarea
                                id="textarea"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                placeholder="Enter description..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Checkboxes</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                                        defaultChecked
                                    />
                                    <span className="text-sm text-gray-900">Checked option</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                                    />
                                    <span className="text-sm text-gray-900">Unchecked option</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Radio Buttons</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="radio-demo"
                                        className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-600"
                                        defaultChecked
                                    />
                                    <span className="text-sm text-gray-900">Option 1</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="radio-demo"
                                        className="w-4 h-4 border-gray-300 text-purple-600 focus:ring-purple-600"
                                    />
                                    <span className="text-sm text-gray-900">Option 2</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Button Variants Extended */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={PackageIcon} size={18} />
                        Extended Button Variants
                    </CardTitle>
                    <CardDescription>Icon buttons and loading states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Icon Buttons</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button size="icon" variant="outline">
                                <HugeiconsIcon icon={Settings02Icon} size={16} />
                            </Button>
                            <Button size="icon" variant="outline">
                                <HugeiconsIcon icon={RefreshIcon} size={16} />
                            </Button>
                            <Button size="icon" variant="destructive">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Buttons with Icons</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button>
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                                Save Changes
                            </Button>
                            <Button variant="outline">
                                <HugeiconsIcon icon={RefreshIcon} size={16} />
                                Refresh
                            </Button>
                            <Button variant="destructive">
                                <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                Delete
                            </Button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Loading States</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button disabled>
                                <HugeiconsIcon icon={RefreshIcon} size={16} className="animate-spin" />
                                Loading...
                            </Button>
                            <Button variant="outline" disabled>
                                Processing...
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog/Modal */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Add01Icon} size={18} />
                        Dialog Component
                    </CardTitle>
                    <CardDescription>Modal dialogs for forms and confirmations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Dialog</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Open Dialog</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Work Order</DialogTitle>
                                    <DialogDescription>
                                        Fill in the details below to create a new work order.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dialog-title">Title</Label>
                                        <Input id="dialog-title" placeholder="Enter work order title..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dialog-description">Description</Label>
                                        <textarea
                                            id="dialog-description"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="Enter description..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button>Create Work Order</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Alert>
                        <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-blue-600" />
                        <AlertTitle>Accessible by Default</AlertTitle>
                        <AlertDescription>
                            Dialog component includes focus trap, ESC to close, and proper ARIA attributes.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Dropdown Menu */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
                        Dropdown Menu
                    </CardTitle>
                    <CardDescription>Action menus and context menus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Action Menu</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Actions
                                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <HugeiconsIcon icon={PencilEdit01Icon} size={14} className="mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <HugeiconsIcon icon={RefreshIcon} size={14} className="mr-2" />
                                    Refresh
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <HugeiconsIcon icon={Delete01Icon} size={14} className="mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Icon Button Menu</h3>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Assign Technician</DropdownMenuItem>
                                <DropdownMenuItem>Change Status</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            {/* Switch Toggle */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} size={18} />
                        Switch Component
                    </CardTitle>
                    <CardDescription>Toggle switches for boolean settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="notifications">Email Notifications</Label>
                                <p className="text-xs text-gray-500">Receive email updates for work orders</p>
                            </div>
                            <Switch id="notifications" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto-assign">Auto-assign Work Orders</Label>
                                <p className="text-xs text-gray-500">Automatically assign to available technicians</p>
                            </div>
                            <Switch id="auto-assign" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                                <p className="text-xs text-gray-500">Disable new work order creation</p>
                            </div>
                            <Switch id="maintenance-mode" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Clock01Icon} size={18} />
                        Progress Component
                    </CardTitle>
                    <CardDescription>Progress bars for completion tracking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Work Order Progress</span>
                                <span className="text-sm text-gray-500">75%</span>
                            </div>
                            <Progress value={75} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Parts Inventory</span>
                                <span className="text-sm text-gray-500">45%</span>
                            </div>
                            <Progress value={45} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Monthly Target</span>
                                <span className="text-sm text-gray-500">92%</span>
                            </div>
                            <Progress value={92} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Popover */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={InformationCircleIcon} size={18} />
                        Popover Component
                    </CardTitle>
                    <CardDescription>Contextual information and help text</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Open Popover</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm">Work Order Information</h4>
                                    <p className="text-xs text-gray-600">
                                        Work orders track maintenance tasks from creation to completion.
                                        They include asset details, assigned technicians, and parts used.
                                    </p>
                                    <div className="pt-2">
                                        <Button size="sm" className="w-full">Learn More</Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <HugeiconsIcon icon={InformationCircleIcon} size={16} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <p className="text-xs text-gray-600">
                                    This is a small helper text provided in a popover for additional context.
                                </p>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* Accordion */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Folder01Icon} size={18} />
                        Accordion Component
                    </CardTitle>
                    <CardDescription>Collapsible content sections</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is a work order?</AccordionTrigger>
                            <AccordionContent>
                                A work order is a document that provides all the information about a maintenance task and outlines a process for completing that task efficiently.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I assign a technician?</AccordionTrigger>
                            <AccordionContent>
                                Navigate to the work order details, click the "Assign" button, and select a technician from the dropdown menu. The technician will be notified automatically.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I track parts inventory?</AccordionTrigger>
                            <AccordionContent>
                                Yes, the system includes a comprehensive inventory management module where you can track parts, set reorder points, and manage stock levels across multiple locations.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} size={18} />
                        Calendar Component
                    </CardTitle>
                    <CardDescription>Date picker for scheduling</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            className="rounded-md border"
                        />
                    </div>
                    <Alert className="mt-4">
                        <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-blue-600" />
                        <AlertTitle>Date Selection</AlertTitle>
                        <AlertDescription>
                            Use the calendar component for scheduling work orders, setting due dates, and planning maintenance activities.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Command */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} size={18} />
                        Command Component
                    </CardTitle>
                    <CardDescription>Command palette for quick actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Command className="rounded-lg border">
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Work Orders">
                                <CommandItem>
                                    <HugeiconsIcon icon={Add01Icon} size={14} className="mr-2" />
                                    Create New Work Order
                                </CommandItem>
                                <CommandItem>
                                    <HugeiconsIcon icon={ClipboardIcon} size={14} className="mr-2" />
                                    View All Work Orders
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Assets">
                                <CommandItem>
                                    <HugeiconsIcon icon={Car01Icon} size={14} className="mr-2" />
                                    View Assets
                                </CommandItem>
                                <CommandItem>
                                    <HugeiconsIcon icon={Add01Icon} size={14} className="mr-2" />
                                    Add New Asset
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Settings">
                                <CommandItem>
                                    <HugeiconsIcon icon={Settings02Icon} size={14} className="mr-2" />
                                    System Settings
                                </CommandItem>
                                <CommandItem>
                                    <HugeiconsIcon icon={UserIcon} size={14} className="mr-2" />
                                    User Management
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </CardContent>
            </Card>

            {/* Slider */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={Settings02Icon} size={18} />
                        Slider Component
                    </CardTitle>
                    <CardDescription>Range inputs for numeric values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Priority Level</Label>
                                <span className="text-sm text-gray-500">50%</span>
                            </div>
                            <Slider defaultValue={[50]} max={100} step={1} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Budget Allocation</Label>
                                <span className="text-sm text-gray-500">$75,000</span>
                            </div>
                            <Slider defaultValue={[75000]} max={100000} step={1000} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label>Completion Threshold</Label>
                                <span className="text-sm text-gray-500">80%</span>
                            </div>
                            <Slider defaultValue={[80]} max={100} step={5} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default CoreComponentsSection;
