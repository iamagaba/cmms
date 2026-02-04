import { Info, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";



const LoadingStatesSection: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <RefreshCw className="w-5 h-5" />
                    Loading States
                </CardTitle>
                <CardDescription className="text-primary">
                    Comprehensive loading patterns for better user experience
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Button Loading */}
                <div className="bg-white rounded-lg border border-primary/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Button Loading States</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-600 mb-3">Primary action with spinner:</p>
                            <Button disabled onClick={() => setIsLoading(!isLoading)}>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Saving...
                            </Button>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-3">Secondary action loading:</p>
                            <Button variant="outline" disabled>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Processing...
                            </Button>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-3">Success action loading:</p>
                            <Button variant="success" disabled>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Completing...
                            </Button>
                        </div>
                        <div className="mt-4 bg-primary/5 p-3 rounded border border-primary/20">
                            <code className="text-xs text-muted-foreground">
                                {`<Button disabled>
  <RefreshCw className="w-4 h-4 animate-spin" />
  Saving...
</Button>`}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Skeleton Loading */}
                <div className="bg-white rounded-lg border border-primary/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Skeleton Loaders</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-600 mb-3">Card skeleton:</p>
                            <Card>
                                <CardContent className="pt-6 space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-3">Table row skeleton:</p>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="mt-4 bg-primary/5 p-3 rounded border border-primary/20">
                            <code className="text-xs text-muted-foreground">
                                {`<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />`}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Full Page Loading */}
                <div className="bg-white rounded-lg border border-primary/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Full Page Loading</h3>
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center justify-center">
                                    <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                                    <p className="text-sm font-medium text-gray-900">Loading work orders...</p>
                                    <p className="text-xs text-gray-500 mt-1">Please wait</p>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="mt-4 bg-primary/5 p-3 rounded border border-primary/20">
                            <code className="text-xs text-muted-foreground">
                                {`<div className="flex flex-col items-center justify-center h-64">
  <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
  <p className="text-sm text-gray-600 mt-4">Loading...</p>
</div>`}
                            </code>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Loading */}
                <div className="bg-white rounded-lg border border-primary/20 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Progress Bar Loading</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Uploading files...</span>
                                <span className="text-sm text-gray-500">65%</span>
                            </div>
                            <Progress value={65} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">Processing data...</span>
                                <span className="text-sm text-gray-500">30%</span>
                            </div>
                            <Progress value={30} />
                        </div>
                    </div>
                </div>

                <Alert className="border-primary/30 bg-primary/10">
                    <Info className="w-4 h-4 text-primary" />
                    <AlertTitle className="text-foreground">Loading State Best Practices</AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Always show loading state for actions taking &gt;300ms</li>
                            <li>Use skeleton loaders for initial page loads</li>
                            <li>Use spinners for button actions</li>
                            <li>Use progress bars for file uploads or long processes</li>
                            <li>Disable buttons during loading to prevent double-clicks</li>
                            <li>Provide context: "Saving..." not just "Loading..."</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default LoadingStatesSection;


