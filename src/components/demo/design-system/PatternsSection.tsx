import { Calendar, CheckCircle, ClipboardList, Clock, Info, Plus, User, Package, Car, AlertCircle, MoreVertical, Inbox, Table as TableIcon } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';



const PatternsSection: React.FC = () => {
    return (
        <>
            {/* Utility Patterns */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Utility Patterns
                    </CardTitle>
                    <CardDescription>Common UI patterns for CMMS applications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Info Bar / Stat Ribbon */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Info Bar / Stat Ribbon</h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center divide-x divide-gray-200">
                                    <div className="flex items-center gap-2 px-4 first:pl-0">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-gray-500">Customer:</span>
                                        <span className="text-sm font-medium text-gray-900">John Doe</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4">
                                        <Car className="w-4 h-4 text-primary" />
                                        <span className="text-xs text-gray-500">Asset:</span>
                                        <span className="text-sm font-medium text-gray-900">ABC-123</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4">
                                        <Calendar className="w-4 h-4 text-foreground" />
                                        <span className="text-xs text-gray-500">Date:</span>
                                        <span className="text-sm font-medium text-gray-900">Dec 21, 2024</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stat Ribbon with Metrics */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Stat Ribbon with Metrics</h3>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center divide-x divide-gray-200">
                                    <div className="flex items-center gap-2 px-4 first:pl-0">
                                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-gray-500">Total:</span>
                                        <span className="text-lg font-semibold text-gray-900">24</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4">
                                        <CheckCircle className="w-4 h-4 text-foreground" />
                                        <span className="text-xs text-gray-500">Completed:</span>
                                        <span className="text-lg font-semibold text-foreground">18</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-gray-500">In Progress:</span>
                                        <span className="text-lg font-semibold text-muted-foreground">4</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        <span className="text-xs text-gray-500">Overdue:</span>
                                        <span className="text-lg font-semibold text-destructive">2</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Empty State */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Empty State Pattern</h3>
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Inbox size={48} className="text-gray-400 mb-4" />
                                    <h4 className="text-sm font-medium text-gray-900 mb-1">No Work Orders Found</h4>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Get started by creating your first work order
                                    </p>
                                    <Button size="sm">
                                        <Plus className="w-5 h-5" />
                                        Create Work Order
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stat Card */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Stat Card Pattern</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
                                            <p className="text-xs text-gray-500 mt-1">+12% vs last week</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Completed</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">892</p>
                                            <p className="text-xs text-foreground mt-1">+8% vs last week</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-lg bg-muted text-foreground flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Overdue</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">23</p>
                                            <p className="text-xs text-destructive mt-1">Needs attention</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-lg bg-red-50 text-destructive flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TableIcon className="w-5 h-5" />
                        Enhanced Data Table
                    </CardTitle>
                    <CardDescription>Interactive table with actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </TableHead>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="hover:bg-gray-50">
                                    <TableCell>
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </TableCell>
                                    <TableCell className="font-medium">WO-2024-001</TableCell>
                                    <TableCell>ABC-123</TableCell>
                                    <TableCell>
                                        <Badge variant="status-in-progress">In Progress</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="priority-high">High</Badge>
                                    </TableCell>
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
                                <TableRow className="hover:bg-gray-50">
                                    <TableCell>
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                                    </TableCell>
                                    <TableCell className="font-medium">WO-2024-002</TableCell>
                                    <TableCell>XYZ-789</TableCell>
                                    <TableCell>
                                        <Badge variant="status-open">Open</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="priority-medium">Medium</Badge>
                                    </TableCell>
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
                </CardContent>
            </Card>

            {/* List Row Pattern */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        List Row Pattern
                    </CardTitle>
                    <CardDescription>Selectable list items with hover states</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Work Order #1234</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Assigned to John Doe • Due Dec 25</p>
                                </div>
                                <Badge variant="status-in-progress">In Progress</Badge>
                            </div>
                        </div>
                        <div className="p-3 border-b border-gray-100 bg-primary/5 border-l-4 border-l-purple-600 cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Work Order #1235</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Assigned to Jane Smith • Due Dec 26</p>
                                </div>
                                <Badge variant="status-open">Open</Badge>
                            </div>
                        </div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">Work Order #1236</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Assigned to Bob Johnson • Due Dec 27</p>
                                </div>
                                <Badge variant="status-completed">Completed</Badge>
                            </div>
                        </div>
                    </div>
                    <Alert className="mt-4">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <AlertTitle>List Row States</AlertTitle>
                        <AlertDescription>
                            Normal state has hover effect. Selected state (middle item) has purple background and left border.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </>
    );
};

export default PatternsSection;



