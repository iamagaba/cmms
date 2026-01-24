import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    SmartPhone01Icon,
    InformationCircleIcon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Settings02Icon,
    MoreVerticalIcon
} from "@hugeicons/core-free-icons";

const TouchTargetSizesSection: React.FC = () => {
    return (
        <Card className="border-rose-200 bg-rose-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-900">
                    <HugeiconsIcon icon={SmartPhone01Icon} size={20} />
                    Touch Target Sizes
                </CardTitle>
                <CardDescription className="text-rose-700">
                    Minimum sizes for mobile usability and accessibility
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Minimum Touch Targets */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Minimum Touch Target Sizes</h3>
                    <div className="space-y-4">
                        <Alert>
                            <HugeiconsIcon icon={InformationCircleIcon} size={16} className="text-blue-600" />
                            <AlertTitle>WCAG 2.1 Guideline</AlertTitle>
                            <AlertDescription className="text-xs">
                                Touch targets should be at least 44x44 pixels (iOS) or 48x48 pixels (Android) for accessibility compliance.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                                <div className="w-11 h-11 bg-emerald-600 rounded flex items-center justify-center text-white">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">44x44px (Minimum)</p>
                                    <p className="text-xs text-gray-600">iOS guideline, WCAG compliant</p>
                                </div>
                                <code className="text-xs text-emerald-700 bg-white px-2 py-1 rounded">h-11 w-11</code>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded border border-emerald-200">
                                <div className="w-12 h-12 bg-emerald-600 rounded flex items-center justify-center text-white">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">48x48px (Recommended)</p>
                                    <p className="text-xs text-gray-600">Android guideline, more comfortable</p>
                                </div>
                                <code className="text-xs text-emerald-700 bg-white px-2 py-1 rounded">h-12 w-12</code>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-red-50 rounded border border-red-200">
                                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white">
                                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">32x32px (Too Small)</p>
                                    <p className="text-xs text-gray-600">Not accessible, hard to tap</p>
                                </div>
                                <code className="text-xs text-red-700 bg-white px-2 py-1 rounded">h-8 w-8</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Button Heights */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Button Heights</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <Button size="sm" className="h-8">Small (32px)</Button>
                            <div className="flex-1">
                                <p className="text-xs text-gray-600">Desktop only - too small for mobile</p>
                                <code className="text-xs text-gray-500">h-8 (32px)</code>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button size="default" className="h-9">Default (36px)</Button>
                            <div className="flex-1">
                                <p className="text-xs text-gray-600">Standard height for Nova style</p>
                                <code className="text-xs text-gray-500">h-9 (36px)</code>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button size="lg" className="h-12">Large (48px)</Button>
                            <div className="flex-1">
                                <p className="text-xs text-gray-600">Recommended for mobile, comfortable for all</p>
                                <code className="text-xs text-gray-500">h-12 (48px)</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Input Heights */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Input Field Heights</h3>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label>Desktop Input (36px)</Label>
                            <Input placeholder="Default height" className="h-9" />
                            <p className="text-xs text-gray-600">Good for desktop, minimum for mobile</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile-Optimized Input (48px)</Label>
                            <Input placeholder="Larger height" className="h-12" />
                            <p className="text-xs text-gray-600">Recommended for mobile forms</p>
                        </div>
                    </div>
                </div>

                {/* Icon Buttons */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Icon Button Sizes</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <Button size="icon" variant="outline" className="h-9 w-9">
                                <HugeiconsIcon icon={Settings02Icon} size={16} />
                            </Button>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Default (36x36px)</p>
                                <p className="text-xs text-gray-600">Standard for desktop</p>
                                <code className="text-xs text-gray-500">h-9 w-9</code>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button size="icon" variant="outline" className="h-12 w-12">
                                <HugeiconsIcon icon={Settings02Icon} size={20} />
                            </Button>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Large (48x48px)</p>
                                <p className="text-xs text-gray-600">Recommended for mobile, comfortable</p>
                                <code className="text-xs text-gray-500">h-12 w-12</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Row Heights */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Table Row Heights</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Work Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="h-11">
                                    <TableCell className="font-medium">WO-001</TableCell>
                                    <TableCell><Badge variant="status-open">Open</Badge></TableCell>
                                    <TableCell>
                                        <Button size="icon" variant="ghost" className="h-10 w-10">
                                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow className="h-11">
                                    <TableCell className="font-medium">WO-002</TableCell>
                                    <TableCell><Badge variant="status-completed">Completed</Badge></TableCell>
                                    <TableCell>
                                        <Button size="icon" variant="ghost" className="h-10 w-10">
                                            <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-3 bg-rose-50 p-3 rounded border border-rose-200">
                        <p className="text-xs text-rose-800">
                            Use <code>min-h-[44px]</code> on table rows for mobile. Ensure action buttons are at least 40x40px.
                        </p>
                    </div>
                </div>

                {/* Spacing Between Targets */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Spacing Between Touch Targets</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-3">Too Close (Hard to Tap)</p>
                            <div className="flex gap-1">
                                <Button size="sm">Button 1</Button>
                                <Button size="sm">Button 2</Button>
                                <Button size="sm">Button 3</Button>
                            </div>
                            <p className="text-xs text-red-600 mt-2">❌ Only 4px gap - easy to mis-tap</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-3">Good Spacing (Easy to Tap)</p>
                            <div className="flex gap-3">
                                <Button size="default">Button 1</Button>
                                <Button size="default">Button 2</Button>
                                <Button size="default">Button 3</Button>
                            </div>
                            <p className="text-xs text-emerald-600 mt-2">✅ 12px gap - comfortable spacing</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Adjustments */}
                <div className="bg-white rounded-lg border border-rose-200 p-4">
                    <h3 className="text-sm font-semibold text-rose-900 mb-4">Responsive Touch Target Adjustments</h3>
                    <div className="space-y-3">
                        <div className="bg-rose-50 p-3 rounded border border-rose-200">
                            <p className="text-sm font-medium text-rose-900 mb-2">Desktop</p>
                            <code className="text-xs text-rose-700">
                                {`<Button className="h-9">Save</Button>`}
                            </code>
                            <p className="text-xs text-gray-600 mt-2">40px height is fine for mouse interaction</p>
                        </div>
                        <div className="bg-rose-50 p-3 rounded border border-rose-200">
                            <p className="text-sm font-medium text-rose-900 mb-2">Mobile (Responsive)</p>
                            <code className="text-xs text-rose-700">
                                {`<Button className="h-9 md:h-12">Save</Button>`}
                            </code>
                            <p className="text-xs text-gray-600 mt-2">48px height on mobile for better touch targets</p>
                        </div>
                    </div>
                </div>

                <Alert className="border-rose-300 bg-rose-100">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="text-rose-700" />
                    <AlertTitle className="text-rose-900">Touch Target Best Practices</AlertTitle>
                    <AlertDescription className="text-rose-800">
                        <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
                            <li>Minimum 44x44px for all interactive elements (WCAG 2.1)</li>
                            <li>Recommended 48x48px for comfortable mobile experience</li>
                            <li>Use h-9 (36px) as standard for buttons and inputs (Nova style)</li>
                            <li>Use h-12 (48px) for mobile-optimized buttons</li>
                            <li>Add at least 8-12px spacing between touch targets</li>
                            <li>Increase button heights on mobile with responsive classes</li>
                            <li>Test on real devices - simulator isn't enough</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
};

export default TouchTargetSizesSection;
