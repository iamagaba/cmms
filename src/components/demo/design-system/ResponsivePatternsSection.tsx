import { CheckCircle, ClipboardList, Info, Settings } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';



const ResponsivePatternsSection: React.FC = () => {
    return (
        <Card className="border-orange-200 bg-muted">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Settings className="w-5 h-5" />
                    Responsive Patterns
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    How components adapt from desktop to mobile (resize your browser to see!)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Responsive Grid */}
                <div>
                    <h3 className="text-sm font-semibold text-orange-900 mb-3">Responsive Grid Layout</h3>
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <p className="text-xs text-orange-800 mb-3">
                            Desktop: 3 columns → Tablet: 2 columns → Mobile: 1 column
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">24</p>
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
                                            <p className="text-2xl font-bold text-gray-900 mt-1">18</p>
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
                                            <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-lg bg-red-50 text-destructive flex items-center justify-center">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-3 bg-muted p-2 rounded text-xs text-orange-800">
                            <code>grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4</code>
                        </div>
                    </div>
                </div>

                {/* Responsive Stack */}
                <div>
                    <h3 className="text-sm font-semibold text-orange-900 mb-3">Responsive Stack (Horizontal → Vertical)</h3>
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <p className="text-xs text-orange-800 mb-3">
                            Desktop: Side by side → Mobile: Stacked vertically
                        </p>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900">Work Order #1234</h4>
                                <p className="text-xs text-gray-500 mt-1">Created on Dec 21, 2024</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">View Details</Button>
                                <Button size="sm">Edit</Button>
                            </div>
                        </div>
                        <div className="mt-3 bg-muted p-2 rounded text-xs text-orange-800">
                            <code>flex flex-col lg:flex-row lg:items-center lg:justify-between</code>
                        </div>
                    </div>
                </div>

                {/* Responsive Table */}
                <div>
                    <h3 className="text-sm font-semibold text-orange-900 mb-3">Responsive Table</h3>
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <p className="text-xs text-orange-800 mb-3">
                            Desktop: Full table → Mobile: Horizontal scroll
                        </p>
                        <div className="overflow-x-auto">
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
                        <div className="mt-3 bg-muted p-2 rounded text-xs text-orange-800">
                            <code>overflow-x-auto</code> wrapper + <code>min-w-[...]</code> on columns
                        </div>
                    </div>
                </div>

                {/* Responsive Dialog */}
                <div>
                    <h3 className="text-sm font-semibold text-orange-900 mb-3">Responsive Dialog</h3>
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <p className="text-xs text-orange-800 mb-3">
                            Desktop: Centered modal → Mobile: Full screen
                        </p>
                        <Alert>
                            <Info className="w-4 h-4 text-muted-foreground" />
                            <AlertTitle>Automatic Behavior</AlertTitle>
                            <AlertDescription className="text-xs">
                                shadcn/ui Dialog automatically adapts to mobile screens. On small screens, it becomes full-screen for better usability.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>

                {/* Responsive Stat Ribbon */}
                <div>
                    <h3 className="text-sm font-semibold text-orange-900 mb-3">Responsive Stat Ribbon</h3>
                    <div className="bg-white rounded-lg border border-orange-200 p-4">
                        <p className="text-xs text-orange-800 mb-3">
                            Desktop: Horizontal → Mobile: Vertical stack
                        </p>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-200 gap-4 md:gap-0">
                                    <div className="flex items-center gap-2 md:px-4 md:first:pl-0">
                                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs text-gray-500">Total:</span>
                                        <span className="text-lg font-semibold text-gray-900">24</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:px-4">
                                        <CheckCircle className="w-4 h-4 text-foreground" />
                                        <span className="text-xs text-gray-500">Completed:</span>
                                        <span className="text-lg font-semibold text-foreground">18</span>
                                    </div>
                                    <div className="flex items-center gap-2 md:px-4">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        <span className="text-xs text-gray-500">Overdue:</span>
                                        <span className="text-lg font-semibold text-destructive">6</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-3 bg-muted p-2 rounded text-xs text-orange-800">
                            <code>flex flex-col md:flex-row md:divide-x</code>
                        </div>
                    </div>
                </div>

                {/* Responsive Tips */}
                <Alert className="border-orange-300 bg-muted">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <AlertTitle className="text-orange-900">Responsive Design Tips</AlertTitle>
                    <AlertDescription className="text-orange-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Use Tailwind breakpoints: <code>sm:</code> (640px), <code>md:</code> (768px), <code>lg:</code> (1024px)</li>
                            <li>Mobile-first approach: Base styles are mobile, add breakpoints for larger screens</li>
                            <li>Test on real devices, not just browser resize</li>
                            <li>Use <code>overflow-x-auto</code> for tables on mobile</li>
                            <li>Stack buttons vertically on mobile with <code>flex-col</code></li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default ResponsivePatternsSection;




