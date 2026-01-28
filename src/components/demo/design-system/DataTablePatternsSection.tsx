import { ArrowLeft, CheckCircle, Plus, Table, MoreVertical, Inbox, ChevronRight } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const DataTablePatternsSection: React.FC = () => {
    return (
        <Card className="border-violet-200 bg-violet-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-violet-900">
                    <Table className="w-5 h-5" />
                    Data Table Patterns
                </CardTitle>
                <CardDescription className="text-violet-700">
                    Comprehensive table patterns for CMMS data management
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Basic Table Structure */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Basic Table Structure</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">ID</TableHead>
                                    <TableHead className="min-w-[200px]">Title</TableHead>
                                    <TableHead className="min-w-[120px]">Status</TableHead>
                                    <TableHead className="min-w-[120px]">Priority</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">WO-001</TableCell>
                                    <TableCell>Replace brake pads</TableCell>
                                    <TableCell><Badge variant="status-in-progress">In Progress</Badge></TableCell>
                                    <TableCell><Badge variant="priority-high">High</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">WO-002</TableCell>
                                    <TableCell>Oil change service</TableCell>
                                    <TableCell><Badge variant="status-open">Open</Badge></TableCell>
                                    <TableCell><Badge variant="priority-medium">Medium</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 bg-violet-50 p-3 rounded border border-violet-200">
                        <p className="text-xs font-semibold text-violet-900 mb-2">Column Width Guidelines:</p>
                        <ul className="text-xs text-violet-800 space-y-1 ml-4 list-disc">
                            <li><code>w-[100px]</code> - ID columns, short codes</li>
                            <li><code>min-w-[200px]</code> - Names, titles (allow expansion)</li>
                            <li><code>min-w-[120px]</code> - Status, priority, dates</li>
                            <li><code>w-[100px]</code> - Actions column (fixed width)</li>
                        </ul>
                    </div>
                </div>

                {/* Table with Selection */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Table with Row Selection</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </TableHead>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="bg-primary/5">
                                    <TableCell>
                                        <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                                    </TableCell>
                                    <TableCell className="font-medium">WO-2024-001</TableCell>
                                    <TableCell>ABC-123</TableCell>
                                    <TableCell><Badge variant="status-open">Open</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <input type="checkbox" className="rounded border-gray-300" />
                                    </TableCell>
                                    <TableCell className="font-medium">WO-2024-002</TableCell>
                                    <TableCell>XYZ-789</TableCell>
                                    <TableCell><Badge variant="status-completed">Completed</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-3 bg-primary/10 border border-purple-300 rounded p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-purple-900">1 item selected</span>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">Assign Technician</Button>
                                <Button size="sm" variant="outline">Change Status</Button>
                                <Button size="sm" variant="destructive">Delete</Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty Table State */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Empty Table State</h3>
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Inbox className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No work orders found</h3>
                                <p className="text-xs text-gray-600 mt-1">Create your first work order to get started</p>
                                <Button size="sm" className="mt-4">
                                    <Plus className="w-5 h-5" />
                                    Create Work Order
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <p className="text-xs text-gray-600 mt-3">
                        Don't show table headers when there's no data - show empty state instead.
                    </p>
                </div>

                {/* Table Loading State */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Table Loading State</h3>
                    <div className="border rounded-lg overflow-hidden">
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
                                {[1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                        Show skeleton rows (5-10) while loading. Keep table structure visible.
                    </p>
                </div>

                {/* Mobile Responsive Table */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Mobile Responsive Table</h3>
                    <div className="overflow-x-auto">
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[120px]">Work Order</TableHead>
                                        <TableHead className="min-w-[100px]">Asset</TableHead>
                                        <TableHead className="min-w-[120px]">Status</TableHead>
                                        <TableHead className="min-w-[100px]">Priority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">WO-2024-001</TableCell>
                                        <TableCell>ABC-123</TableCell>
                                        <TableCell><Badge variant="status-in-progress">In Progress</Badge></TableCell>
                                        <TableCell><Badge variant="priority-high">High</Badge></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className="mt-4 bg-violet-50 p-3 rounded border border-violet-200">
                        <code className="text-xs text-violet-800">
                            {`<div className="overflow-x-auto">
  <Table>
    <TableHead className="min-w-[120px]">...</TableHead>
  </Table>
</div>`}
                        </code>
                    </div>
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-lg border border-violet-200 p-4">
                    <h3 className="text-sm font-semibold text-violet-900 mb-4">Table Pagination</h3>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing 1-10 of 247 results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" disabled>
                                <ArrowLeft className="w-5 h-5" />
                                Previous
                            </Button>
                            <div className="flex gap-1">
                                <Button size="sm" variant="default">1</Button>
                                <Button size="sm" variant="outline">2</Button>
                                <Button size="sm" variant="outline">3</Button>
                                <span className="px-2 flex items-center text-gray-500">...</span>
                                <Button size="sm" variant="outline">25</Button>
                            </div>
                            <Button size="sm" variant="outline">
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <Alert className="border-violet-300 bg-violet-100">
                    <CheckCircle className="w-4 h-4 text-violet-700" />
                    <AlertTitle className="text-violet-900">Data Table Best Practices</AlertTitle>
                    <AlertDescription className="text-violet-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use fixed width for ID and action columns</li>
                            <li>Use min-width for content columns (allows expansion)</li>
                            <li>Show skeleton rows while loading (don't hide table)</li>
                            <li>Show empty state when no data (hide table headers)</li>
                            <li>Use checkboxes for multi-select, show bulk actions</li>
                            <li>Use dropdown menu for 3+ row actions</li>
                            <li>Add horizontal scroll on mobile with min-width columns</li>
                            <li>Include pagination for large datasets</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default DataTablePatternsSection;




