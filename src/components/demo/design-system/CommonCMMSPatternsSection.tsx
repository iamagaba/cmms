import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HugeiconsIcon } from '@hugeicons/react';
import { ClipboardIcon, Add01Icon, RefreshIcon, MoreVerticalIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';

const CommonCMMSPatternsSection: React.FC = () => {
    return (
        <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <HugeiconsIcon icon={ClipboardIcon} size={20} />
                    Common CMMS Patterns
                </CardTitle>
                <CardDescription className="text-emerald-700">
                    Real-world examples for your maintenance management workflows
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pattern 1: Work Order Creation */}
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={Add01Icon} size={16} />
                        Pattern: Work Order Creation
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-emerald-800">
                            Use a Dialog with a form for creating new work orders. Include validation and clear CTAs.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <HugeiconsIcon icon={Add01Icon} size={14} />
                                        Create Work Order
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Work Order</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details to create a maintenance work order
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="wo-title">Title *</Label>
                                            <Input id="wo-title" placeholder="e.g., Replace brake pads" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="wo-asset">Asset *</Label>
                                            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Select asset...</option>
                                                <option>Vehicle ABC-123</option>
                                                <option>Equipment XYZ-789</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="wo-priority">Priority</Label>
                                            <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                                <option>Medium</option>
                                                <option>Low</option>
                                                <option>High</option>
                                                <option>Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Create Work Order</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Pattern 2: Status Update */}
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={RefreshIcon} size={16} />
                        Pattern: Quick Status Update
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-emerald-800">
                            Use a Dropdown Menu for quick status changes without opening a full dialog.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700">Current Status:</span>
                                <Badge variant="status-open">Open</Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            Change Status
                                            <HugeiconsIcon icon={RefreshIcon} size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Badge variant="status-in-progress" className="mr-2">In Progress</Badge>
                                            Start Work
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Badge variant="status-on-hold" className="mr-2">On Hold</Badge>
                                            Put On Hold
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Badge variant="status-completed" className="mr-2">Completed</Badge>
                                            Mark Complete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pattern 3: Dashboard Stats */}
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={ClipboardIcon} size={16} />
                        Pattern: Dashboard Metrics
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-emerald-800">
                            Use Stat Ribbons for compact metrics or Stat Cards for detailed dashboard views.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-200 space-y-3">
                            <div>
                                <p className="text-xs font-medium text-emerald-900 mb-2">Stat Ribbon (Compact):</p>
                                <Card>
                                    <CardContent className="pt-4">
                                        <div className="flex items-center divide-x divide-gray-200 text-sm">
                                            <div className="flex items-center gap-2 px-3 first:pl-0">
                                                <span className="text-gray-500">Total:</span>
                                                <span className="font-semibold">24</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3">
                                                <span className="text-gray-500">Open:</span>
                                                <span className="font-semibold text-blue-700">8</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3">
                                                <span className="text-gray-500">Completed:</span>
                                                <span className="font-semibold text-emerald-700">16</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pattern 4: Bulk Actions */}
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                        Pattern: Bulk Actions
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-emerald-800">
                            Use checkboxes in tables with a bulk action dropdown for multi-select operations.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-emerald-800">2 items selected</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            Bulk Actions
                                            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Assign Technician</DropdownMenuItem>
                                        <DropdownMenuItem>Change Priority</DropdownMenuItem>
                                        <DropdownMenuItem>Export Selected</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">Delete Selected</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pattern 5: Attribute Data Grid */}
                <div className="bg-white rounded-lg border border-emerald-200 p-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={ClipboardIcon} size={16} />
                        Pattern: Attribute Data Grid
                    </h3>
                    <div className="space-y-3">
                        <p className="text-xs text-emerald-800">
                            Use a 2-column grid layout within cards for object details (e.g., Asset Specifications) to maximize density and reduce whitespace.
                        </p>
                        <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
                            <Card>
                                <div className="p-4">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Vehicle Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">License Plate</Label>
                                            <p className="text-xs mt-0.5 font-bold">UFY454M</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Make & Model</Label>
                                            <p className="text-xs mt-0.5">TVS EV150</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Year</Label>
                                            <p className="text-xs mt-0.5">2023</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Production Date</Label>
                                            <p className="text-xs mt-0.5">Jul 13, 2025</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CommonCMMSPatternsSection;
